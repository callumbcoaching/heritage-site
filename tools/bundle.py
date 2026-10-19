"""Bundle a page: inline heritage.css/js and brand_assets as data URIs.
   python3 tools/bundle.py index.html out.html [--artifact]
   --artifact strips doctype/html/head/body (the artifact host adds them); without it, a full deployable document."""
import sys, re, base64, pathlib
src, out = sys.argv[1], sys.argv[2]; art = "--artifact" in sys.argv
root = pathlib.Path(src).parent
s = (root / pathlib.Path(src).name).read_text()
def datauri(p):
    p = root / p; mt = {"png":"image/png","webp":"image/webp","jpg":"image/jpeg","svg":"image/svg+xml"}[p.suffix[1:]]
    return f"data:{mt};base64," + base64.b64encode(p.read_bytes()).decode()
cache = {}
s = re.sub(r'(src|href)="((?:brand_assets|assets)/[^"]+)"', lambda m: f'{m.group(1)}="{cache.setdefault(m.group(2), datauri(m.group(2)))}"', s)
s = s.replace('<link rel="stylesheet" href="heritage.css">', "<style>\n" + (root/"heritage.css").read_text() + "\n</style>")
s = s.replace('<script src="heritage.js"></script>', "<script>\n" + (root/"heritage.js").read_text() + "\n</script>")
if art:
    head = re.search(r"<head>(.*?)</head>", s, re.S).group(1)
    head = re.sub(r'<meta (charset|name="viewport")[^>]*>\n?', "", head)
    title = re.search(r"<title>.*?</title>", head).group(0)
    head = head.replace(title, "")
    body = re.search(r"<body>(.*)</body>", s, re.S).group(1)
    s = title + "\n" + head + "<style>:root{color-scheme:dark;padding:0!important}</style>\n" + body
pathlib.Path(out).write_text(s)
print(out, len(s)//1024, "KB")
