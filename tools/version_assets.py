"""Stamp each CSS/JS link with a content hash (?v=abc123) so Cloudflare can never serve a stale copy.
   Run after build_pages.py:  python3 tools/version_assets.py"""
import hashlib, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parent.parent
assets = ["heritage.css", "components.css", "heritage.js", "components.js"]
ver = {a: hashlib.sha1((ROOT / a).read_bytes()).hexdigest()[:8] for a in assets}
for page in ["index.html", "about.html", "coaching.html", "results.html", "apply.html", "terms-coaching.html"]:
    p = ROOT / page; s = p.read_text()
    for a, v in ver.items():
        s = re.sub(rf'(href|src)="{re.escape(a)}(\?v=[0-9a-f]+)?"', rf'\1="{a}?v={v}"', s)
    p.write_text(s)
print(ver)
