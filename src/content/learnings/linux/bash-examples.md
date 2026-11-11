---
title: "Bash Script Examples"
description: "Real-world Bash script examples including a full log analysis tool and other practical scripts."
order: 6
topic: "linux"
---

## analyse-logs.sh — Log Analysis Tool

This script analyses an Nginx (or Apache) access log to extract useful metrics: top IPs, HTTP status distribution, most-requested URLs, and error detection.

```bash
#!/usr/bin/env bash
# analyse-logs.sh — Nginx/Apache access log analyser
set -euo pipefail

# ─── Config ──────────────────────────────────────────────
LOG_FILE="${1:-/var/log/nginx/access.log}"
TOP_N="${2:-10}"

# ─── Colours ─────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ─── Helpers ─────────────────────────────────────────────
log()     { echo -e "${GREEN}[INFO]${RESET}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; exit 1; }
section() { echo -e "\n${BOLD}${CYAN}══ $* ══${RESET}"; }

# ─── Validate input ──────────────────────────────────────
[[ -f "$LOG_FILE" ]] || error "Log file not found: $LOG_FILE"
[[ -r "$LOG_FILE" ]] || error "Log file not readable: $LOG_FILE"

TOTAL=$(wc -l < "$LOG_FILE")
[[ $TOTAL -gt 0 ]] || error "Log file is empty"

log "Analysing: $LOG_FILE ($TOTAL entries)"

# ─── Total requests ──────────────────────────────────────
section "Summary"
echo "  Total requests : $TOTAL"

# Date range from first and last line
FIRST_DATE=$(head -1 "$LOG_FILE" | awk '{print $4}' | tr -d '[')
LAST_DATE=$(tail -1  "$LOG_FILE" | awk '{print $4}' | tr -d '[')
echo "  First request  : $FIRST_DATE"
echo "  Last request   : $LAST_DATE"

# ─── HTTP status distribution ────────────────────────────
section "HTTP Status Codes"
awk '{print $9}' "$LOG_FILE" \
  | grep -E '^[0-9]{3}$' \
  | sort \
  | uniq -c \
  | sort -rn \
  | awk '{ printf "  %-6s  %s\n", $2, $1 }'

# ─── Top IPs ─────────────────────────────────────────────
section "Top $TOP_N Client IPs"
awk '{print $1}' "$LOG_FILE" \
  | sort \
  | uniq -c \
  | sort -rn \
  | head -"$TOP_N" \
  | awk '{ printf "  %-6s  %s\n", $1, $2 }'

# ─── Top URLs ────────────────────────────────────────────
section "Top $TOP_N Requested URLs"
awk '{print $7}' "$LOG_FILE" \
  | sort \
  | uniq -c \
  | sort -rn \
  | head -"$TOP_N" \
  | awk '{ printf "  %-6s  %s\n", $1, $2 }'

# ─── 4xx/5xx errors ──────────────────────────────────────
section "Error Requests (4xx/5xx)"
ERROR_COUNT=$(awk '$9 ~ /^[45]/' "$LOG_FILE" | wc -l)
echo "  Total errors: $ERROR_COUNT"

if [[ $ERROR_COUNT -gt 0 ]]; then
    echo ""
    echo "  Top error URLs:"
    awk '$9 ~ /^[45]/ {print $9, $7}' "$LOG_FILE" \
      | sort \
      | uniq -c \
      | sort -rn \
      | head -5 \
      | awk '{ printf "    %-8s %-6s %s\n", $1, $2, $3 }'
fi

# ─── Bandwidth (if size field available) ─────────────────
section "Bandwidth"
awk '$10 ~ /^[0-9]+$/ {sum += $10} END {
    if (sum > 1073741824)
        printf "  Total: %.2f GB\n", sum/1073741824
    else if (sum > 1048576)
        printf "  Total: %.2f MB\n", sum/1048576
    else
        printf "  Total: %.2f KB\n", sum/1024
}' "$LOG_FILE"

log "Done."
```

### How to Use It

```bash
# Make executable
chmod +x analyse-logs.sh

# Analyse default nginx log
./analyse-logs.sh

# Analyse a specific log
./analyse-logs.sh /var/log/apache2/access.log

# Show top 20 instead of top 10
./analyse-logs.sh /var/log/nginx/access.log 20
```

### How It Works

| Section          | Technique                                                          |
| ---------------- | ------------------------------------------------------------------ |
| **Status codes** | `awk '{print $9}'` extracts field 9 (status), then `sort           | uniq -c | sort -rn` counts and ranks |
| **Top IPs**      | `awk '{print $1}'` extracts the client IP (field 1)                |
| **Top URLs**     | `awk '{print $7}'` extracts the request path (field 7)             |
| **Errors**       | `awk '$9 ~ /^[45]/'` filters lines where status starts with 4 or 5 |
| **Bandwidth**    | `awk '$10 ~ /^[0-9]+$/'` safely sums the byte count field          |

---

## backup.sh — Simple Directory Backup

```bash
#!/usr/bin/env bash
# backup.sh — Create timestamped compressed backup
set -euo pipefail

SOURCE="${1:?Usage: backup.sh <source-dir> [dest-dir]}"
DEST="${2:-/backup}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_$(basename "$SOURCE")_${TIMESTAMP}.tar.gz"

mkdir -p "$DEST"

echo "Backing up: $SOURCE → $DEST/$BACKUP_NAME"
tar -czf "$DEST/$BACKUP_NAME" -C "$(dirname "$SOURCE")" "$(basename "$SOURCE")"

SIZE=$(du -sh "$DEST/$BACKUP_NAME" | cut -f1)
echo "Done. Archive size: $SIZE"

# Keep only last 7 backups
BACKUP_BASE="backup_$(basename "$SOURCE")_"
ls -t "$DEST"/${BACKUP_BASE}*.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm --
echo "Old backups pruned (kept last 7)."
```

---

## health-check.sh — Service Health Monitor

```bash
#!/usr/bin/env bash
# health-check.sh — Check multiple services and alert on failure
set -euo pipefail

SERVICES=("nginx" "postgresql" "redis")
ALERT_EMAIL="${ALERT_EMAIL:-ops@example.com}"
FAILED=()

check_service() {
    local svc="$1"
    if systemctl is-active --quiet "$svc"; then
        echo "  [OK]   $svc"
    else
        echo "  [FAIL] $svc"
        FAILED+=("$svc")
    fi
}

echo "=== Service Health Check — $(date) ==="
for svc in "${SERVICES[@]}"; do
    check_service "$svc"
done

if [[ ${#FAILED[@]} -gt 0 ]]; then
    echo ""
    echo "ALERT: ${#FAILED[@]} service(s) down: ${FAILED[*]}"
    # Optionally send email
    # echo "Services down: ${FAILED[*]}" | mail -s "Service Alert" "$ALERT_EMAIL"
    exit 1
fi

echo ""
echo "All services healthy."
```

---

## deploy.sh — Simple Zero-Downtime Deploy Pattern

```bash
#!/usr/bin/env bash
# deploy.sh — Pull latest, build, and reload
set -euo pipefail

APP_DIR="/opt/myapp"
REPO="git@github.com:org/myapp.git"
BRANCH="${1:-main}"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

log "Deploying branch: $BRANCH"

cd "$APP_DIR"

log "Pulling latest..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

log "Installing dependencies..."
npm ci --production

log "Building..."
npm run build

log "Reloading service (zero-downtime)..."
systemctl reload myapp.service

log "Deploy complete."
```
