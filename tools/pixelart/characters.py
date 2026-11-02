"""Held und Gegner als Pixel-Art (64x64 pro Frame, 3 Frames: Ruhe A, Ruhe B, Angriff).

Gezeichnet wird nach rechts schauend; Gegner werden beim Speichern gespiegelt.
Die Beschreibungen (Form, Kopf, Waffe, Farben) entsprechen den Gegnern in scripts/data-world.js.
"""

import math

from pixel import Sprite

SIZE = 64
FRAMES = ("idle0", "idle1", "attack")

BASE_COLORS = {"main": "#6a7380", "main2": "#555d68", "dark": "#2a2f38", "accent": "#4a6a8a", "metal": "#b8c0ca",
               "skin": "#d9a982", "glow": "#f1c96b", "wood": "#7a5432", "bone": "#e6dcc2", "leather": "#6b4a2e"}

# Heldin/Held: Klasse x Build
HERO_LOOKS = {
    "warrior": {
        "base": {"head": "helm", "weapon": "sword", "off": "buckler", "armored": True,
                 "colors": {"main": "#5a5f6a", "main2": "#474b54", "accent": "#9a3434", "metal": "#c8d0dc", "skin": "#e0b48f"}},
        "tank": {"off": "tower", "extras": ["plume"], "colors": {"main": "#5b6f8a", "main2": "#475a73", "accent": "#3a5aa8"}},
        "damage": {"head": "horns", "weapon": "greatsword", "off": "none", "extras": ["cape"], "colors": {"main": "#7a2f2f", "main2": "#622525", "accent": "#d8ae4b"}},
        "bruiser": {},
    },
    "mage": {
        "base": {"head": "hat", "weapon": "staff", "off": "orb", "robe": True,
                 "colors": {"main": "#334a8a", "main2": "#283b6a", "accent": "#d8ae4b", "metal": "#b08a5a", "skin": "#e0b48f", "glow": "#8af0ff"}},
        "tank": {"colors": {"main": "#2f6070", "main2": "#244a58", "accent": "#9af0ff"}},
        "damage": {"colors": {"main": "#6a2a6a", "main2": "#4f1f4f", "accent": "#ff8ad5", "glow": "#ff8ad5"}},
        "bruiser": {},
    },
    "rogue": {
        "base": {"head": "hood", "weapon": "knife", "off": "knife",
                 "colors": {"main": "#3a3f47", "main2": "#2b2f35", "accent": "#2f6a58", "metal": "#d6dbe2", "skin": "#e0b48f", "glow": "#7cf0b8"}},
        "tank": {"extras": ["cape"], "colors": {"accent": "#555b66"}},
        "damage": {"colors": {"accent": "#8a2f2f"}},
        "bruiser": {},
    },
    "archer": {
        "base": {"head": "cap", "weapon": "bow", "off": "none", "extras": ["quiver"],
                 "colors": {"main": "#3e5a35", "main2": "#30472a", "accent": "#8a6a3a", "metal": "#b08a5a", "skin": "#e0b48f"}},
        "tank": {"extras": ["quiver", "cape"], "colors": {"main": "#4a5a4a"}},
        "damage": {"colors": {"accent": "#b8452f"}},
        "bruiser": {},
    },
}

