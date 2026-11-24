#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "playwright",
#     "pymupdf",
# ]
# ///
"""Saves every slide as one page of biel-bienne.pdf, in the project folder.

Opens the presentation in a headless browser, so it needs internet for the map.
The first run downloads that browser (Chromium, about 150 MB).

Usage:
    ./scripts/make-pdf.py
"""

import argparse
import subprocess
import sys
from pathlib import Path

import pymupdf
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SITE = "http://slides.localhost"


def main() -> None:
    argparse.ArgumentParser(description=__doc__.splitlines()[0]).parse_args()

    subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)

    pdf = pymupdf.open()
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        # The project files are served straight from disk under a made-up address.
        page.route(f"{SITE}/**", lambda route: route.fulfill(path=ROOT / route.request.url[len(SITE) + 1:].split("?")[0]))
        page.goto(f"{SITE}/index.html")
        page.wait_for_selector("#panel h1", timeout=120_000)
        page.add_style_tag(content="#nav { display: none }")
        count = page.evaluate("window.PRESENTATION.slides.length")
        for i in range(count):
            page.evaluate("i => window.__goTo(i, { instant: true })", i)
            page.wait_for_function(f"location.hash === '#{i + 1}' || {i} === 0")
            page.wait_for_timeout(1000)
            # Map tiles and photos loaded, then time for the layers to fade in.
            page.wait_for_function(
                "window.__map.areTilesLoaded() && [...document.images].every(img => img.complete)",
                timeout=120_000,
            )
            page.wait_for_timeout(2500)
            # One PDF page per slide: the screenshot at half size (960 x 540 points),
            # with a clickable area over every link on the slide.
            sheet = pdf.new_page(width=960, height=540)
            sheet.insert_image(sheet.rect, stream=page.screenshot(type="jpeg", quality=88))
            links = page.evaluate(
                "[...document.querySelectorAll('#panel a[href]')].map(a =>"
                " [a.href, ...[...a.getClientRects()].map(r => [r.left, r.top, r.right, r.bottom])])"
            )
            for href, *boxes in links:
                for box in boxes:
                    sheet.insert_link({"kind": pymupdf.LINK_URI, "from": pymupdf.Rect(box) * 0.5, "uri": href})
            print(f"slide {i + 1} / {count}")
        browser.close()

    out = ROOT / "biel-bienne.pdf"
    pdf.save(out)
    print(f"wrote {out} ({len(pdf)} pages, {out.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
