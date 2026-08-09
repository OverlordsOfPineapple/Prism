#!/usr/bin/env bash
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"
ensure_dirs
command_exists python3 || die 'Python 3 is required.'

if server_running; then
  port="$(cat "$PORT_FILE" 2>/dev/null || echo "$DEFAULT_PORT")"
  ok "Prism is already running at http://localhost:$port"
  open_browser "http://localhost:$port"
  exit 0
fi

port="$(find_free_port "$DEFAULT_PORT")" || die 'No free local port was found.'
log="$LOG_DIR/dev-server.log"
info "Running health check…"
"$PRISM_ROOT/scripts/health-check.sh" --quiet
info "Starting Prism on port $port…"
nohup python3 -m http.server "$port" --bind 127.0.0.1 --directory "$PRISM_ROOT" >"$log" 2>&1 &
pid=$!
echo "$pid" > "$PID_FILE"
echo "$port" > "$PORT_FILE"

for _ in {1..30}; do
  if python3 - "$port" <<'PY' >/dev/null 2>&1
import sys, urllib.request
urllib.request.urlopen(f'http://127.0.0.1:{sys.argv[1]}/', timeout=.4)
PY
  then
    ok "Prism is live at http://localhost:$port"
    open_browser "http://localhost:$port"
    exit 0
  fi
  sleep .1
done
kill "$pid" 2>/dev/null || true
rm -f "$PID_FILE" "$PORT_FILE"
die "Server did not become ready. See $log"