ENEMIES = {
    # Grauwacht-Wald
    "wolf": {"form": "wolf", "colors": {"main": "#6b7480", "main2": "#4f5761", "accent": "#a3acb6", "glow": "#f1c96b"}},
    "poacher": {"head": "cap", "weapon": "knife", "extras": ["quiver"], "colors": {"main": "#5b4a2e", "main2": "#4a3c25", "accent": "#6e7a3c", "metal": "#c9ced6"}},
    "bandit": {"head": "hood", "weapon": "sword", "colors": {"main": "#6b4b33", "main2": "#573d29", "accent": "#3d5a3f", "metal": "#c9ced6"}},
    "bogWolf": {"form": "wolf", "extras": ["moss"], "colors": {"main": "#4d5a3a", "main2": "#3c472d", "accent": "#8fae62", "glow": "#b8f06a"}},
    "boar": {"form": "boar", "colors": {"main": "#6a4a35", "main2": "#4f3626", "accent": "#3b2a1f", "bone": "#efe6cf", "glow": "#ff6a4a"}},
    # Räuberstrasse
    "roadThief": {"head": "mask", "weapon": "knife", "off": "knife", "colors": {"main": "#4a3b5c", "main2": "#3a2e49", "accent": "#2a2233", "metal": "#c9ced6"}},
    "crossbowBrigand": {"head": "hood", "weapon": "crossbow", "colors": {"main": "#4b4a52", "main2": "#3c3b42", "accent": "#8a3a3a"}},
    "ironHound": {"form": "wolf", "extras": ["collar"], "colors": {"main": "#7d8794", "main2": "#5f6873", "accent": "#b0884a", "glow": "#ff8a4c"}},
    "mercenaryCaptain": {"head": "helm", "weapon": "sword", "off": "shield", "armored": True, "extras": ["cape", "plume"], "colors": {"main": "#5a4632", "main2": "#47382a", "accent": "#b8452f", "metal": "#b8c0ca"}},
    "oldKnight": {"head": "helm", "weapon": "sword", "off": "shield", "armored": True, "extras": ["plume"], "colors": {"main": "#7a6a55", "main2": "#635645", "metal": "#8e969e", "accent": "#4a6a8a"}},
    # Verfluchte Felder
    "plagueCrow": {"form": "crow", "colors": {"main": "#2d2f3a", "main2": "#22242d", "accent": "#6a8a3a", "metal": "#c9a24a", "glow": "#b8f06a"}},
    "bogGhoul": {"form": "wraith", "extras": ["claws"], "colors": {"main": "#4f6146", "main2": "#3c4b35", "accent": "#8fae62", "glow": "#d6ff6a"}},
    "fieldWraith": {"form": "wraith", "colors": {"main": "#8f9bae", "main2": "#6b7789", "accent": "#c7d2e2", "glow": "#9af0ff"}},
    "plagueWitch": {"head": "hat", "weapon": "staff", "off": "potion", "robe": True, "colors": {"main": "#33402c", "main2": "#283322", "accent": "#6a8a3a", "skin": "#a9b98f", "metal": "#8a7a5a", "glow": "#b8f06a"}},
    # Aschengrund
    "ashMarauder": {"head": "mask", "weapon": "axe", "colors": {"main": "#4a3a36", "main2": "#3b2e2b", "accent": "#a8452f", "metal": "#a9aeb5", "glow": "#ff8a4c"}},
    "cinderHound": {"form": "wolf", "extras": ["stripes", "collar"], "colors": {"main": "#3a3434", "main2": "#2c2727", "accent": "#ff5a2a", "glow": "#ffcf5a"}},
    "emberStalker": {"form": "wolf", "extras": ["stripes"], "colors": {"main": "#5a2c22", "main2": "#46221b", "accent": "#ff7a3a", "glow": "#ffb347"}},
    "crownSentinel": {"head": "crownHelm", "weapon": "spear", "off": "tower", "armored": True, "colors": {"main": "#5a4a2a", "main2": "#463a20", "metal": "#d6c27a", "accent": "#6a2f8a"}},
    "ashenWarlord": {"head": "horns", "weapon": "greatsword", "armored": True, "extras": ["cape"], "scale": 1.08, "colors": {"main": "#3a3434", "main2": "#2d2828", "metal": "#7d8186", "accent": "#ff6a2a", "glow": "#ffb347"}},
    # Krypta
    "ratguard": {"form": "rat", "weapon": "spear", "off": "shield", "armored": True, "scale": 1.05, "colors": {"main": "#6a6f78", "main2": "#565a62", "accent": "#8a5a3a", "metal": "#a9b0b8", "skin": "#8a7a6c", "glow": "#ff5a5a"}},
    "boneAcolyte": {"head": "skull", "weapon": "staff", "robe": True, "colors": {"main": "#3a3442", "main2": "#2e2935", "accent": "#c9c1ad", "metal": "#9a8a6a", "bone": "#ded6c0", "glow": "#9af0ff"}},
    "cryptBrute": {"head": "bald", "weapon": "hammer", "build": "brute", "extras": ["chains"], "scale": 1.08, "colors": {"main": "#4d564a", "main2": "#3c443a", "skin": "#8a9a86", "accent": "#6a7466", "metal": "#8a8f96", "glow": "#9af0ff"}},
    # Eisenbruch
    "chainWarden": {"head": "helm", "weapon": "flail", "off": "shield", "armored": True, "extras": ["chains"], "scale": 1.06, "colors": {"main": "#4a4d52", "main2": "#3a3d42", "metal": "#7a7f86", "accent": "#b88a3a"}},
    "oathForger": {"head": "helm", "weapon": "hammer", "build": "brute", "extras": ["apron"], "scale": 1.08, "colors": {"main": "#4a3a30", "main2": "#3b2e26", "accent": "#ff8a3a", "metal": "#77716c", "skin": "#b08a6a", "glow": "#ffb347"}},
    "ironDuke": {"head": "crownHelm", "weapon": "greatsword", "armored": True, "extras": ["cape"], "scale": 1.1, "colors": {"main": "#6a7280", "main2": "#555c68", "metal": "#b5bcc6", "accent": "#8a2a3a", "glow": "#ffcf5a"}},
    # Turm
    "towerWarden": {"head": "helm", "weapon": "hammer", "off": "tower", "armored": True, "extras": ["runes"], "scale": 1.12, "colors": {"main": "#3d3566", "main2": "#2e2850", "metal": "#a99ad6", "accent": "#b089ff", "glow": "#d5b8ff"}},
    # Aschenkathedrale
    "emberPriest": {"head": "hood", "weapon": "staff", "robe": True, "scale": 1.05, "colors": {"main": "#6a2a22", "main2": "#55211b", "accent": "#ffb347", "metal": "#c98a3a", "glow": "#ff7a3a", "skin": "#c9a08a"}},
    "crownBeast": {"form": "boar", "extras": ["crown"], "scale": 1.12, "colors": {"main": "#4a2f4a", "main2": "#3a243a", "accent": "#2a1a2a", "bone": "#f4e7c0", "metal": "#e2b855", "glow": "#ff6ad5"}},
    "hollowChampion": {"head": "horns", "weapon": "greatsword", "build": "champion", "armored": True, "extras": ["cape", "runes"], "scale": 1.12, "colors": {"main": "#3b254d", "main2": "#2e1d3c", "metal": "#e8d38a", "accent": "#b98ae0", "skin": "#cbb8d9", "glow": "#34d5d8"}},
}


def merge(*specs):
    out = {"colors": {}, "extras": []}
    for spec in specs:
        for key, value in (spec or {}).items():
            if key == "colors":
                out["colors"].update(value)
            elif key == "extras":
                out["extras"] = list(value)
            else:
                out[key] = value
    return out


def hero_spec(class_id, build):
    looks = HERO_LOOKS[class_id]
    return merge({"form": "humanoid"}, looks["base"], looks.get(build, {}))


def enemy_spec(enemy_id):
    return merge({"form": "humanoid", "head": "helm", "weapon": "sword", "off": "none"}, ENEMIES[enemy_id])


