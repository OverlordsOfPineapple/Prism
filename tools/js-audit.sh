#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "===== JavaScript Inventory ====="
find js prism-core -name "*.js" | sort

echo
echo "===== Largest Files ====="
find js prism-core -name "*.js" -exec wc -l {} \; | sort -n

echo
echo "===== TODO ====="
grep -RInE "TODO|FIXME|HACK" js prism-core || true

echo
echo "===== innerHTML ====="
grep -RIn "innerHTML" js prism-core || true

echo
echo "===== querySelector ====="
grep -RIn "querySelector" js prism-core || true

echo
echo "===== Event Listeners ====="
grep -RIn "addEventListener" js prism-core || true
