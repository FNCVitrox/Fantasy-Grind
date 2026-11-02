"""Setzt die Kampf-Sprites aus dem CC0-Paket 0x72 DungeonTileset II und den handgezeichneten Ergänzungen zusammen.

Pro Figur entsteht ein Sheet mit 8 Frames à 48x48 (Füsse unten bei y=46):
0-3 Ruhe, 4 Ausholen, 5 Schlag, 6 Nachschwung, 7 getroffen.
Waffen werden in die Hand gesetzt und für den Angriff gedreht. Gegner werden zum Helden gespiegelt.
"""

import colorsys
import os

from PIL import Image, ImageOps

import handmade

HERE = os.path.dirname(os.path.abspath(__file__))
VENDOR = os.path.join(HERE, "vendor", "0x72", "frames")
CELL = 48
FOOT_Y = 46
ANCHOR_X = 20


def load(name):
    return Image.open(os.path.join(VENDOR, name + ".png")).convert("RGBA")


def frames_of(base):
    """Ruhe-Frames und (falls vorhanden) Treffer-Frame einer Figur aus dem Paket."""
    for pattern in (f"{base}_idle_anim_f{{}}", f"{base}_anim_f{{}}"):
        if os.path.exists(os.path.join(VENDOR, pattern.format(0) + ".png")):
            idle = [load(pattern.format(i)) for i in range(4)]
            break
    else:
        raise FileNotFoundError(base)
    hit_path = os.path.join(VENDOR, f"{base}_hit_anim_f0.png")
    hit = load(f"{base}_hit_anim_f0") if os.path.exists(hit_path) else None
    return idle, hit


def recolor(img, hue=0.0, sat=1.0, val=1.0, min_sat=0.12, tint=None, keep_skin=True):
    """Farbton drehen und Sättigung/Helligkeit ändern. Kontur (#222222) und fast graue Pixel bleiben,
    ausser tint=(h, s) färbt auch Grautöne (z. B. Rüstung)."""
    out = img.copy()
    px = out.load()
    for y in range(out.height):
        for x in range(out.width):
            r, g, b, a = px[x, y]
            if a == 0 or (r, g, b) == (34, 34, 34):
                continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if keep_skin and 0.02 <= h <= 0.11 and 0.18 <= s <= 0.62 and v >= 0.62:
                continue  # Hauttöne bleiben
            if s < min_sat:
                if not tint:
                    continue
                h, s = tint[0], max(s, tint[1])
            else:
                h = (h + hue) % 1.0
                s = min(1.0, s * sat)
            v = min(1.0, v * val)
            rr, gg, bb = colorsys.hsv_to_rgb(h, s, v)
            px[x, y] = (round(rr * 255), round(gg * 255), round(bb * 255), a)
    return out


def scale(img, factor):
    if factor == 1:
        return img
    return img.resize((img.width * factor, img.height * factor), Image.NEAREST)


def rotated(weapon, angle, pivot):
    """Waffe um den Griff drehen (angle im Uhrzeigersinn, 0 = Klinge nach oben). Liefert Bild und neuen Drehpunkt."""
    size = max(weapon.width, weapon.height) * 2 + 4
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx, cy = size // 2, size // 2
    canvas.paste(weapon, (cx - pivot[0], cy - pivot[1]), weapon)
    turned = canvas.rotate(-angle, resample=Image.NEAREST, center=(cx, cy))
    return turned, (cx, cy)


def place(cell, img, x, y):
    cell.alpha_composite(img, (int(round(x)), int(round(y))))


class Look:
    """Beschreibt eine Figur: Basis-Sprite, Umfärbung, Waffe, Schild, Krone, Skalierung, Angriffsart."""

    def __init__(self, base=None, hand=None, weapon=None, shield=None, crown=False, size=1, attack="slash",
                 color=None, hand_rows=None, idle=None, bite=None, weapon_scale=None, crown_at=None, shield_at=None):
        self.base = base
        self.hand = hand
        self.weapon = weapon
        self.shield = shield
        self.crown = crown
        self.size = size
        self.attack = attack
        self.color = color or {}
        self.idle = idle
        self.bite = bite
        self.weapon_scale = weapon_scale or size
        self.crown_at = crown_at
        self.shield_at = shield_at


ANGLES = {
    "slash": dict(idle=25, windup=-40, strike=100, follow=150),
    "thrust": dict(idle=15, windup=0, strike=75, follow=75),
    "smash": dict(idle=20, windup=-30, strike=105, follow=160),
    "cast": dict(idle=5, windup=-20, strike=40, follow=20),
    "shoot": dict(idle=0, windup=0, strike=0, follow=0),
    "lunge": dict(idle=0, windup=0, strike=0, follow=0),
    "bite": dict(idle=0, windup=0, strike=0, follow=0),
}
OFFSETS = {  # Körperverschiebung (dx, dy) je Frame
    "windup": (-2, 0), "strike": (4, 0), "follow": (3, 0), "hit": (-3, 0),
}