# --------------------------------------------------------------------------------------
class Rig:
    """Rechnet Koordinaten mit Skalierung um den Fusspunkt und Versatz des Oberkörpers."""

    def __init__(self, scale=1.0, dx=0, dy=0):
        self.k = scale
        self.dx = dx
        self.dy = dy

    def p(self, x, y, upper=True):
        ox = self.dx if upper else 0
        oy = self.dy if upper else 0
        return (32 + (x - 32) * self.k + ox, 60 + (y - 60) * self.k + oy)

    def s(self, value):
        return value * self.k


def setup_materials(s, colors):
    palette = dict(BASE_COLORS)
    palette.update(colors)
    for name, value in palette.items():
        s.material(name, value)
    s.material("shadowcloth", palette["main2"], spread=0.10)
    s.material("eye", palette["glow"], spread=0.16)
    s.material("void", "#14101c", spread=0.04)
    return palette


def direction(angle_deg):
    a = math.radians(angle_deg)
    return math.sin(a), -math.cos(a)


def draw_weapon(s, rig, kind, hand, angle, frame):
    hx, hy = hand
    ux, uy = direction(angle)
    nx, ny = -uy, ux
    k = rig.k

    def at(dist, side=0.0):
        return (hx + ux * dist * k + nx * side * k, hy + uy * dist * k + ny * side * k)

    if kind == "sword":
        s.line(*at(-3), *at(0), "leather", width=2)
        s.line(*at(1, -3), *at(1, 3), "accent", width=2)
        s.poly([at(2, -1.2), at(15, -1.2), at(18, 0), at(15, 1.2), at(2, 1.2)], "metal")
        s.line(*at(3, -0.4), *at(14, -0.4), "metal", shade=4)
    elif kind == "greatsword":
        s.line(*at(-5), *at(0), "leather", width=2)
        s.line(*at(1, -4), *at(1, 4), "accent", width=2)
        s.poly([at(2, -2), at(21, -2), at(25, 0), at(21, 2), at(2, 2)], "metal")
        s.line(*at(3, -0.8), *at(21, -0.8), "metal", shade=4)
        s.line(*at(3, 0.8), *at(20, 0.8), "metal", shade=1)
    elif kind == "knife":
        s.line(*at(-2), *at(0), "leather", width=2)
        s.poly([at(1, -1), at(7, -1), at(9, 0), at(7, 1), at(1, 1)], "metal")
    elif kind == "axe":
        s.line(*at(-3), *at(15), "wood", width=2)
        s.poly([at(10, 0), at(10, 6), at(13, 8), at(16, 6), at(16, 0)], "metal")
        s.line(*at(11, 7), *at(15, 7), "metal", shade=4)
    elif kind == "spear":
        s.line(*at(-9), *at(22), "wood", width=2)
        s.poly([at(21, -2), at(27, 0), at(21, 2)], "metal")
        s.line(*at(20, -2), *at(20, 2), "accent")
    elif kind == "hammer":
        s.line(*at(-3), *at(15), "wood", width=2)
        s.poly([at(13, -6), at(19, -6), at(19, 5), at(13, 5)], "metal")
        s.line(*at(13, -5), *at(13, 4), "accent")
    elif kind == "flail":
        s.line(*at(-2), *at(7), "wood", width=2)
        bx, by = at(13, 3 if frame != "attack" else -1)
        for t in (0.25, 0.5, 0.75):
            cx = at(7)[0] + (bx - at(7)[0]) * t
            cy = at(7)[1] + (by - at(7)[1]) * t
            s.pixel(cx, cy, "metal", shade=3)
        r = 3 * k
        s.ellipse(bx - r, by - r, bx + r, by + r, "metal")
        s.pixels([(bx - r - 1, by), (bx + r + 1, by), (bx, by - r - 1), (bx, by + r + 1)], "metal", shade=1)
    elif kind == "staff":
        s.line(*at(-15), *at(16), "metal", width=2)
        ox, oy = at(19)
        r = 2.6 * k
        s.ellipse(ox - r, oy - r, ox + r, oy + r, "eye", shade=3)
        s.pixel(ox - 1, oy - 1, "eye", shade=4)
        s.line(*at(15, -2), *at(17, -3), "metal")
        s.line(*at(15, 2), *at(17, 3), "metal")
        if frame == "attack":
            for dist, side in ((24, 0), (22, -4), (22, 4), (27, -2), (27, 2)):
                s.pixel(*at(dist, side), "eye", shade=4)
    elif kind == "crossbow":
        s.line(*at(-4), *at(10), "wood", width=2)
        s.line(*at(8, -6), *at(10, 0), "leather", width=1)
        s.line(*at(10, 0), *at(8, 6), "leather", width=1)
        s.line(*at(8, -6), *at(2, 0), "bone")
        s.line(*at(2, 0), *at(8, 6), "bone")
        if frame != "attack":
            s.line(*at(2), *at(13), "metal")
        else:
            s.line(*at(14), *at(22), "metal", shade=4)
    elif kind == "bow":
        # Bogen senkrecht vor der Hand, Sehne und Pfeil
        top = (hx + 2 * k, hy - 13 * k)
        bottom = (hx + 2 * k, hy + 13 * k)
        mid = (hx + 6 * k, hy)
        s.line(top[0], top[1], mid[0], mid[1] - 6 * k, "wood", width=2)
        s.line(mid[0], mid[1] - 6 * k, mid[0], mid[1] + 6 * k, "wood", width=2)
        s.line(mid[0], mid[1] + 6 * k, bottom[0], bottom[1], "wood", width=2)
        string_x = hx - (3 if frame != "attack" else -1) * k
        s.line(top[0], top[1], string_x, hy, "bone")
        s.line(string_x, hy, bottom[0], bottom[1], "bone")
        if frame != "attack":
            s.line(string_x, hy, hx + 12 * k, hy, "wood")
            s.pixels([(hx + 12 * k, hy), (hx + 11 * k, hy - 1), (hx + 11 * k, hy + 1)], "metal", shade=3)
        else:
            s.line(hx + 16 * k, hy, hx + 26 * k, hy, "wood")
            s.pixel(hx + 26 * k, hy, "metal", shade=4)


