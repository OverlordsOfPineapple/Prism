#!/usr/bin/env bash
set -Eeuo pipefail

PRISM_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_PORT="${PRISM_PORT:-8082}"
PID_FILE="$PRISM_ROOT/.prism-server.pid"
PORT_FILE="$PRISM_ROOT/.prism-server.port"
LOG_DIR="$PRISM_ROOT/logs"

info() { printf '\033[1;36m[Prism]\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m[Prism]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[Prism]\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m[Prism]\033[0m %s\n' "$*" >&2; exit 1; }
command_exists() { command -v "$1" >/dev/null 2>&1; }
ensure_dirs() { mkdir -p "$LOG_DIR" "$PRISM_ROOT/releases"; }
server_pid() { [[ -f "$PID_FILE" ]] && cat "$PID_FILE" || true; }
server_running() { local pid; pid="$(server_pid)"; [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; }
find_free_port() {
  local port="${1:-$DEFAULT_PORT}"
  while python3 - "$port" <<'PY' >/dev/null 2>&1
import socket, sys
p=int(sys.argv[1]); s=socket.socket();
try: s.bind(('127.0.0.1',p))
except OSError: raise SystemExit(1)
finally: s.close()
PY
  do printf '%s' "$port"; return 0; done
  for ((port=port+1; port<port+50; port++)); do
    python3 - "$port" <<'PY' >/dev/null 2>&1 && { printf '%s' "$port"; return 0; }
import socket, sys
p=int(sys.argv[1]); s=socket.socket();
try: s.bind(('127.0.0.1',p))
except OSError: raise SystemExit(1)
finally: s.close()
PY
  done
  return 1
}
open_browser() {
  local url="$1"
  if command_exists xdg-open; then nohup xdg-open "$url" >/dev/null 2>&1 &
  elif command_exists gio; then nohup gio open "$url" >/dev/null 2>&1 &
  else warn "Open $url in your browser."; fi
}