def build_frames(look):
    if look.idle is not None:
        idle, hit = look.idle, None
    else:
        idle, hit = frames_of(look.base)
    if look.color:
        idle = [recolor(f, **look.color) for f in idle]
        hit = recolor(hit, **look.color) if hit else None
    idle = [scale(f, look.size) for f in idle]
    hit = scale(hit, look.size) if hit else None
    bite = scale(look.bite, look.size) if look.bite is not None else None
    bbox = idle[0].getbbox()
    hand = look.hand
    if hand is None:
        hand = (bbox[2] - 3 * look.size, bbox[1] + (bbox[3] - bbox[1]) * 0.62)
    weapon = scale(load(look.weapon), look.weapon_scale) if look.weapon else None
    shield = scale(handmade.draw(handmade.SHIELD, handmade.PALETTES[look.shield]), 1) if look.shield else None
    crown = handmade.draw(handmade.CROWN, handmade.PALETTES["crown"]) if look.crown else None
    angles = ANGLES[look.attack]
    frames = []
    names = ("idle0", "idle1", "idle2", "idle3", "windup", "strike", "follow", "hit")
    for index, name in enumerate(names):
        cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
        if name.startswith("idle"):
            body = idle[index]
            dx, dy = 0, 0
        elif name == "hit":
            body = hit or idle[0]
            dx, dy = OFFSETS["hit"]
        elif name in ("strike", "follow") and bite is not None:
            body = bite
            dx, dy = OFFSETS[name]
        else:
            body = idle[0]
            dx, dy = OFFSETS[name]
            if look.attack in ("lunge", "bite") and name == "windup":
                dy = 1
        ox = ANCHOR_X - bbox[0] - (bbox[2] - bbox[0]) // 2 + dx
        oy = FOOT_Y - bbox[3] + dy
        if look.attack in ("lunge", "bite") and name == "strike":
            ox += 3
        if shield is not None:
            sx, sy = look.shield_at or (bbox[0] + 1, bbox[1] + (bbox[3] - bbox[1]) * 0.45)
        place(cell, body, ox, oy)
        if crown is not None:
            cx, cy = look.crown_at or (bbox[0] + (bbox[2] - bbox[0]) // 2 - 3, bbox[1] - 3)
            place(cell, crown, ox + cx, oy + cy + (1 if name == "idle1" or name == "idle3" else 0))
        if weapon is not None:
            angle = angles["idle"] if name.startswith("idle") or name == "hit" else angles[name]
            if name in ("idle1", "idle3"):
                angle += 4
            pivot = (weapon.width // 2, weapon.height - 3 * look.weapon_scale)
            turned, center = rotated(weapon, angle, pivot)
            hx, hy = hand
            bob = 1 if name in ("idle1", "idle3") else 0
            place(cell, turned, ox + hx - center[0], oy + hy - center[1] + bob)
            if look.attack == "shoot" and name in ("windup",):
                arrow, ac = rotated(load("weapon_arrow"), 90, (3, 18))
                place(cell, arrow, ox + hx - ac[0] - 6, oy + hy - ac[1])
            if look.attack == "shoot" and name == "strike":
                arrow, ac = rotated(load("weapon_arrow"), 90, (3, 18))
                place(cell, arrow, ox + hx - ac[0] + 12, oy + hy - ac[1])
            if look.attack == "cast" and name in ("strike", "follow"):
                tip_x = ox + hx + 14 * (0.6 if name == "strike" else 0.35)
                tip_y = oy + hy - 20
                for ddx, ddy, col in ((0, 0, (255, 255, 255, 255)), (-2, 1, (180, 230, 255, 255)), (2, -1, (180, 230, 255, 255)), (1, 3, (120, 200, 255, 255)), (-1, -3, (120, 200, 255, 255))):
                    x, y = int(tip_x + ddx), int(tip_y + ddy)
                    if 0 <= x < CELL and 0 <= y < CELL:
                        cell.putpixel((x, y), col)
        if shield is not None:
            place(cell, shield, ox + sx - shield.width // 2, oy + sy - shield.height // 2 + (1 if name in ("idle1", "idle3") else 0))
        frames.append(cell)
    return frames


def sheet(frames, mirror=False):
    out = Image.new("RGBA", (CELL * len(frames), CELL), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        out.paste(ImageOps.mirror(frame) if mirror else frame, (index * CELL, 0))
    return out


def hand_idle(key, palette, body_rows):
    rows = getattr(handmade, key)
    return handmade.idle_frames(rows, handmade.PALETTES[palette], body_rows)


def hand_img(key, palette):
    return handmade.draw(getattr(handmade, key), handmade.PALETTES[palette])


# Helden: Klasse x Build ------------------------------------------------------------------------
HEROES = {
    ("warrior", "tank"): Look("knight_m", weapon="weapon_knight_sword", shield="shield_steel", color=dict(hue=0.08, tint=None)),
    ("warrior", "damage"): Look("knight_m", weapon="weapon_anime_sword", color=dict(hue=-0.45, sat=1.1)),
    ("warrior", "bruiser"): Look("knight_m", weapon="weapon_regular_sword", shield="shield_rust"),
    ("mage", "tank"): Look("wizzard_m", weapon="weapon_green_magic_staff", attack="cast", color=dict(hue=-0.15)),
    ("mage", "damage"): Look("wizzard_m", weapon="weapon_red_magic_staff", attack="cast", color=dict(hue=0.18)),
    ("mage", "bruiser"): Look("wizzard_m", weapon="weapon_red_magic_staff", attack="cast"),
    ("rogue", "tank"): Look("elf_m", weapon="weapon_machete", color=dict(hue=0.5, sat=0.6)),
    ("rogue", "damage"): Look("elf_m", weapon="weapon_katana", color=dict(hue=0.62, sat=0.9)),
    ("rogue", "bruiser"): Look("elf_m", weapon="weapon_knife"),
    ("archer", "tank"): Look("elf_f", weapon="weapon_bow_2", attack="shoot", color=dict(hue=0.08, sat=0.8)),
    ("archer", "damage"): Look("elf_f", weapon="weapon_bow", attack="shoot", color=dict(hue=0.6)),
    ("archer", "bruiser"): Look("elf_f", weapon="weapon_bow", attack="shoot"),
}


def enemy_looks():
    W = lambda pal: Look(idle=hand_idle("WOLF", pal, 13), bite=hand_img("WOLF_BITE", pal), attack="bite")
    return {
        # Grauwacht-Wald
        "wolf": W("wolf"),
        "poacher": Look("lizard_f", weapon="weapon_cleaver", color=dict(hue=-0.2, sat=0.7, val=0.9)),
        "bandit": Look("masked_orc", weapon="weapon_rusty_sword"),
        "bogWolf": W("bog_wolf"),
        "boar": Look(idle=hand_idle("BOAR", "boar", 13), attack="lunge"),
        # Räuberstrasse
        "roadThief": Look("lizard_m", weapon="weapon_knife", color=dict(hue=0.45, sat=0.8)),
        "crossbowBrigand": Look("orc_warrior", weapon="weapon_bow_2", attack="shoot"),
        "ironHound": W("iron_hound"),
        "mercenaryCaptain": Look("knight_f", weapon="weapon_duel_sword", shield="shield_rust", color=dict(hue=0.55, sat=0.8)),
        "oldKnight": Look("knight_m", weapon="weapon_rusty_sword", shield="shield_rust", color=dict(sat=0.35, val=0.85)),
        # Verfluchte Felder
        "plagueCrow": Look(idle=[hand_img("CROW", "crow"), hand_img("CROW_WING_UP", "crow"), hand_img("CROW", "crow"), hand_img("CROW_WING_UP", "crow")], attack="lunge"),
        "bogGhoul": Look("swampy", attack="lunge"),
        "fieldWraith": Look("pumpkin_dude", attack="lunge"),
        "plagueWitch": Look("doc", weapon="weapon_green_magic_staff", attack="cast", color=dict(hue=0.25, sat=1.2)),
        # Aschengrund
        "ashMarauder": Look("chort", weapon="weapon_axe"),
        "cinderHound": W("cinder_hound"),
        "emberStalker": Look("imp", attack="lunge"),
        "crownSentinel": Look("knight_f", weapon="weapon_spear", shield="shield_gold", attack="thrust", color=dict(hue=-0.42, sat=1.2, val=1.05)),
        "ashenWarlord": Look("ogre", weapon="weapon_waraxe", attack="smash", color=dict(hue=0.6, sat=0.5, val=0.75)),
        # Krypta
        "ratguard": Look("orc_warrior", weapon="weapon_spear", shield="shield_rust", attack="thrust", color=dict(hue=0.1, sat=0.35, val=0.9)),
        "boneAcolyte": Look("necromancer", weapon="weapon_green_magic_staff", attack="cast", hand=(12, 16)),
        "cryptBrute": Look("big_zombie", weapon="weapon_big_hammer", attack="smash"),
        # Eisenbruch
        "chainWarden": Look("orc_shaman", weapon="weapon_baton_with_spikes", attack="smash", color=dict(sat=0.4, val=0.85)),
        "oathForger": Look("dwarf_m", weapon="weapon_big_hammer", attack="smash", color=dict(hue=-0.05, sat=1.1)),
        "ironDuke": Look("knight_m", weapon="weapon_lavish_sword", crown=True, color=dict(hue=-0.4, sat=0.9)),
        # Turm
        "towerWarden": Look("ogre", weapon="weapon_hammer", attack="smash", color=dict(hue=0.42, sat=0.9)),
        # Aschenkathedrale
        "emberPriest": Look("wizzard_f", weapon="weapon_red_magic_staff", attack="cast", color=dict(hue=0.38, sat=1.2)),
        "crownBeast": Look("big_demon", attack="lunge", crown=True),
        "hollowChampion": Look("big_zombie", weapon="weapon_anime_sword", attack="slash", color=dict(hue=0.45, sat=0.8)),
    }