def draw_offhand(s, rig, kind, hand):
    hx, hy = hand
    k = rig.k
    if kind == "shield":
        r = 5.5 * k
        s.ellipse(hx - r, hy - r, hx + r, hy + r, "metal")
        r2 = 4 * k
        s.ellipse(hx - r2, hy - r2, hx + r2, hy + r2, "accent")
        s.pixel(hx, hy, "metal", shade=4)
    elif kind == "buckler":
        r = 4 * k
        s.ellipse(hx - r, hy - r, hx + r, hy + r, "metal")
        r2 = 2.5 * k
        s.ellipse(hx - r2, hy - r2, hx + r2, hy + r2, "main2")
        s.pixel(hx, hy, "metal", shade=4)
    elif kind == "tower":
        s.poly([(hx - 5 * k, hy - 9 * k), (hx + 5 * k, hy - 9 * k), (hx + 5 * k, hy + 5 * k), (hx, hy + 9 * k), (hx - 5 * k, hy + 5 * k)], "metal")
        s.poly([(hx - 3.5 * k, hy - 7.5 * k), (hx + 3.5 * k, hy - 7.5 * k), (hx + 3.5 * k, hy + 4.5 * k), (hx, hy + 7 * k), (hx - 3.5 * k, hy + 4.5 * k)], "accent")
        s.line(hx, hy - 6 * k, hx, hy + 5 * k, "metal", shade=3)
        s.line(hx - 3 * k, hy - 2 * k, hx + 3 * k, hy - 2 * k, "metal", shade=3)
    elif kind == "orb":
        r = 2.2 * k
        s.ellipse(hx - r, hy - r - 2, hx + r, hy + r - 2, "eye", shade=3)
        s.pixel(hx - 1, hy - 3, "eye", shade=4)
    elif kind == "potion":
        s.rect(hx - 1, hy - 5, hx, hy - 4, "bone")
        s.ellipse(hx - 3, hy - 4, hx + 2, hy + 1, "eye")
        s.pixel(hx - 1, hy - 3, "eye", shade=4)
    elif kind == "knife":
        s.poly([(hx, hy), (hx - 2, hy + 7), (hx - 1, hy + 7), (hx + 1, hy)], "metal")


def draw_head(s, rig, kind, center, spec):
    cx, cy = center
    k = rig.k
    r = 5.5 * k

    def face():
        s.ellipse(cx - r, cy - r, cx + r, cy + r, "skin")

    def eye(glow=False):
        if glow:
            s.pixel(cx + 3 * k, cy, "eye", shade=4)
        else:
            s.pixel(cx + 3 * k, cy, "void", shade=0)

    if kind == "helm" or kind in ("horns", "crownHelm"):
        s.ellipse(cx - r - 0.5, cy - r - 1, cx + r + 0.5, cy + r, "metal")
        s.rect(cx - r, cy - 1, cx + r, cy + r + 1, "metal")
        s.rect(cx + 0.5, cy - 0.5, cx + r + 0.5, cy + 0.6, "void", shade=0)
        s.pixel(cx + 3 * k, cy, "eye", shade=4)
        s.line(cx - r + 2, cy - r + 1, cx - 1, cy - r - 0.5, "metal", shade=4)
        if kind == "horns":
            s.poly([(cx - r, cy - 2), (cx - r - 5 * k, cy - 6 * k), (cx - r - 4 * k, cy - 11 * k), (cx - r - 1, cy - 5)], "bone")
            s.poly([(cx + r - 1, cy - 4), (cx + r + 3 * k, cy - 7 * k), (cx + r + 2 * k, cy - 12 * k), (cx + r - 3, cy - 6)], "bone")
        if kind == "crownHelm":
            base_y = cy - r - 1
            s.rect(cx - r + 1, base_y - 1, cx + r - 1, base_y + 1, "accent")
            for px in (-4, 0, 4):
                s.poly([(cx + px * k - 1.5, base_y - 1), (cx + px * k, base_y - 5 * k), (cx + px * k + 1.5, base_y - 1)], "accent")
    elif kind == "hood" or kind == "mask":
        # Kapuze: Stoff aussen, Gesicht im Schatten (obere Zeilen dunkel), Auge als einzelnes Pixel
        s.ellipse(cx - r - 1.5, cy - r - 2, cx + r + 1, cy + r + 3, "accent")
        s.poly([(cx - r - 1.5, cy + 2), (cx - r - 3, cy + r + 4), (cx + 1, cy + r + 3)], "accent")
        if spec.get("show_face", True):
            s.rect(cx + 0.5, cy - 2.5, cx + r + 0.5, cy + 4, "skin")
            s.rect(cx + 0.5, cy - 2.5, cx + r + 0.5, cy - 1.5, "void", shade=2)
            s.pixel(cx + 0.5, cy - 0.5, "void", shade=2)
            s.pixel(cx + 3.5, cy, "void", shade=0)
            s.pixel(cx + r + 0.5, cy + 1, "skin", shade=2)
        else:
            s.rect(cx + 0.5, cy - 2.5, cx + r + 0.5, cy + 4, "void", shade=1)
            s.pixel(cx + 3.5, cy, "eye", shade=4)
        s.line(cx - 1, cy - r - 1, cx + r - 1, cy - 2.5, "accent", shade=3)
        if kind == "mask":
            s.rect(cx + 0.5, cy + 1.5, cx + r + 1, cy + 4, "dark")
            s.pixel(cx + 0.5, cy + 1.5, "dark", shade=3)
    elif kind == "cap":
        face()
        eye(False)
        s.ellipse(cx - r, cy - r - 1.5, cx + r, cy - 0.5, "accent")
        s.rect(cx - r, cy - 3, cx + r, cy - 2, "accent")
        s.line(cx + 2, cy - 2, cx + r + 4, cy - 1, "accent", width=1)
        s.pixel(cx - r - 1, cy - 4, "eye", shade=4) if spec.get("feather") else None
    elif kind == "hat":
        face()
        eye(spec.get("glow_eyes", False))
        s.line(cx - r - 4, cy - 3, cx + r + 4, cy - 4, "main2", width=2)
        s.poly([(cx - r + 1, cy - 4), (cx + r - 1, cy - 5), (cx - 1, cy - 17 * k), (cx - 6 * k, cy - 15 * k)], "main")
        s.line(cx - r + 1, cy - 5, cx + r - 1, cy - 6, "accent", width=1)
    elif kind == "skull":
        s.ellipse(cx - r - 1.5, cy - r - 2, cx + r + 1, cy + r + 3, "main")
        s.ellipse(cx - r + 1, cy - r + 0.5, cx + r - 0.5, cy + r - 1, "bone")
        s.rect(cx - 1, cy + 2, cx + r - 1, cy + 4, "bone")
        s.rect(cx + 1, cy - 1, cx + 2, cy + 0, "void", shade=0)
        s.rect(cx + 3.5, cy - 1, cx + 4.5, cy + 0, "void", shade=0)
        s.pixel(cx + 4, cy - 1, "eye", shade=4)
        s.pixels([(cx + 1, cy + 3), (cx + 3, cy + 3)], "void", shade=0)
    elif kind == "bald":
        face()
        s.line(cx + 1, cy - 2, cx + r, cy - 2.5, "main2", width=1)
        s.pixel(cx + 3 * k, cy - 1, "eye", shade=4)
        s.line(cx + 2, cy + 3, cx + 4, cy + 3, "void", shade=0)
    elif kind == "rat":
        s.ellipse(cx - r, cy - r, cx + r, cy + r, "skin")
        s.poly([(cx + 2, cy - 3), (cx + r + 6 * k, cy + 1), (cx + r + 6 * k, cy + 2), (cx + 2, cy + 4)], "skin")
        s.pixel(cx + r + 6 * k, cy + 1, "void", shade=0)
        s.ellipse(cx - 5, cy - r - 4, cx - 1, cy - r + 1, "skin")
        s.ellipse(cx - 4, cy - r - 3, cx - 2, cy - r, "accent", shade=3)
        s.pixel(cx + 3 * k, cy - 1, "eye", shade=4)
        s.ellipse(cx - r, cy - r - 1, cx + r - 2, cy - 1, "metal")
    else:
        face()
        eye(False)


