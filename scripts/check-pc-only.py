"""Check the supported platform boundary; this does not render the UI."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
failures = []
css_files = list((ROOT / 'src').glob('*.css'))
for path in css_files:
    text = path.read_text()
    for query in re.findall(r'@media\s*([^{}]+)\{', text):
        if re.search(r'pointer\s*:\s*coarse|hover\s*:\s*none|orientation', query):
            failures.append(f'{path.name}: touch/mobile query {query}')
        for width in re.findall(r'max-width\s*:\s*(\d+)px', query):
            if int(width) < 1280:
                failures.append(f'{path.name}: mobile breakpoint {width}px')
style = (ROOT / 'src/style.css').read_text()
if not re.search(r'body\s*\{[^}]*min-width\s*:\s*1280px', style):
    failures.append('The PC minimum canvas width is missing')
html = (ROOT / 'index.html').read_text()
if 'src/desktop.css' not in html or 'PC EDITION' not in html:
    failures.append('The PC stylesheet or edition label is missing')
for path in [ROOT / 'android', ROOT / 'ios', ROOT / 'capacitor.config.ts', ROOT / 'manifest.webmanifest']:
    if path.exists():
        failures.append(f'Unexpected mobile distribution target: {path.name}')
report = {'date': '2026-10-12', 'passed': not failures,
          'scope': 'Static platform checks; desktop layout must also be tested in a browser',
          'cssFiles': len(css_files), 'minimumViewport': [1280, 720],
          'desktopTestViewports': [[1280, 720], [1440, 900], [1920, 1080]],
          'failures': failures}
(ROOT / 'qa/pc-platform-2026-10-12.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
raise SystemExit(bool(failures))
