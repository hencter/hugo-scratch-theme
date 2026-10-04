#!/usr/bin/env python3
"""Regenerate the theme's raster brand assets.

These files are committed, so running this script is OPTIONAL — it exists so the
assets are reproducible instead of being mystery binaries. Nothing in the build
pipeline needs Python; only this script does.

    python scripts/generate-assets.py

Outputs (relative to the theme root):

    assets/images/og-default.png    1200x630 social card, measured by Hugo so
                                    og:image:width/height can be emitted
    static/apple-touch-icon.png     180x180 icon for iOS home screens
    static/favicon-32x32.png        32x32 fallback for browsers without SVG icons

Requires Pillow.
"""

from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover - guidance beats a traceback
    sys.exit("Pillow is required: python -m pip install Pillow")

THEME_ROOT = Path(__file__).resolve().parent.parent

# Palette must match assets/css/tokens.css, or the card will not look like the site.
INK = (14, 17, 22)
TEAL = (11, 110, 110)
TEAL_LIGHT = (126, 224, 214)
PAPER = (226, 242, 242)
MUTED = (154, 167, 180)

FONT_CANDIDATES = (
    r"C:\Windows\Fonts\segoeuib.ttf",
    r"C:\Windows\Fonts\segoeui.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
)


def load_font(size: int) -> ImageFont.FreeTypeFont:
    """Return the first available real font, falling back to PIL's bitmap font."""
    for candidate in FONT_CANDIDATES:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default(size)


def draw_mark(draw: ImageDraw.ImageDraw, x: int, y: int, size: int) -> None:
    """The three-bar + ring mark used by favicon.svg and logo.svg."""
    radius = size // 4
    draw.rounded_rectangle([x, y, x + size, y + size], radius=radius, fill=TEAL)

    stroke = max(2, size // 13)
    bar_x = x + size // 5
    for index, width in enumerate((0.56, 0.37, 0.25)):
        top = y + size * (0.33 + index * 0.17)
        draw.rounded_rectangle(
            [bar_x, top, bar_x + size * width, top + stroke],
            radius=stroke // 2,
            fill=PAPER,
        )

    ring_r = size // 8
    cx, cy = x + int(size * 0.73), y + int(size * 0.67)
    draw.ellipse(
        [cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r],
        outline=TEAL_LIGHT,
        width=stroke,
    )


def build_og_card() -> None:
    width, height = 1200, 630
    image = Image.new("RGB", (width, height), INK)
    draw = ImageDraw.Draw(image)

    # A quiet diagonal wash so the card does not read as a flat placeholder.
    for step in range(0, 14):
        alpha = step / 14
        band = tuple(int(INK[i] + (TEAL[i] - INK[i]) * (1 - alpha) * 0.5) for i in range(3))
        draw.polygon(
            [(width, height * (0.30 + step * 0.05)), (width, height), (0, height)],
            fill=band,
        )

    draw_mark(draw, 96, 96, 132)

    title_font = load_font(88)
    sub_font = load_font(34)
    meta_font = load_font(28)

    draw.text((96, 288), "Hugo Scratch", font=title_font, fill=PAPER)
    draw.text(
        (96, 400),
        "Semantic HTML  ·  Complete SEO head  ·  Bilingual",
        font=sub_font,
        fill=TEAL_LIGHT,
    )
    draw.text(
        (96, 462),
        "Shortcodes, render hooks, output formats and Hugo Pipes",
        font=meta_font,
        fill=MUTED,
    )

    target = THEME_ROOT / "assets" / "images" / "og-default.png"
    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, "PNG", optimize=True)
    print(f"wrote {target.relative_to(THEME_ROOT)}")


def build_icons() -> None:
    for size, name in ((180, "apple-touch-icon.png"), (32, "favicon-32x32.png")):
        image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        draw_mark(draw, 0, 0, size)

        target = THEME_ROOT / "static" / name
        target.parent.mkdir(parents=True, exist_ok=True)
        image.save(target, "PNG", optimize=True)
        print(f"wrote {target.relative_to(THEME_ROOT)}")


def main() -> None:
    build_og_card()
    build_icons()


if __name__ == "__main__":
    main()