def draw_humanoid(s, spec, frame):
    scale = spec.get("scale", 1.0) * 1.1
    build = spec.get("build", "normal")
    bob = 1 if frame == "idle1" else 0
    lean = 2 if frame == "attack" else 0
    rig = Rig(scale, dx=lean, dy=bob)
    extras = set(spec.get("extras", []))
    armored = spec.get("armored", False)
    body_mat = "main"

    if build == "brute":
        sh_half, waist_half, shoulder_y, waist_y, head_c, arm_w = 10, 8, 33, 46, (33, 25), 5
    elif build == "champion":
        sh_half, waist_half, shoulder_y, waist_y, head_c, arm_w = 8, 5.5, 27, 43, (31, 18), 4
    else:
        sh_half, waist_half, shoulder_y, waist_y, head_c, arm_w = 7, 5, 31, 45, (31, 23), 4
    cx = 30

    # Umhang hinter allem
    if "cape" in extras:
        sway = 1 if frame == "idle1" else (3 if frame == "attack" else 0)
        s.poly([rig.p(cx - sh_half + 1, shoulder_y), rig.p(cx + 2, shoulder_y), rig.p(cx - 2, 58, upper=False),
                rig.p(cx - sh_half - 6 - sway, 59, upper=False), rig.p(cx - sh_half - 4 - sway, 46)], "accent")
    if "quiver" in extras:
        s.line(*rig.p(cx - 7, shoulder_y + 12), *rig.p(cx - 2, shoulder_y - 2), "leather", width=4)
        for off in (-2, 0, 2):
            s.line(*rig.p(cx - 2 + off, shoulder_y - 2), *rig.p(cx - 1 + off, shoulder_y - 6), "bone")

    back_shoulder = rig.p(cx - sh_half + 2, shoulder_y + 1)
    back_hand = rig.p(cx - sh_half - 1, waist_y - 3)
    front_shoulder = rig.p(cx + sh_half - 2, shoulder_y + 1)
    if frame == "attack":
        front_hand = rig.p(cx + sh_half + 6, shoulder_y + 6)
    else:
        front_hand = rig.p(cx + sh_half + 2, waist_y - 4)

    arm_mat = "metal" if armored else "main2"
    s.line(*back_shoulder, *back_hand, arm_mat, width=arm_w * scale)

    # Beine oder Robe
    if spec.get("robe"):
        s.poly([rig.p(cx - sh_half, shoulder_y), rig.p(cx + sh_half, shoulder_y), rig.p(cx + sh_half + 4, 59, upper=False), rig.p(cx - sh_half - 4, 59, upper=False)], body_mat)
        s.line(*rig.p(cx + 1, shoulder_y + 2), *rig.p(cx + 2, 58, upper=False), "accent", width=2)
        s.rect(*rig.p(cx - sh_half + 1, waist_y - 3), *rig.p(cx + sh_half - 1, waist_y - 2), "accent")
    else:
        leg_mat = "metal" if armored else "dark"
        s.poly([rig.p(cx - 5, waist_y, upper=False), rig.p(cx - 1, waist_y, upper=False), rig.p(cx - 2, 57, upper=False), rig.p(cx - 6, 57, upper=False)], leg_mat)
        s.poly([rig.p(cx + 1, waist_y, upper=False), rig.p(cx + 5, waist_y, upper=False), rig.p(cx + 6, 57, upper=False), rig.p(cx + 2, 57, upper=False)], leg_mat)
        s.rect(*rig.p(cx - 7, 56, upper=False), *rig.p(cx - 1, 59, upper=False), "dark")
        s.rect(*rig.p(cx + 1, 56, upper=False), *rig.p(cx + 8, 59, upper=False), "dark")
        # Oberkörper
        torso = [rig.p(cx - sh_half, shoulder_y), rig.p(cx + sh_half, shoulder_y), rig.p(cx + waist_half, waist_y), rig.p(cx - waist_half, waist_y)]
        s.poly(torso, "metal" if armored else body_mat)
        if armored:
            s.poly([rig.p(cx - sh_half + 2, shoulder_y + 2), rig.p(cx + sh_half - 2, shoulder_y + 2), rig.p(cx + waist_half - 1, waist_y - 3), rig.p(cx - waist_half + 1, waist_y - 3)], body_mat)
            s.ellipse(*rig.p(cx - sh_half - 1, shoulder_y - 2), *rig.p(cx - sh_half + 5, shoulder_y + 3), "metal")
        else:
            s.line(*rig.p(cx - sh_half + 2, shoulder_y + 3), *rig.p(cx + 1, waist_y - 2), "accent", width=2)
        s.rect(*rig.p(cx - waist_half, waist_y - 2), *rig.p(cx + waist_half, waist_y), "leather")
        s.pixel(*rig.p(cx + 2, waist_y - 1), "metal", shade=4)
        # Schurz (Röckchen) zwischen Gürtel und Beinen
        s.poly([rig.p(cx - waist_half, waist_y), rig.p(cx + waist_half, waist_y), rig.p(cx + waist_half + 1, waist_y + 5), rig.p(cx - waist_half - 1, waist_y + 5)], "main2")
    if "apron" in extras:
        s.poly([rig.p(cx - 4, shoulder_y + 4), rig.p(cx + 5, shoulder_y + 4), rig.p(cx + 6, waist_y + 6), rig.p(cx - 5, waist_y + 6)], "leather")
    if "chains" in extras:
        a, b = rig.p(cx - sh_half + 1, shoulder_y + 2), rig.p(cx + waist_half, waist_y - 2)
        for index in range(7):
            t = index / 6
            s.pixel(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, "metal", shade=3 if index % 2 else 1)
    if "runes" in extras:
        rx, ry = rig.p(cx, shoulder_y + 6)
        s.pixels([(rx, ry - 2), (rx - 2, ry), (rx + 2, ry), (rx, ry + 2), (rx, ry)], "eye", shade=4)

    # Nebenhand vor dem Körper
    off = spec.get("off", "none")
    two_handed = spec.get("weapon") in ("greatsword", "bow", "crossbow")
    if not two_handed and off != "none":
        draw_offhand(s, rig, off, back_hand)
    s.ellipse(back_hand[0] - 1.5, back_hand[1] - 1.5, back_hand[0] + 1.5, back_hand[1] + 1.5, "skin")

    # Hals und Kopf
    hx, hy = rig.p(*head_c)
    s.rect(hx - 2, hy + 4, hx + 1, hy + 7, "skin")
    draw_head(s, rig, spec.get("head", "helm"), (hx, hy), spec)
    if "plume" in extras:
        s.poly([(hx - 2, hy - 6 * scale), (hx - 9 * scale, hy - 9 * scale - bob), (hx - 7 * scale, hy - 4 * scale), (hx - 2, hy - 4 * scale)], "accent")

    # Waffe und vorderer Arm
    weapon = spec.get("weapon", "sword")
    idle_angles = {"sword": 32, "greatsword": 28, "knife": 70, "axe": 28, "spear": 14, "hammer": 22, "flail": 40, "staff": 8, "crossbow": 90, "bow": 0}
    attack_angles = {"sword": 112, "greatsword": 118, "knife": 95, "axe": 120, "spear": 78, "hammer": 128, "flail": 115, "staff": 38, "crossbow": 90, "bow": 0}
    angle = attack_angles.get(weapon, 100) if frame == "attack" else idle_angles.get(weapon, 30)
    if frame == "idle1":
        angle += 3
    draw_weapon(s, rig, weapon, front_hand, angle, frame)
    s.line(*front_shoulder, *front_hand, arm_mat, width=arm_w * scale)
    s.ellipse(front_hand[0] - 1.5, front_hand[1] - 1.5, front_hand[0] + 1.5, front_hand[1] + 1.5, "skin")
    if two_handed and weapon == "greatsword":
        s.line(*back_shoulder, *front_hand, arm_mat, width=3 * scale)


