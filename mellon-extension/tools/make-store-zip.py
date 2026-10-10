"""Builds the Chrome Web Store upload: mellon-store-<version>.zip in the repository's dist/ folder.
Same files as the extension, minus the developer `key` (the store gives the extension its own ID)
and minus things only developers need (README, docs, tools).
Run from the repository root: python3 mellon-extension/tools/make-store-zip.py"""
import json, pathlib, zipfile

root = pathlib.Path('mellon-extension')
manifest = json.loads((root / 'manifest.json').read_text())
manifest.pop('key', None)
skip_dirs = {'docs', 'tools', 'store'}
skip_files = {'README.md', 'PRIVACY.md', 'FRIENDS.md', '.gitignore', 'manifest.json'}

dist = pathlib.Path('dist'); dist.mkdir(exist_ok=True)
out = dist / f"mellon-store-{manifest['version']}.zip"
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('manifest.json', json.dumps(manifest, indent=2) + '\n')
    for f in sorted(root.rglob('*')):
        rel = f.relative_to(root)
        if f.is_dir() or rel.parts[0] in skip_dirs or str(rel) in skip_files:
            continue
        z.write(f, str(rel))
print(out, sum(1 for _ in zipfile.ZipFile(out).namelist()), 'files')
