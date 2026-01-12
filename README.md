# amigo

## Local

```bash
docker compose up --build
```

- API: http://localhost:3000
- Web: http://localhost:3001

### CLI

```bash
curl -sS -X POST http://localhost:3000/api/dispatch \
  -H 'Content-Type: application/json' \
  -H 'Accept: text/plain' \
  -d '{"url":"https://example.com","note":"Cand ai 5 minute de liniste.","ttl":"7d"}'
```

## Bash function (for .zshrc)

```bash
amigo() {
  local url=""
  local note=""

  if [ ! -t 0 ]; then
    note="$(cat)"
    url="$1"
  else
    url="$1"
    shift
    note="$*"
  fi

  if [ -z "$url" ]; then
    echo "Usage: amigo <url> [note] OR echo 'note' | amigo <url>"
    return 1
  fi

  local payload
  payload=$(python3 -c "import sys, json; print(json.dumps({'url': sys.argv[1], 'note': sys.argv[2], 'ttl': '7d'}))" "$url" "$note")

  curl -sS -X POST "http://localhost:3000/api/dispatch" \
    -H 'Content-Type: application/json' \
    -H 'Accept: text/plain' \
    -A 'amigo-cli' \
    -d "$payload"
}
```

### Smoke test

```bash
echo "Cand ai 5 minute de liniste." | amigo https://example.com
```
