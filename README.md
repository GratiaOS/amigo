# amigo

amigo.sh = un link cu o nota mica pentru ai tai.
Deschizi -> respiri o secunda -> apoi te duce unde trebuie.
Exemplu: https://amigo.sh/r/abcd12?lang=ro
(si daca e "petal / one-time", se sterge dupa prima deschidere)

amigo.sh — Transport de intentie.
Un URL e util. Un URL + o nota e uman.

Amigo iti lasa:
- sa generezi rapid un link din web sau din terminal (CLI),
- sa atasezi o nota scurta ("pentru tine", "uita-te la asta", "respira"),
- sa deschizi linkul intr-o "Room" calma, inainte de redirect.

Bonus (Petal Mode): mesaje/nota cu deschidere unica — dupa ce a fost citit, urma se sterge.

CLI vibe:
- amigo <url> "nota mea"
- echo "nota mea" | amigo <url>

Quiet tech, warm UX.

## Philosophy

Signets are presence stamps. They declare tone without narrative.
Sigiliul nu spune o poveste. Deschide o stare.

## Local

```bash
docker compose up --build
```

- API: http://localhost:3000
- Web: http://localhost:3001

### Env

API
- DATABASE_URL=sqlite:/app/data/amigo.db
- BASE_URL=http://localhost:3000
- WEB_BASE_URL=http://localhost:3001
- CORS_ALLOW_ORIGINS=https://amigo.sh,http://localhost:3001,http://localhost:3000

Web
- NEXT_PUBLIC_API_BASE=http://localhost:3000

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
  local auto_mode=0

  # Check for -a flag (ritual/auto mode)
  if [[ "$1" == "-a" ]]; then
    auto_mode=1
    shift
  fi

  if [ ! -t 0 ]; then
    note="$(cat)"
    url="$1"
  else
    url="$1"
    shift
    note="$*"
  fi

  if [ -z "$url" ]; then
    echo "Usage: amigo [-a] <url> [note]"
    echo "       echo 'note' | amigo [-a] <url>"
    echo ""
    echo "Flags:"
    echo "  -a    Ritual mode: Auto-open after breath cycle"
    return 1
  fi

  local payload
  payload=$(python3 -c "import sys, json; print(json.dumps({'url': sys.argv[1], 'note': sys.argv[2], 'ttl': '7d'}))" "$url" "$note")

  local short
  short=$(curl -sS -X POST "http://localhost:3000/api/dispatch" \
    -H 'Content-Type: application/json' \
    -H 'Accept: text/plain' \
    -A 'amigo-cli' \
    -d "$payload")

  # Append ?auto=1 for ritual mode
  if [ "$auto_mode" -eq 1 ]; then
    short="${short}?auto=1"
  fi

  echo "$short"

  # Copy to clipboard
  if command -v pbcopy >/dev/null 2>&1; then
    echo -n "$short" | pbcopy
    echo "✨ Copied to clipboard."
  elif command -v xclip >/dev/null 2>&1; then
    echo -n "$short" | xclip -selection clipboard
    echo "✨ Copied to clipboard."
  fi
}
```

### Smoke test

```bash
echo "Cand ai 5 minute de liniste." | amigo https://example.com
```
