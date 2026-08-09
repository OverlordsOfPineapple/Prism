#!/usr/bin/env bash
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"
cd "$PRISM_ROOT"
command_exists git || die 'Git is required.'
[[ -d .git ]] || die 'Release requires a Git repository.'
[[ -z "$(git status --porcelain)" ]] || die 'Commit or stash all changes before releasing.'
"$PRISM_ROOT/scripts/health-check.sh"
current="$(cat VERSION)"
version="${1:-}"
[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "Usage: ./scripts/release.sh X.Y.Z (current: $current)"
[[ "$version" != "$current" ]] || die 'New version matches current version.'
printf '%s\n' "$version" > VERSION
sed -i "s/Prism 2\.0 — Quality Entertainment/Prism $version — Quality Entertainment/" index.html
printf '\n## %s — %s\n\n- Release package generated.\n' "$version" "$(date +%Y-%m-%d)" >> CHANGELOG.md
git add VERSION index.html CHANGELOG.md
git commit -m "release: Prism $version"
git tag -a "v$version" -m "Prism $version"
archive="$PRISM_ROOT/releases/prism-$version.zip"
python3 - "$archive" <<'PY'
from pathlib import Path
import sys, zipfile
root=Path('.').resolve(); out=Path(sys.argv[1]).resolve()
exclude={'.git','logs','releases','.prism-server.pid','.prism-server.port'}
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
    for p in root.rglob('*'):
        rel=p.relative_to(root)
        if any(part in exclude for part in rel.parts) or not p.is_file(): continue
        z.write(p, Path(f'prism-{Path("VERSION").read_text().strip()}')/rel)
print(out)
PY
ok "Released Prism $version: $archive"