def draw_rat(s, spec, frame):
    rig = Rig(spec.get("scale", 1.0) * 1.1, dx=2 if frame == "attack" else 0, dy=1 if frame == "idle1" else 0)
    sway = 2 if frame == "idle1" else 0
    s.line(*rig.p(26, 50, upper=False), *rig.p(14, 52 + sway, upper=False), "skin", width=2)
    s.line(*rig.p(14, 52 + sway, upper=False), *rig.p(8, 47 + sway, upper=False), "skin", width=1)
    spec = dict(spec, head="rat")
    draw_humanoid(s, spec, frame)


def draw_wolf(s, spec, frame):
    k = spec.get("scale", 1.0)
    rig = Rig(k, dx=3 if frame == "attack" else 0, dy=1 if frame == "idle1" else 0)
    extras = set(spec.get("extras", []))
    stride = 3 if frame == "attack" else 0
    # Schwanz, buschig
    sway = 1 if frame == "idle1" else 0
    s.poly([rig.p(15, 35), rig.p(10, 38), rig.p(6 - sway, 45), rig.p(5 - sway, 51), rig.p(8 - sway, 52), rig.p(11, 46), rig.p(16, 41)], "main")
    s.pixels([rig.p(6 - sway, 50), rig.p(7 - sway, 51)], "accent", shade=3)
    # Hinterbeine (weit) mit Sprunggelenk
    for x0, mat in ((15, "main2"), (34 + stride, "main2")):
        s.poly([rig.p(x0, 42, upper=False), rig.p(x0 + 6, 42, upper=False), rig.p(x0 + 4, 50, upper=False), rig.p(x0 + 5, 58, upper=False),
                rig.p(x0 + 2, 58, upper=False), rig.p(x0 + 1, 51, upper=False), rig.p(x0 - 1, 47, upper=False)], mat)
        s.rect(*rig.p(x0 + 1, 58, upper=False), *rig.p(x0 + 6, 59, upper=False), "dark")
    # Rumpf: Rücken fällt zur Hüfte ab, Brust tief, Bauch eingezogen
    s.poly([rig.p(13, 37), rig.p(20, 33), rig.p(34, 32), rig.p(42, 30), rig.p(49, 36), rig.p(49, 44), rig.p(42, 47),
            rig.p(32, 45), rig.p(24, 46), rig.p(15, 46)], "main")
    s.poly([rig.p(42, 38), rig.p(49, 37), rig.p(49, 44), rig.p(42, 47)], "accent")
    for x0, y0 in ((22, 34), (28, 33), (34, 33), (40, 31)):
        s.pixel(*rig.p(x0, y0), "main", shade=4)
    s.line(*rig.p(18, 44), *rig.p(30, 44), "main2", shade=1)
    if "stripes" in extras:
        for x0 in (20, 26, 32, 38):
            s.line(*rig.p(x0, 34), *rig.p(x0 - 2, 40), "eye", shade=3)
    if "moss" in extras:
        for x0, y0 in ((18, 35), (24, 34), (30, 33), (36, 33), (21, 36), (40, 32)):
            s.pixel(*rig.p(x0, y0), "accent", shade=3)
    # Vorderbeine
    for x0 in (22, 42 + stride):
        s.poly([rig.p(x0, 42, upper=False), rig.p(x0 + 4, 42, upper=False), rig.p(x0 + 4, 58, upper=False), rig.p(x0 + 1, 58, upper=False)], "main")
        s.rect(*rig.p(x0, 58, upper=False), *rig.p(x0 + 5, 59, upper=False), "main2")
    # Kopf
    jaw = 3 if frame == "attack" else 0
    s.poly([rig.p(43, 30), rig.p(50, 24), rig.p(56, 27), rig.p(63, 31), rig.p(63, 34), rig.p(55, 36), rig.p(48, 40)], "main")
    s.poly([rig.p(52, 35), rig.p(62, 35 + jaw), rig.p(61, 37 + jaw), rig.p(51, 39)], "main2")
    if jaw:
        s.pixels([rig.p(55, 36), rig.p(58, 37), rig.p(60, 37)], "bone", shade=4)
    s.pixel(*rig.p(63, 32), "void", shade=0)
    s.poly([rig.p(47, 26), rig.p(48, 18), rig.p(52, 25)], "main")
    s.poly([rig.p(50, 25), rig.p(52, 18), rig.p(54, 26)], "main2")
    s.pixel(*rig.p(48, 22), "accent", shade=1)
    s.pixel(*rig.p(55, 29), "eye", shade=4)
    s.pixel(*rig.p(54, 29), "eye", shade=3)
    if "collar" in extras:
        s.line(*rig.p(45, 30), *rig.p(47, 41), "accent", width=2)
        s.pixels([rig.p(44, 32), rig.p(45, 36), rig.p(46, 40)], "metal", shade=4)


