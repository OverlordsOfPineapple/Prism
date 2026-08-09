#!/usr/bin/env bash
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"
cd "$PRISM_ROOT"
command_exists git || die 'Git is required.'
[[ -d .git ]] || die 'This Prism workspace is not a Git repository.'
if [[ -n "$(git status --porcelain)" ]]; then die 'Commit or stash local changes before updating.'; fi
branch="$(git branch --show-current)"
info "Updating branch $branch…"
if git remote get-url origin >/dev/null 2>&1; then
  git pull --ff-only
else
  warn 'No Git remote is configured; nothing was downloaded.'
fi
"$PRISM_ROOT/scripts/health-check.sh"
ok 'Prism is up to date and healthy.'
