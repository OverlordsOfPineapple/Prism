#!/usr/bin/env bash
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"
cd "$PRISM_ROOT"
stamp="$(date '+%Y-%m-%d_%H-%M-%S')"
out="$LOG_DIR/session-$stamp.md"
version="$(cat VERSION 2>/dev/null || echo unknown)"
branch="$(git branch --show-current 2>/dev/null || echo none)"
cat > "$out" <<REPORT
# Prism Session Report

- Date: $(date '+%Y-%m-%d %H:%M:%S %Z')
- Version: $version
- Branch: $branch

## Working tree

\`\`\`
$(git status --short 2>/dev/null || echo 'Git unavailable')
\`\`\`

## Recent commits

\`\`\`
$(git log -5 --oneline 2>/dev/null || echo 'No commits')
\`\`\`

## Next

$(sed -n '/^## Next/,/^## /p' TASKS.md 2>/dev/null | sed '$d' || true)
REPORT
ok "Session report written to $out"
printf '%s\n' "$out"