def draw_boar(s, spec, frame):
    k = spec.get("scale", 1.0)
    rig = Rig(k, dx=3 if frame == "attack" else 0, dy=1 if frame == "idle1" else 0)
    extras = set(spec.get("extras", []))
    stride = 2 if frame == "attack" else 0
    for x0 in (16, 36 + stride):
        s.rect(*rig.p(x0, 46, upper=False), *rig.p(x0 + 4, 59, upper=False), "main2")
    s.line(*rig.p(10, 36), *rig.p(6, 41), "main2", width=2)
    s.ellipse(*rig.p(9, 28), *rig.p(48, 52), "main")
    s.ellipse(*rig.p(14, 42), *rig.p(44, 53), "main2")
    # Borsten
    for index, x0 in enumerate(range(14, 46, 3)):
        h = 4 + (index % 2) * 2
        s.poly([rig.p(x0 - 1, 31), rig.p(x0 + 1, 31 - h), rig.p(x0 + 3, 31)], "accent")
    for x0 in (20, 40 + stride):
        s.rect(*rig.p(x0, 46, upper=False), *rig.p(x0 + 5, 59, upper=False), "main")
        s.rect(*rig.p(x0, 58, upper=False), *rig.p(x0 + 5, 59, upper=False), "dark")
    # Kopf
    s.poly([rig.p(43, 31), rig.p(53, 33), rig.p(60, 42), rig.p(61, 47), rig.p(52, 50), rig.p(44, 46)], "main")
    s.ellipse(*rig.p(57, 42), *rig.p(63, 48), "main2")
    s.pixels([rig.p(60, 44), rig.p(62, 44)], "void", shade=0)
    s.poly([rig.p(54, 46), rig.p(58, 39 - (2 if frame == "attack" else 0)), rig.p(59, 41), rig.p(56, 47)], "bone")
    s.poly([rig.p(46, 31), rig.p(47, 25), rig.p(51, 32)], "main2")
    s.pixel(*rig.p(52, 38), "eye", shade=4)
    if "crown" in extras:
        s.rect(*rig.p(44, 27), *rig.p(53, 29), "metal")
        for x0 in (44, 48, 52):
            s.poly([rig.p(x0, 27), rig.p(x0 + 1, 22), rig.p(x0 + 2, 27)], "metal")
        s.pixel(*rig.p(48, 28), "eye", shade=4)


