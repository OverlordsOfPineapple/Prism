#!/usr/bin/env bash
set -Eeuo pipefail
SOURCE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${PRISM_HOME:-$HOME/Projects/Prism}"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="${TARGET}-backup-${STAMP}"

if [[ ! -d "$TARGET" ]]; then
  echo "Prism workspace not found at $TARGET" >&2
  exit 1
fi

"$TARGET/scripts/stop.sh" >/dev/null 2>&1 || true
cp -a "$TARGET" "$BACKUP"

for path in index.html css js prism-core tests docs scripts README.md CHANGELOG.md TASKS.md VERSION .gitignore; do
  rm -rf "$TARGET/$path"
  cp -a "$SOURCE_ROOT/$path" "$TARGET/$path"
done
chmod +x "$TARGET"/scripts/*.sh "$TARGET/apply-update.sh" 2>/dev/null || true

cd "$TARGET"
node tests/prism-core.test.mjs
node tests/tmdb-mapper.test.mjs
node tests/search-regression.test.mjs
./scripts/health-check.sh

echo
echo "Prism 2.3.1 installed successfully."
echo "Backup preserved at $BACKUP"
echo "Launching Prism..."
exec "$TARGET/scripts/dev.sh"
