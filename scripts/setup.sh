#!/usr/bin/env bash
set -Eeuo pipefail
SOURCE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${PRISM_HOME:-$HOME/Projects/Prism}"

printf '\nPrism Studio setup\n==================\n'
command -v python3 >/dev/null 2>&1 || { echo 'Python 3 is required.' >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo 'Git is required.' >&2; exit 1; }

if [[ "$SOURCE_ROOT" != "$TARGET" ]]; then
  mkdir -p "$(dirname "$TARGET")"
  if [[ -d "$TARGET/.git" ]]; then
    echo "Existing Prism Git workspace found at $TARGET; source files were not overwritten."
  else
    mkdir -p "$TARGET"
    cp -a "$SOURCE_ROOT/." "$TARGET/"
    echo "Installed Prism to $TARGET"
  fi
fi
cd "$TARGET"
chmod +x scripts/*.sh
mkdir -p logs releases
: > logs/.gitkeep
: > releases/.gitkeep

if [[ ! -d .git ]]; then
  git init -q
  git branch -M main
  git config user.name >/dev/null 2>&1 || git config user.name 'Prism Studio'
  git config user.email >/dev/null 2>&1 || git config user.email 'prism-studio@local.invalid'
  git add .
  git commit -qm "chore: establish Prism 2.1 foundation"
  git tag -a v2.1.0 -m "Prism 2.1.0 Foundation"
  echo 'Initialized Git and tagged v2.1.0.'
else
  echo 'Git already initialized; preserving repository history.'
fi

cat > "$HOME/.local/share/applications/prism-studio.desktop" <<DESKTOP
[Desktop Entry]
Type=Application
Name=Prism Studio
Comment=Launch the Prism local development site
Exec=bash -lc '$TARGET/scripts/dev.sh'
Icon=applications-internet
Terminal=true
Categories=Development;
DESKTOP
chmod +x "$HOME/.local/share/applications/prism-studio.desktop" 2>/dev/null || true

echo
echo "Setup complete."
echo "Launch Prism with: $TARGET/scripts/dev.sh"