def draw_crow(s, spec, frame):
    float_y = -2 if frame == "idle1" else 0
    rig = Rig(spec.get("scale", 1.0), dx=3 if frame == "attack" else 0, dy=float_y)
    # Beine
    s.line(*rig.p(28, 50), *rig.p(27, 58), "metal")
    s.line(*rig.p(33, 50), *rig.p(34, 58), "metal")
    s.pixels([rig.p(26, 58), rig.p(28, 58), rig.p(33, 58), rig.p(35, 58)], "metal", shade=1)
    # Schwanz
    s.poly([rig.p(16, 42), rig.p(4, 46), rig.p(6, 49), rig.p(17, 47)], "main2")
    # Körper
    s.ellipse(*rig.p(14, 32), *rig.p(44, 52), "main")
    s.ellipse(*rig.p(22, 42), *rig.p(42, 52), "accent")
    s.ellipse(*rig.p(14, 32), *rig.p(42, 48), "main")
    # Flügel (schlägt zwischen den Frames)
    if frame == "idle1":
        wing = [rig.p(20, 36), rig.p(8, 20), rig.p(14, 18), rig.p(34, 34)]
    elif frame == "attack":
        wing = [rig.p(20, 36), rig.p(4, 30), rig.p(8, 26), rig.p(34, 36)]
    else:
        wing = [rig.p(20, 36), rig.p(10, 44), rig.p(18, 48), rig.p(36, 40)]
    s.poly(wing, "main2")
    # Kopf und Schnabel
    s.ellipse(*rig.p(38, 24), *rig.p(52, 37), "main")
    open_beak = 2 if frame == "attack" else 0
    s.poly([rig.p(50, 28), rig.p(61, 31), rig.p(50, 32)], "metal")
    if open_beak:
        s.poly([rig.p(50, 33), rig.p(58, 35), rig.p(50, 34)], "metal")
    s.pixel(*rig.p(47, 28), "eye", shade=4)
    s.pixel(*rig.p(46, 28), "eye", shade=3)


def draw_wraith(s, spec, frame):
    float_y = -2 if frame == "idle1" else 0
    rig = Rig(spec.get("scale", 1.0), dx=3 if frame == "attack" else 0, dy=float_y)
    extras = set(spec.get("extras", []))
    wave = 2 if frame == "idle1" else 0
    # Umhang mit ausgefranstem Saum
    points = [rig.p(20, 24), rig.p(30, 16), rig.p(40, 22), rig.p(46, 40), rig.p(48, 56)]
    hem_x = [48, 44, 40, 36, 32, 28, 24, 20, 16]
    for index, x0 in enumerate(hem_x):
        points.append(rig.p(x0, 56 + ((index + wave // 2) % 2) * 4))
    points += [rig.p(14, 52), rig.p(16, 36)]
    s.poly(points, "main")
    s.poly([rig.p(26, 30), rig.p(40, 30), rig.p(42, 54), rig.p(24, 54)], "main2")
    # Kapuze mit dunkler Öffnung
    s.ellipse(*rig.p(23, 15), *rig.p(42, 34), "main")
    s.ellipse(*rig.p(29, 20), *rig.p(41, 31), "void", shade=1)
    s.pixels([rig.p(33, 25), rig.p(38, 25)], "eye", shade=4)
    s.pixels([rig.p(34, 25), rig.p(37, 25)], "eye", shade=3)
    # Arm nach vorn
    reach = 6 if frame == "attack" else 0
    s.line(*rig.p(38, 34), *rig.p(48 + reach, 40), "main", width=4)
    if "claws" in extras:
        for dy in (-1, 1, 3):
            s.line(*rig.p(49 + reach, 40 + dy), *rig.p(53 + reach, 40 + dy + 1), "accent", shade=3)
    else:
        s.ellipse(*rig.p(47 + reach, 38), *rig.p(51 + reach, 42), "accent")
    s.line(*rig.p(26, 44), *rig.p(40, 44), "accent", shade=1)
    for x0 in (22, 28, 34, 40):
        s.line(*rig.p(x0, 46), *rig.p(x0 + 1, 55), "main2", shade=1)
    for x0, y0 in ((31, 36), (35, 40), (29, 48), (37, 50)):
        s.pixel(*rig.p(x0, y0), "eye", shade=1)


FORMS = {"humanoid": draw_humanoid, "rat": draw_rat, "wolf": draw_wolf, "boar": draw_boar, "crow": draw_crow, "wraith": draw_wraith}


def draw_character(spec, frame):
    s = Sprite(SIZE, SIZE)
    setup_materials(s, spec.get("colors", {}))
    FORMS[spec.get("form", "humanoid")](s, spec, frame)
    return s.render()
