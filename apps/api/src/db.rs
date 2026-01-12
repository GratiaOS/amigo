use anyhow::Result;
use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};

pub async fn connect(database_url: &str) -> Result<SqlitePool> {
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
          expires_at INTEGER
        );
        "#,
    )
    .execute(&pool)
    .await?;

    Ok(pool)
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
    let row = sqlx::query_as::<_, (String, Option<String>, Option<i64>)>(
        r#"
        SELECT url, note, expires_at
        FROM links
        WHERE slug = ?1
        "#,
    )
    .bind(slug)
    .fetch_optional(pool)
    .await?;

    if let Some((url, note, expires_at)) = row {
        if let Some(exp) = expires_at {
            if exp <= now {
                return Ok(None);
            }
        }
        return Ok(Some(LinkRow { url, note, expires_at }));
    }

    Ok(None)
}
