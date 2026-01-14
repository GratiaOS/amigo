use anyhow::Result;
use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};
use std::fs::OpenOptions;
use std::path::Path;

pub async fn connect(database_url: &str) -> Result<SqlitePool> {
    // Ensure parent directory exists for file-based SQLite
    if let Some(file_path) = database_url.strip_prefix("sqlite:") {
        if file_path != ":memory:" && !file_path.is_empty() {
            let path = file_path.split('?').next().unwrap_or(file_path);
            if let Some(parent) = Path::new(path).parent() {
                std::fs::create_dir_all(parent)?;
            }
            // Touch the DB file so SQLite can open it in restrictive envs.
            OpenOptions::new().create(true).write(true).open(path)?;
        }
    }

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(database_url)
        .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS links (
          slug TEXT PRIMARY KEY,
          url TEXT NOT NULL,
          note TEXT,
          created_at INTEGER NOT NULL,
          expires_at INTEGER,
          views INTEGER DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_links_expiry ON links(expires_at);
        "#,
    )
    .execute(&pool)
    .await?;

    ensure_views_column(&pool).await?;

    Ok(pool)
}

async fn ensure_views_column(pool: &SqlitePool) -> Result<()> {
    let res = sqlx::query("ALTER TABLE links ADD COLUMN views INTEGER DEFAULT 0")
        .execute(pool)
        .await;

    if let Err(err) = res {
        let msg = err.to_string();
        if msg.contains("duplicate column") || msg.contains("already exists") {
            return Ok(());
        }
        return Err(err.into());
    }

    Ok(())
}

pub async fn insert_link(
    pool: &SqlitePool,
    slug: &str,
    url: &str,
    note: Option<&str>,
    created_at: i64,
    expires_at: Option<i64>,
) -> Result<()> {
    sqlx::query(
        r#"
        INSERT INTO links (slug, url, note, created_at, expires_at)
        VALUES (?1, ?2, ?3, ?4, ?5)
        "#,
    )
    .bind(slug)
    .bind(url)
    .bind(note)
    .bind(created_at)
    .bind(expires_at)
    .execute(pool)
    .await?;
    Ok(())
}

pub struct LinkRow {
    pub url: String,
    pub note: Option<String>,
    pub expires_at: Option<i64>,
}

pub async fn get_link(pool: &SqlitePool, slug: &str, now: i64) -> Result<Option<LinkRow>> {
    // Atomic expiry check in DB (Toni Capone style: Contract of Truth)
    // Read-only: No views increment here (moved to commence endpoint)
    let row = sqlx::query_as::<_, (String, Option<String>, Option<i64>)>(
        r#"
        SELECT url, note, expires_at
        FROM links
        WHERE slug = ?1
          AND (expires_at IS NULL OR expires_at > ?2)
        "#,
    )
    .bind(slug)
    .bind(now)
    .fetch_optional(pool)
    .await?;

    if let Some((url, note, expires_at)) = row {
        return Ok(Some(LinkRow { url, note, expires_at }));
    }

    Ok(None)
}

// Proof of Breath: Increment views when user actually commences journey
pub async fn commence_journey(pool: &SqlitePool, slug: &str, now: i64) -> Result<bool> {
    let result = sqlx::query(
        r#"
        UPDATE links
        SET views = views + 1
        WHERE slug = ?1
          AND (expires_at IS NULL OR expires_at > ?2)
        "#,
    )
    .bind(slug)
    .bind(now)
    .execute(pool)
    .await?;

    Ok(result.rows_affected() > 0)
}
