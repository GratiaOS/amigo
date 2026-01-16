use anyhow::Result;
use sqlx::{sqlite::SqlitePoolOptions, Row, SqlitePool};
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

    ensure_schema(&pool).await?;

    Ok(pool)
}

async fn ensure_schema(pool: &SqlitePool) -> Result<()> {
    let columns = sqlx::query("PRAGMA table_info(links)")
        .fetch_all(pool)
        .await?;

    if columns.is_empty() {
        create_links_table(pool).await?;
        return Ok(());
    }

    let mut url_notnull = false;
    let mut has_views = false;
    let mut has_max_views = false;

    for row in columns {
        let name: String = row.try_get("name")?;
        let notnull: i64 = row.try_get("notnull")?;
        if name == "url" {
            url_notnull = notnull == 1;
        }
        if name == "views" {
            has_views = true;
        }
        if name == "max_views" {
            has_max_views = true;
        }
    }

    if url_notnull || !has_views || !has_max_views {
        rebuild_links_table(pool, has_views, has_max_views).await?;
    } else {
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_links_expiry ON links(expires_at)")
            .execute(pool)
            .await?;
    }

    Ok(())
}

async fn create_links_table(pool: &SqlitePool) -> Result<()> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS links (
          slug TEXT PRIMARY KEY,
          url TEXT,
          note TEXT,
          created_at INTEGER NOT NULL,
          expires_at INTEGER,
          views INTEGER DEFAULT 0,
          max_views INTEGER
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query("CREATE INDEX IF NOT EXISTS idx_links_expiry ON links(expires_at)")
        .execute(pool)
        .await?;

    Ok(())
}

async fn rebuild_links_table(pool: &SqlitePool, has_views: bool, has_max_views: bool) -> Result<()> {
    let views_expr = if has_views { "views" } else { "0" };
    let max_views_expr = if has_max_views { "max_views" } else { "NULL" };
    let insert_sql = format!(
        "INSERT INTO links_new (slug, url, note, created_at, expires_at, views, max_views) \
         SELECT slug, url, note, created_at, expires_at, {views_expr}, {max_views_expr} \
         FROM links"
    );

    let mut tx = pool.begin().await?;
    sqlx::query(
        r#"
        CREATE TABLE links_new (
          slug TEXT PRIMARY KEY,
          url TEXT,
          note TEXT,
          created_at INTEGER NOT NULL,
          expires_at INTEGER,
          views INTEGER DEFAULT 0,
          max_views INTEGER
        )
        "#,
    )
    .execute(&mut *tx)
    .await?;

    sqlx::query(&insert_sql).execute(&mut *tx).await?;
    sqlx::query("DROP TABLE links").execute(&mut *tx).await?;
    sqlx::query("ALTER TABLE links_new RENAME TO links")
        .execute(&mut *tx)
        .await?;
    sqlx::query("CREATE INDEX IF NOT EXISTS idx_links_expiry ON links(expires_at)")
        .execute(&mut *tx)
        .await?;
    tx.commit().await?;

    Ok(())
}

pub async fn insert_link(
    pool: &SqlitePool,
    slug: &str,
    url: Option<&str>,
    note: Option<&str>,
    created_at: i64,
    expires_at: Option<i64>,
    max_views: Option<i64>,
) -> Result<()> {
    sqlx::query(
        r#"
        INSERT INTO links (slug, url, note, created_at, expires_at, max_views)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        "#,
    )
    .bind(slug)
    .bind(url)
    .bind(note)
    .bind(created_at)
    .bind(expires_at)
    .bind(max_views)
    .execute(pool)
    .await?;
    Ok(())
}

pub struct LinkRow {
    pub url: Option<String>,
    pub note: Option<String>,
    pub expires_at: Option<i64>,
}

pub async fn get_link(pool: &SqlitePool, slug: &str, now: i64) -> Result<Option<LinkRow>> {
    // Atomic expiry check in DB (Toni Capone style: Contract of Truth)
    // Read-only: No views increment here (moved to commence endpoint)
    let row = sqlx::query_as::<_, (Option<String>, Option<String>, Option<i64>)>(
        r#"
        SELECT url, note, expires_at
        FROM links
        WHERE slug = ?1
          AND (expires_at IS NULL OR expires_at > ?2)
          AND (max_views IS NULL OR views < max_views)
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
    let mut tx = pool.begin().await?;
    let row = sqlx::query_as::<_, (i64, Option<i64>)>(
        r#"
        SELECT COALESCE(views, 0), max_views
        FROM links
        WHERE slug = ?1
          AND (expires_at IS NULL OR expires_at > ?2)
          AND (max_views IS NULL OR views < max_views)
        "#,
    )
    .bind(slug)
    .bind(now)
    .fetch_optional(&mut *tx)
    .await?;

    let Some((views, max_views)) = row else {
        return Ok(false);
    };

    if let Some(limit) = max_views {
        if views + 1 >= limit {
            sqlx::query("DELETE FROM links WHERE slug = ?1")
                .bind(slug)
                .execute(&mut *tx)
                .await?;
            tx.commit().await?;
            return Ok(true);
        }
    }

    sqlx::query(
        r#"
        UPDATE links
        SET views = views + 1
        WHERE slug = ?1
        "#,
    )
    .bind(slug)
    .execute(&mut *tx)
    .await?;
    tx.commit().await?;

    Ok(true)
}
