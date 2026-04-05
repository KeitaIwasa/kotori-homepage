#!/usr/bin/env python3
from __future__ import annotations

import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "dist-stg"
EXCLUDE_NAMES = {".git", "README.md", "AGENTS.md", "CNAME", "dist-stg", "scripts", "__pycache__"}
ROBOTS_META = '<meta name="robots" content="noindex, nofollow" />'


def copy_tree(src: Path, dst: Path) -> None:
    for item in src.iterdir():
        if item.name in EXCLUDE_NAMES:
            continue
        target = dst / item.name
        if item.is_dir():
            shutil.copytree(item, target)
        else:
            shutil.copy2(item, target)


def rewrite_html(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    if 'name="robots"' in text:
        text = text.replace(
            '<meta name="robots" content="index, follow" />',
            ROBOTS_META,
        )
    elif "<link rel=\"canonical\"" in text:
        text = text.replace("<link rel=\"canonical\"", f"{ROBOTS_META}\n  <link rel=\"canonical\"", 1)
    else:
        text = text.replace("</head>", f"  {ROBOTS_META}\n</head>", 1)
    path.write_text(text, encoding="utf-8")


def write_robots(path: Path) -> None:
    path.write_text("User-agent: *\nDisallow: /\n", encoding="utf-8")


def main() -> None:
    if OUT_DIR.exists():
        shutil.rmtree(OUT_DIR)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    copy_tree(ROOT, OUT_DIR)
    for html in OUT_DIR.rglob("*.html"):
        rewrite_html(html)
    write_robots(OUT_DIR / "robots.txt")


if __name__ == "__main__":
    main()
