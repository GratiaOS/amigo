# amigo.sh Deployment Guide

## Architecture
- **API**: Rust/Axum/SQLite on Railway
- **Web**: Next.js on Vercel

---

## Railway (API Service)

### Setup
1. Create new project from GitHub: `GratiaOS/amigo`
2. Set **Root Directory**: `apps/api`
3. Railway auto-detects Rust via `rust-toolchain.toml` and `nixpacks.toml`

### Environment Variables
```bash
# Optional - defaults work for development
BASE_URL=https://your-api-domain.up.railway.app
WEB_BASE_URL=https://your-web-domain.vercel.app
DATABASE_URL=sqlite:amigo.db  # Default: uses working directory
```

### Database Persistence (Optional)
For persistent SQLite across redeploys:
1. Add Volume in Railway dashboard: `/data`
2. Set `DATABASE_URL=sqlite:/data/amigo.db`

---

## Vercel (Web Service)

### Setup
1. Import project from GitHub: `GratiaOS/amigo`
2. Set **Root Directory**: `apps/web`
3. Framework Preset: **Next.js** (auto-detected)

### Build Settings
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Environment Variables
```bash
NEXT_PUBLIC_API_BASE=https://your-api-domain.up.railway.app
```

---

## Post-Deployment

### Update Cross-Service URLs
After both services deploy, update environment variables:

**Railway (API)**:
```bash
BASE_URL=https://amigo-api-production.up.railway.app
WEB_BASE_URL=https://amigo.vercel.app
```

**Vercel (Web)**:
```bash
NEXT_PUBLIC_API_BASE=https://amigo-api-production.up.railway.app
```

Then redeploy both services for changes to take effect.

---

## Testing

### Generate a link (from Web UI)
```
https://amigo.vercel.app
```

### Generate via CLI (curl)
```bash
curl -X POST https://amigo-api-production.up.railway.app/api/dispatch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "note": "Test link", "ttl": "7d"}'
```

### Open short link
```bash
# Browser: Opens Room page with breathing animation
https://amigo-api-production.up.railway.app/abc123

# CLI: Direct redirect (skips Room)
curl -L https://amigo-api-production.up.railway.app/abc123
```

---

## Features

- **Multi-language**: RO (default), EN, ES
- **Proof of Breath**: Views = actual opens, not page loads
- **TTL Support**: Links expire automatically (7d, 24h, 30m)
- **CLI + Room**: CLI gets direct redirect, browsers get breathing Room
- **Mark (🌸)**: Visible breathing animation on Room page

---

## Tech Stack

### API
- Rust 1.82.0
- Axum (web framework)
- SQLx + SQLite
- Tower (middleware)

### Web
- Next.js 14.2.35
- TypeScript
- Vendored i18n (zero deps)

---

Built with 🌸 by the amigo.sh team

Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>
Co-authored-by: Codex Vienna <codex@openai.com>
