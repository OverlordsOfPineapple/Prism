#!/usr/bin/env bash
source "$(cd "$(dirname "$0")" && pwd)/lib.sh"
quiet=false
[[ "${1:-}" == '--quiet' ]] && quiet=true
cd "$PRISM_ROOT"
failures=0
check() { if "$@"; then $quiet || ok "$2"; else warn "FAILED: $2"; failures=$((failures+1)); fi; }

[[ -f index.html ]] || { warn 'Missing index.html'; failures=$((failures+1)); }
[[ -f css/app.css ]] || { warn 'Missing css/app.css'; failures=$((failures+1)); }
[[ -f js/app.js ]] || { warn 'Missing js/app.js'; failures=$((failures+1)); }

python3 - <<'PY' || failures=$((failures+1))
from pathlib import Path
import re, sys
root=Path('.')
html=(root/'index.html').read_text(encoding='utf-8')
refs=[]
refs += re.findall(r'(?:src|href)=["\']([^"\']+)["\']', html)
for css in root.glob('css/*.css'):
    refs += re.findall(r'@import\s+["\']([^"\']+)["\']', css.read_text(encoding='utf-8'))
missing=[]
for ref in refs:
    if ref.startswith(('http://','https://','#','data:','mailto:','//')): continue
    base=root if ref in html else root/'css'
    target=(base/ref.split('?',1)[0]).resolve()
    if not target.exists(): missing.append(ref)
if missing:
    print('Missing local references:', *sorted(set(missing)), sep='\n- ', file=sys.stderr)
    raise SystemExit(1)
PY

python3 - <<'PY' || failures=$((failures+1))
from pathlib import Path
import re, sys
root=Path('js')
missing=[]
for f in root.rglob('*.js'):
    text=f.read_text(encoding='utf-8')
    for ref in re.findall(r"(?:from\s+|import\s*)['\"]([^'\"]+)['\"]", text):
        if not ref.startswith('.'): continue
        p=(f.parent/ref)
        candidates=[p, Path(str(p)+'.js'), p/'index.js']
        if not any(x.exists() for x in candidates): missing.append(f'{f}: {ref}')
if missing:
    print('Broken JS imports:', *missing, sep='\n- ', file=sys.stderr)
    raise SystemExit(1)
PY

python3 - <<'PY' || failures=$((failures+1))
from pathlib import Path
import re, sys
html=Path('index.html').read_text(encoding='utf-8')
ids=re.findall(r'\bid=["\']([^"\']+)["\']',html)
dup=sorted({x for x in ids if ids.count(x)>1})
if dup:
    print('Duplicate HTML IDs:', ', '.join(dup), file=sys.stderr)
    raise SystemExit(1)
PY

if command_exists git && [[ -d .git ]]; then
  git diff --check || failures=$((failures+1))
fi

if (( failures )); then die "$failures health check(s) failed."; fi
$quiet || ok 'All Prism health checks passed.'
