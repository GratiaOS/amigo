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

## License

AGPL-3.0-only.

## Philosophy

Signets are presence stamps. They declare tone without narrative.
Sigiliul nu spune o poveste. Deschide o stare.

## Protocol Set

- 🚬 = The Ground (Pauză, Adevăr, Sediment)
- 🐺 = The Pack (Loialitate, Protecție, Instinct)
- 🐸 = The Signal (Croac, Frecvență, Conexiune)
- 🌸 = The Petal (Efemer, Blândețe, Prezent)
- 🦅 = The Vision (Perspectivă, Altitudine, Claritate)
- 🐻 = The Strength (Putere calmă, Hibernare, Grijă)
- 🛰️ = The Channel (Tehnic, Distanță, Transmisie)
- ⚓ = The Anchor (Stabilitate, Buoy, Siguranță)
- 🫧 = The Bubbles (Biluțe, Joacă, Aer)
- 💖 = The Gratia (Grijă, Inimă, Blândețe)
- 👍 = The Yes (Da, Merge, Confirmare)
- 🎵 = The Song (Muzică, Ritm, Drum)

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
  local lang=""
  local emoji=""
  local ttl="7d"

  while getopts ":al:e:t:" opt; do
    case "$opt" in
      a) auto_mode=1 ;;
      l) lang="$OPTARG" ;;
      e) emoji="$OPTARG" ;;
      t) ttl="$OPTARG" ;;
      *)
        echo "Usage: amigo [-a] [-l lang] [-e emoji] [-t ttl] <url> [note]"
        return 1
        ;;
    esac
  done
  shift $((OPTIND-1))

  if [ ! -t 0 ]; then
    note="$(cat)"
    url="$1"
  else
    url="$1"
    shift
    note="$*"
  fi

  if [ -z "$url" ]; then
    echo "Usage: amigo [-a] [-l lang] [-e emoji] [-t ttl] <url> [note]"
    echo "       echo 'note' | amigo [-a] [-l lang] [-e emoji] [-t ttl] <url>"
    echo ""
    echo "Flags:"
    echo "  -a    Ritual mode: Auto-open after breath cycle"
    echo "  -l    Language for share link (en|ro|es)"
    echo "  -e    Override signet emoji"
    echo "  -t    TTL override (default 7d)"
    return 1
  fi

  local payload
  payload=$(python3 - <<'PY' "$url" "$note" "$ttl" "$emoji"
import json,sys
url=sys.argv[1]
note=sys.argv[2].strip()
ttl=sys.argv[3].strip()
emoji=sys.argv[4].strip()
data={"url":url}
if note:
  data["note"]=note
if ttl:
  data["ttl"]=ttl
if emoji:
  data["emoji"]=emoji
print(json.dumps(data))
PY
  )

  local short
  short=$(curl -sS -X POST "http://localhost:3000/api/dispatch" \
    -H 'Content-Type: application/json' \
    -H 'Accept: text/plain' \
    -A 'amigo-cli' \
    -d "$payload")

  short="$(printf "%s" "$short" | tr -d '\n')"
  local qs=""
  if [ "$auto_mode" -eq 1 ]; then
    qs="auto=1"
  fi
  if [ -n "$lang" ]; then
    if [ -n "$qs" ]; then
      qs="${qs}&lang=${lang}"
    else
      qs="lang=${lang}"
    fi
  fi
  if [ -n "$qs" ]; then
    short="${short}?${qs}"
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
