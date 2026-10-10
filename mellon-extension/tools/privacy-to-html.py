"""Turns mellon-extension/PRIVACY.md into public/mellon/privacy/index.html (served at /mellon/privacy/).
Run from the repository root: python3 mellon-extension/tools/privacy-to-html.py"""
import html, re, pathlib

src = pathlib.Path('mellon-extension/PRIVACY.md').read_text()
out = pathlib.Path('public/mellon/privacy/index.html')

def inline(s):
    s = html.escape(s, quote=False)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)
    s = re.sub(r'(?<!\w)_(.+?)_(?!\w)', r'<em>\1</em>', s)
    s = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', s)
    return s

body, para, items = [], [], []
def flush():
    global para, items
    if para: body.append(f"<p>{inline(' '.join(para))}</p>"); para = []
    if items: body.append('<ul>' + ''.join(f'<li>{inline(i)}</li>' for i in items) + '</ul>'); items = []
for line in src.splitlines():
    if line.startswith('# '): flush(); body.append(f'<h1>{inline(line[2:])}</h1>')
    elif line.startswith('## '): flush(); body.append(f'<h2>{inline(line[3:])}</h2>')
    elif line.startswith('- '): para and flush(); items.append(line[2:])
    elif not line.strip(): flush()
    else: para.append(line.strip())
flush()

out.write_text(f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mellon privacy policy</title>
<meta name="description" content="How the Mellon Chrome extension handles your Gmail data.">
<meta name="robots" content="noindex">
<style>
:root{{--bg:#F3F4EF;--ink:#1E211B;--mute:#62655A;--line:#E1E3DA;--acc:#C5E57A}}
@media (prefers-color-scheme: dark){{:root{{--bg:#171915;--ink:#ECEDE6;--mute:#A4A79B;--line:#2E312A}}}}
html{{background:var(--bg)}}
body{{margin:0;color:var(--ink);font:16px/1.65 system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}}
main{{max-width:680px;margin:0 auto;padding:56px 20px 80px}}
h1{{font-size:32px;line-height:1.15;letter-spacing:-.02em;margin:0 0 6px}}
h2{{font-size:19px;margin:40px 0 8px;padding-top:24px;border-top:1px solid var(--line)}}
p,li{{color:var(--ink)}} em{{color:var(--mute);font-style:normal}}
ul{{padding-left:20px}} li{{margin:6px 0}}
code{{font:13px ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--line);padding:1px 5px;border-radius:4px}}
a{{color:inherit;text-decoration-color:var(--acc);text-decoration-thickness:2px;text-underline-offset:3px}}
</style>
</head>
<body><main>
{chr(10).join(body)}
</main></body>
</html>
''')
print('wrote', out)
