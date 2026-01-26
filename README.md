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
- amigo burn <slug>

Quiet tech, warm UX.

## License

AGPL-3.0-only.

## Maintenance

This codebase is a living system.
It is not "updated." It is tended.

We follow a simple rule:
fix where it hurts, then bring it home.

- Bugs are fixed in main first.
- Critical fixes are carried back into supported release branches.
- No silent drift. No forgotten lines.

How we care for the code is documented here:
→ docs/MAINTENANCE.md

## Philosophy

Signets are presence stamps. They declare tone without narrative.
Sigiliul nu spune o poveste. Deschide o stare.

Local, offline, fără priviri străine, fără infrastructuri invizibile.

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
- 📻 = The Song (Muzică, Ritm, Drum)

## Trifoi ☘️ (Phase 1)

Trifoi este vasul rapid (offline-first). Trei moduri. Zero net.

**Run (America approved 🗽):**

```bash
pnpm -C apps/trifoi dev -- --host
```

Build:

```bash
pnpm -C apps/trifoi build
```

## Local

```bash
docker compose up --build
```

- API: http://localhost:3000
- Web: http://localhost:3001

## Run

Nu "pornim un server". Deschidem un spatiu.

Local first. Offline by default.
Fara infrastructuri invizibile. Fara priviri straine.

```bash
docker compose up --build
```

- API: http://localhost:3000
- Web: http://localhost:3001

Trifoi (local / rapid):

```bash
pnpm -C apps/trifoi dev -- --host
```

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

### Field testing (E2E)

```bash
pnpm -C apps/web exec playwright install
pnpm -C apps/web test:e2e
pnpm -C apps/web test:e2e --ui
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
  local command=""

  OPTIND=1
  if [ "$1" = "burn" ]; then
    command="burn"
    shift
  fi

  resolve_lang() {
    case "$lang" in
      ro|en|es) echo "$lang" ;;
      *)
        case "$LANG" in
          ro*|RO*) echo "ro" ;;
          es*|ES*) echo "es" ;;
          *) echo "en" ;;
        esac
        ;;
    esac
  }

  ui_lang="$(resolve_lang)"

  if [ "$ui_lang" = "ro" ]; then
    msg_usage="Utilizare: amigo [-a] [-l lang] [-e emoji] [-t ttl] <url> [note]"
    msg_usage_pipe="       echo 'note' | amigo [-a] [-l lang] [-e emoji] [-t ttl] <url>"
    msg_usage_burn="       amigo burn <slug>"
    msg_copied="Copiat."
    msg_burned="FRECVENTA STEARSA."
    msg_burn_fail="Eroare la burn."
  elif [ "$ui_lang" = "es" ]; then
    msg_usage="Uso: amigo [-a] [-l lang] [-e emoji] [-t ttl] <url> [note]"
    msg_usage_pipe="     echo 'note' | amigo [-a] [-l lang] [-e emoji] [-t ttl] <url>"
    msg_usage_burn="     amigo burn <slug>"
    msg_copied="Copiado."
    msg_burned="FRECUENCIA BORRADA."
    msg_burn_fail="Error al quemar."
  else
    msg_usage="Usage: amigo [-a] [-l lang] [-e emoji] [-t ttl] <url> [note]"
    msg_usage_pipe="       echo 'note' | amigo [-a] [-l lang] [-e emoji] [-t ttl] <url>"
    msg_usage_burn="       amigo burn <slug>"
    msg_copied="Copied."
    msg_burned="FREQUENCY CLEARED."
    msg_burn_fail="Burn failed."
  fi

  local api_base="${AMIGO_API_BASE:-http://localhost:3000}"

  while getopts ":al:e:t:" opt; do
    case "$opt" in
      a) auto_mode=1 ;;
      l) lang="$OPTARG" ;;
      e) emoji="$OPTARG" ;;
      t) ttl="$OPTARG" ;;
      *)
        echo "$msg_usage"
        echo "$msg_usage_pipe"
        echo "$msg_usage_burn"
        return 1
        ;;
    esac
  done
  shift $((OPTIND-1))

  if [ "$command" = "burn" ]; then
    local slug="$1"
    if [ -z "$slug" ]; then
      echo "$msg_usage"
      echo "$msg_usage_pipe"
      echo "$msg_usage_burn"
      return 1
    fi
    if ! curl -sS -X DELETE "${api_base}/api/burn/${slug}" >/dev/null; then
      echo "$msg_burn_fail" >&2
      return 1
    fi
    echo "$msg_burned"
    return 0
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
    echo "$msg_usage"
    echo "$msg_usage_pipe"
    echo "$msg_usage_burn"
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
  short=$(curl -sS -X POST "${api_base}/api/dispatch" \
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
    echo "✨ $msg_copied"
  elif command -v xclip >/dev/null 2>&1; then
    echo -n "$short" | xclip -selection clipboard
    echo "✨ $msg_copied"
  fi
}
```

### Smoke test

```bash
echo "Cand ai 5 minute de liniste." | amigo https://example.com
```
