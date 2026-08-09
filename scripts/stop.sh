#!/usr/bin/env bash
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"
if server_running; then
  pid="$(server_pid)"
  kill "$pid"
  rm -f "$PID_FILE" "$PORT_FILE"
  ok 'Prism development server stopped.'
else
  rm -f "$PID_FILE" "$PORT_FILE"
  info 'Prism is not running.'
fi
