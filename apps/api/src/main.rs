use axum::{
    extract::{Path, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Redirect},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::{
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod db;
mod slug;

#[derive(Clone)]
struct AppState {
    pool: SqlitePool,
    base_url: String,
}

#[derive(Deserialize)]
struct DispatchPayload {
    url: String,
    note: Option<String>,
    ttl: Option<String>, // "7d" (optional)
}

#[derive(Serialize)]
struct DispatchResponse {
    short: String,
    original: String,
    note: Option<String>,
}

#[derive(Serialize)]
struct ResolveResponse {
    url: String,
    note: Option<String>,
    expires_at: Option<i64>,
}

fn now_unix() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}

fn parse_ttl(ttl: Option<&str>) -> Option<i64> {
    // minimal: supports "7d", "24h", "30m" - return seconds
    let ttl = ttl?;
    if ttl.len() < 2 {
        return None;
    }
    let (num, unit) = ttl.split_at(ttl.len() - 1);
    let n: i64 = num.parse().ok()?;
    match unit {
        "d" => Some(n * 24 * 3600),
        "h" => Some(n * 3600),
        "m" => Some(n * 60),
        _ => None,
    }
}

async fn dispatch_link(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(payload): Json<DispatchPayload>,
) -> impl IntoResponse {
    if !(payload.url.starts_with("http://") || payload.url.starts_with("https://")) {
        return (StatusCode::BAD_REQUEST, "invalid url\n").into_response();
    }

    let created_at = now_unix();
    let ttl_secs = parse_ttl(payload.ttl.as_deref()).unwrap_or(7 * 24 * 3600);
    let expires_at = Some(created_at + ttl_secs);

    let mut slug = String::new();
    let mut inserted = false;
    let mut last_err: Option<anyhow::Error> = None;

    for attempt in 0..5 {
        let len = if attempt == 0 { 6 } else { 7 };
        slug = slug::gen_slug(len);
        match db::insert_link(
            &state.pool,
            &slug,
            &payload.url,
            payload.note.as_deref(),
            created_at,
            expires_at,
        )
        .await
        {
            Ok(()) => {
                inserted = true;
                break;
            }
            Err(err) => last_err = Some(err),
        }
    }

    if !inserted {
        if let Some(err) = last_err {
            tracing::error!(error = ?err, "failed to insert link");
        }
        return (StatusCode::INTERNAL_SERVER_ERROR, "create failed\n").into_response();
    }

    let short_link = format!("{}/{}", state.base_url.trim_end_matches('/'), slug);

    // CLI-friendly response if Accept: text/plain OR UA includes curl/wget/httpie
    let accept = headers
        .get(header::ACCEPT)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    let ua = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");

    let ua_lower = ua.to_lowercase();
    let is_cli = accept.contains("text/plain")
        || ua_lower.contains("curl")
        || ua_lower.contains("wget")
        || ua_lower.contains("httpie")
        || ua_lower.contains("amigo");

    if is_cli {
        let mut h = HeaderMap::new();
        h.insert(
            header::CONTENT_TYPE,
            HeaderValue::from_static("text/plain; charset=utf-8"),
        );
        return (StatusCode::OK, h, format!("{short_link}\n")).into_response();
    }

    let body = DispatchResponse {
        short: short_link,
        original: payload.url,
        note: payload.note,
    };
    (StatusCode::OK, Json(body)).into_response()
}

async fn resolve_slug(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> impl IntoResponse {
    let now = now_unix();
    match db::get_link(&state.pool, &slug, now).await {
        Ok(Some(row)) => Redirect::temporary(&row.url).into_response(),
        _ => (StatusCode::NOT_FOUND, "Urma s-a sters.\n").into_response(),
    }
}

async fn resolve_json(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> impl IntoResponse {
    let now = now_unix();
    match db::get_link(&state.pool, &slug, now).await {
        Ok(Some(row)) => (
            StatusCode::OK,
            Json(ResolveResponse {
                url: row.url,
                note: row.note,
                expires_at: row.expires_at,
            }),
        )
            .into_response(),
        _ => (StatusCode::NOT_FOUND, "not-found\n").into_response(),
    }
}

async fn health() -> impl IntoResponse {
    (StatusCode::OK, "ok\n")
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new("info"))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let database_url =
        std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:/data/amigo.db".to_string());
    let base_url = std::env::var("BASE_URL").unwrap_or_else(|_| "http://localhost:3000".to_string());

    let pool = db::connect(&database_url).await?;
    let state = Arc::new(AppState { pool, base_url });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/healthz", get(health))
        .route("/api/dispatch", post(dispatch_link))
        .route("/api/resolve/:slug", get(resolve_json))
        .route("/:slug", get(resolve_slug))
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(state);

    let addr = "0.0.0.0:3000";
    tracing::info!("amigo-api listening on {addr}");
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;
    Ok(())
}
