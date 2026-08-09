#!/usr/bin/env bash
set -e

mkdir -p reports

echo "== Prism Check =="

./tools/js-audit.sh > reports/js-audit.txt

echo
echo "Checking syntax..."

find js prism-core -name "*.js" -print0 |
while IFS= read -r -d '' file
do
    node --check "$file"
done

echo
echo "Syntax OK"

if [ -f package.json ]; then
    echo "Running tests..."
    npm test
else
    echo "No package.json - skipping tests."
fi
