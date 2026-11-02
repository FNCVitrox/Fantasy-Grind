"""Erzeugt alle Pixel-Art-Grafiken des Spiels.

Start (aus dem Projektordner):  python3 tools/pixelart/build.py
Ausgabe:
  assets/sprites/hero-<klasse>-<build>.png   Sprite-Sheet 512x64 (8 Frames: 4x Ruhe, Ausholen, Schlag, Nachschwung, getroffen)
  assets/sprites/enemy-<id>.png              Sprite-Sheet 512x64, zum Helden schauend (gespiegelt)
  assets/backgrounds/<gebiet>.png            Kampfbühne 256x96
  assets/icons/items.png                     Icon-Atlas 8x 16x16 (weapon, offhand, chest, pants, boots, necklace, ring, material)
"""

import os
import sys

from PIL import Image, ImageOps

sys.path.insert(0, os.path.dirname(__file__))

from backgrounds import BACKGROUNDS  # noqa: E402
from specs import ENEMIES, HERO_LOOKS, enemy_spec, hero_spec  # noqa: E402
from figures import FRAMES, draw as draw_character  # noqa: E402
from icons import ICONS  # noqa: E402
from pixel import sheet  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))


def out(*parts):
    path = os.path.join(ROOT, "assets", *parts)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path


def save_png(img, path):
    img.save(path, optimize=True)


def main():
    count = 0
    for class_id in HERO_LOOKS:
        for build in ("tank", "damage", "bruiser"):
            spec = hero_spec(class_id, build)
            save_png(sheet([draw_character(spec, frame) for frame in FRAMES]), out("sprites", f"hero-{class_id}-{build}.png"))
            count += 1
    for enemy_id in ENEMIES:
        spec = enemy_spec(enemy_id)
        frames = [ImageOps.mirror(draw_character(spec, frame)) for frame in FRAMES]
        save_png(sheet(frames), out("sprites", f"enemy-{enemy_id}.png"))
        count += 1
    for zone_id, painter in BACKGROUNDS.items():
        save_png(painter().img.convert("RGB"), out("backgrounds", f"{zone_id}.png"))
        count += 1
    atlas = Image.new("RGBA", (16 * len(ICONS), 16), (0, 0, 0, 0))
    for index, painter in enumerate(ICONS.values()):
        atlas.paste(painter(), (index * 16, 0))
    save_png(atlas, out("icons", "items.png"))
    count += 1
    print(f"{count} Grafiken erzeugt in assets/")


if __name__ == "__main__":
    main()
