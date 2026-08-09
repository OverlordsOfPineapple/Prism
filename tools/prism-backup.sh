#!/usr/bin/env bash
set -e

STAMP=$(date +%F-%H%M%S)
mkdir -p backups

zip -qr "backups/Prism-$STAMP.zip" . \
    -x "backups/*" \
    -x "node_modules/*"

echo
echo "Backup created:"
echo "backups/Prism-$STAMP.zip"
