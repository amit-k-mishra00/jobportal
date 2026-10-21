from pathlib import Path
import re

root = Path(__file__).resolve().parent
htmls = list(root.glob("*.html")) + list((root / "pages").glob("*.html")) + list((root / "jobs" / "templates").rglob("*.html"))
missing = []
for html in htmls:
    text = html.read_text(encoding="utf-8")
    hrefs = re.findall(r"""(?:href|src)=["']([^"'#]+)["']""", text)
    for href in hrefs:
        if href.startswith(("http://", "https://", "mailto:", "{%")):
            continue
        if href.startswith("/"):
            target = root / href.lstrip("/")
        else:
            target = (html.parent / href).resolve()
        if not target.exists():
            missing.append((str(html.relative_to(root)), href))

print("checked", len(htmls), "files")
if missing:
    print("MISSING:")
    for row in missing:
        print(" ", row)
else:
    print("all local href/src exist")
