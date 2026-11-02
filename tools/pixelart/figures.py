"""Held und Gegner aus Volumen-Körpern (render3d). 64x64 pro Frame, 8 Frames:
0-3 Ruhe (Atmen), 4 Ausholen, 5 Schlag, 6 Nachschwung, 7 getroffen.

Gezeichnet wird nach rechts schauend; Gegner werden beim Speichern gespiegelt.
Tiefe z: positiv = näher zur Kamera. Vorderer Arm/Bein z > 0, hinterer z < 0.
"""

import math

from specs import ENEMIES, HERO_LOOKS, enemy_spec, hero_spec  # noqa: F401
from render3d import Scene

SIZE = 64
FRAMES = ("idle0", "idle1", "idle2", "idle3", "windup", "strike", "follow", "hit")
BREATH = {"idle0": 0.0, "idle1": 0.5, "idle2": 1.0, "idle3": 0.5}

DEFAULTS = {"main": "#6a7380", "main2": "#555d68", "dark": "#2e333c", "accent": "#4a6a8a", "metal": "#aab3bf",
            "skin": "#d9a982", "glow": "#f1c96b", "wood": "#7a5432", "leather": "#6b4a2e", "bone": "#e6dcc2"}


def _darken(value, factor):
    import colorsys
    from render3d import hex_rgb
    r, g, b = [v / 255 for v in hex_rgb(value)]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    r, g, b = colorsys.hls_to_rgb(h, l * factor, s)
    return "#%02x%02x%02x" % (round(r * 255), round(g * 255), round(b * 255))


def _soften(value):
    import colorsys
    from render3d import hex_rgb
    r, g, b = [v / 255 for v in hex_rgb(value)]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    r, g, b = colorsys.hls_to_rgb(h, min(0.82, l * 1.06), s * 0.72)
    return "#%02x%02x%02x" % (round(r * 255), round(g * 255), round(b * 255))


def materials(scene, colors):
    c = dict(DEFAULTS)
    c.update(colors or {})
    c["metal"] = _darken(c["metal"], 0.8)
    c["skin"] = _soften(c["skin"])
    scene.material("main", c["main"], noise=0.04)
    scene.material("main2", c["main2"], noise=0.04)
    scene.material("fur", c["main"], noise=0.16, spread=0.1)
    scene.material("fur2", c["main2"], noise=0.16, spread=0.1)
    scene.material("dark", c["dark"], noise=0.03)
    scene.material("accent", c["accent"], noise=0.03)
    scene.material("metal", c["metal"], spec=0.35, shine=16, spread=0.12)
    scene.material("gold", c.get("gold", "#d6a843"), spec=0.5, shine=12, spread=0.12)
    scene.material("skin", c["skin"], spread=0.075)
    scene.material("glow", c["glow"], emissive=True, spread=0.08)
    scene.material("wood", c["wood"], noise=0.1)
    scene.material("leather", c["leather"], noise=0.06)
    scene.material("bone", c["bone"], spread=0.09)
    scene.material("void", "#1a1424", spread=0.03)
    scene.material("white", "#f4efe2", spread=0.05)
    return c


class Pose:
    """Rechnet Gelenkpunkte mit Skalierung (um den Fusspunkt), Breite und Verschiebung um."""

    def __init__(self, k=1.0, girth=1.0, dx=0.0, dy=0.0, lean=0.0):
        self.k, self.g, self.dx, self.dy, self.lean = k, girth, dx, dy, lean

    def p(self, x, y, z=0.0, upper=True):
        bx = 30 + (x - 30) * self.k * (self.g if upper else 1 + (self.g - 1) * 0.6)
        by = 62 + (y - 62) * self.k
        if upper:
            bx += self.dx + self.lean * (62 - y) / 40
            by += self.dy
        return (bx, by, z * self.k)

    def r(self, value, wide=False):
        return value * self.k * (self.g if wide else 1 + (self.g - 1) * 0.5)


def ang(deg):
    a = math.radians(deg)
    return math.sin(a), -math.cos(a)


# Waffen ----------------------------------------------------------------------------------
def weapon(sc, pose, kind, hand, angle, frame):
    hx, hy, hz = hand
    ux, uy = ang(angle)
    nx, ny = -uy, ux
    k = pose.k
    z = hz + 1.5

    def at(d, s=0.0):
        return (hx + (ux * d + nx * s) * k, hy + (uy * d + ny * s) * k)

    def cap(d0, d1, r0, r1, mat, s=0.0, dz=0.0):
        a, b = at(d0, s), at(d1, s)
        sc.capsule((a[0], a[1], z + dz), (b[0], b[1], z + dz), r0 * k, r1 * k, mat)

    if kind in ("sword", "greatsword"):
        long = kind == "greatsword"
        length, width = (24, 2.6) if long else (17, 1.9)
        cap(-4.5 if long else -3, 0, 1.3, 1.3, "leather")
        sc.sphere(*at(-5 if long else -3.6), z, 1.5 * k, "gold")
        cap(1, 1, 1, 1, "gold", s=-4 if long else -3)
        sc.capsule((*at(1, -4.5 if long else -3.2), z), (*at(1, 4.5 if long else 3.2), z), 1.1 * k, 1.1 * k, "gold")
        sc.slab([at(2, -width), at(length, -width * 0.8), at(length + 3, 0), at(length, width * 0.8), at(2, width)], z + 0.5, "metal", tilt=(-0.35, -0.5))
        sc.slab([at(3, -0.4), at(length, -0.3), at(length, 0.3), at(3, 0.4)], z + 0.6, "metal", tilt=(-0.9, -1.2), bevel=False)
    elif kind == "knife":
        cap(-2.5, 0, 1.1, 1.1, "leather")
        sc.capsule((*at(0.8, -2), z), (*at(0.8, 2), z), 0.8 * k, 0.8 * k, "gold")
        sc.slab([at(1.5, -1.3), at(8, -1), at(10.5, 0), at(8, 1), at(1.5, 1.2)], z + 0.5, "metal", tilt=(-0.4, -0.5))
    elif kind == "axe":
        cap(-4, 15, 1.2, 1.1, "wood")
        sc.slab([at(10, 0.5), at(9, 6), at(12, 9), at(16, 7), at(16, 0.5)], z + 0.5, "metal", tilt=(-0.3, -0.5))
    elif kind == "spear":
        cap(-12, 22, 1.1, 1.0, "wood")
        sc.slab([at(21, -2.2), at(29, 0), at(21, 2.2)], z + 0.5, "metal", tilt=(-0.3, -0.5))
        cap(20.5, 21.5, 1.6, 1.6, "accent")
    elif kind == "hammer":
        cap(-4, 15, 1.3, 1.2, "wood")
        sc.slab([at(13, -5), at(19, -5), at(19, 5), at(13, 5)], z + 1, "metal", tilt=(-0.3, -0.45))
        sc.slab([at(13.5, -5), at(18.5, -5), at(18.5, -3.2), at(13.5, -3.2)], z + 1.3, "accent", tilt=(-0.3, -0.45))
        sc.slab([at(13.5, 3.2), at(18.5, 3.2), at(18.5, 5), at(13.5, 5)], z + 1.3, "accent", tilt=(-0.3, -0.45))
    elif kind == "flail":
        cap(-3, 7, 1.2, 1.2, "wood")
        swing = -4 if frame in ("strike", "follow") else 3
        bx, by = at(14, swing)
        for t in (0.3, 0.55, 0.8):
            px, py = at(7)
            sc.sphere(px + (bx - px) * t, py + (by - py) * t, z, 0.8 * k, "metal")
        sc.sphere(bx, by, z + 1, 3.3 * k, "metal")
        for ox, oy in ((0, -4), (4, 0), (0, 4), (-4, 0)):
            sc.capsule((bx, by, z + 1), (bx + ox * k, by + oy * k, z + 1), 1.2 * k, 0.2, "metal")
    elif kind == "staff":
        cap(-16, 16, 1.2, 1.1, "wood")
        top = at(19)
        sc.capsule((*at(15, -2.2), z), (*at(17.5, -3), z), 0.9 * k, 0.6 * k, "gold")
        sc.capsule((*at(15, 2.2), z), (*at(17.5, 3), z), 0.9 * k, 0.6 * k, "gold")
        sc.sphere(top[0], top[1], z + 1, 2.8 * k, "glow")
        if frame in ("strike", "follow"):
            for d, s in ((24, 0), (22.5, -4), (22.5, 4), (27, -2.5), (27, 2.5)):
                sc.pixel(*at(d, s), z + 3, "glow", 5)
    elif kind == "crossbow":
        cap(-5, 10, 1.4, 1.2, "wood")
        sc.capsule((*at(9, -7), z + 1), (*at(10, 0), z + 1), 0.9 * k, 1.1 * k, "leather")
        sc.capsule((*at(10, 0), z + 1), (*at(9, 7), z + 1), 1.1 * k, 0.9 * k, "leather")
        sc.capsule((*at(9, -7), z + 0.5), (*at(2, 0), z + 0.5), 0.35, 0.35, "bone")
        sc.capsule((*at(2, 0), z + 0.5), (*at(9, 7), z + 0.5), 0.35, 0.35, "bone")
        if frame not in ("strike", "follow"):
            cap(2, 13, 0.6, 0.6, "metal", dz=1.5)
    elif kind == "bow":
        drawn = frame in ("windup",)
        top = (hx + 1 * k, hy - 15 * k)
        bottom = (hx + 1 * k, hy + 15 * k)
        mid = (hx + 5.5 * k, hy)
        sc.capsule((top[0], top[1], z), (mid[0], mid[1] - 7 * k, z), 1.0 * k, 1.3 * k, "wood")
        sc.capsule((mid[0], mid[1] - 7 * k, z), (mid[0], mid[1] + 7 * k, z), 1.3 * k, 1.3 * k, "wood")
        sc.capsule((mid[0], mid[1] + 7 * k, z), (bottom[0], bottom[1], z), 1.3 * k, 1.0 * k, "wood")
        string_x = hx - (5 if drawn else 1.5) * k
        sc.capsule((top[0], top[1], z - 0.5), (string_x, hy, z - 0.5), 0.3, 0.3, "bone")
        sc.capsule((string_x, hy, z - 0.5), (bottom[0], bottom[1], z - 0.5), 0.3, 0.3, "bone")
        if frame in ("strike", "follow"):
            sc.capsule((hx + 16 * k, hy, z + 2), (hx + 28 * k, hy, z + 2), 0.75, 0.75, "wood")
            sc.pixel(hx + 28 * k, hy, z + 3, "metal", 5)
        else:
            sc.capsule((string_x, hy, z + 2), (hx + 12 * k, hy, z + 2), 0.75, 0.75, "wood")
            sc.slab([(hx + 12 * k, hy - 1.5), (hx + 15 * k, hy), (hx + 12 * k, hy + 1.5)], z + 2.5, "metal")


def offhand(sc, pose, kind, hand):
    hx, hy, hz = hand
    k = pose.k
    z = hz + 3
    if kind == "shield":
        sc.ellipsoid(hx, hy, z, 7 * k, 7 * k, 2.4 * k, "metal")
        sc.ellipsoid(hx, hy, z + 0.6, 5.6 * k, 5.6 * k, 2.2 * k, "accent")
        sc.sphere(hx - 0.5, hy - 0.5, z + 2.2, 1.6 * k, "metal")
    elif kind == "buckler":
        sc.ellipsoid(hx, hy, z, 4.8 * k, 4.8 * k, 2 * k, "metal")
        sc.ellipsoid(hx, hy, z + 0.4, 3.4 * k, 3.4 * k, 1.8 * k, "main2")
        sc.sphere(hx, hy, z + 1.8, 1.2 * k, "metal")
    elif kind == "tower":
        pts = [(hx - 6 * k, hy - 11 * k), (hx + 6 * k, hy - 11 * k), (hx + 6 * k, hy + 6 * k), (hx, hy + 11 * k), (hx - 6 * k, hy + 6 * k)]
        sc.slab(pts, z, "metal", tilt=(-0.15, -0.2))
        inner = [(hx - 4.3 * k, hy - 9 * k), (hx + 4.3 * k, hy - 9 * k), (hx + 4.3 * k, hy + 5 * k), (hx, hy + 8.6 * k), (hx - 4.3 * k, hy + 5 * k)]
        sc.slab(inner, z + 0.4, "accent", tilt=(-0.15, -0.2))
        sc.capsule((hx, hy - 7 * k, z + 1), (hx, hy + 6 * k, z + 1), 0.9 * k, 0.9 * k, "gold")
        sc.capsule((hx - 3 * k, hy - 2.5 * k, z + 1), (hx + 3 * k, hy - 2.5 * k, z + 1), 0.9 * k, 0.9 * k, "gold")
    elif kind == "orb":
        sc.sphere(hx, hy - 3 * k, z, 2.6 * k, "glow")
    elif kind == "potion":
        sc.capsule((hx, hy - 7 * k, z), (hx, hy - 5 * k, z), 0.9 * k, 0.9 * k, "bone")
        sc.sphere(hx, hy - 3 * k, z, 2.7 * k, "glow")
    elif kind == "knife":
        sc.slab([(hx - 1, hy), (hx - 2.5, hy + 8 * k), (hx - 1, hy + 9 * k), (hx + 1, hy)], z, "metal", tilt=(-0.4, -0.3))


# Köpfe -----------------------------------------------------------------------------------
def head(sc, pose, kind, c, spec):
    cx, cy, cz = c
    k = pose.k
    r = 6.2 * k

    def face(eye_glow=False):
        sc.ellipsoid(cx, cy, cz, r * 0.95, r, r * 0.9, "skin")
        sc.ellipsoid(cx + r * 0.8, cy + 1 * k, cz + 1, 1.3 * k, 1.5 * k, 1.2 * k, "skin")  # Nase
        if eye_glow:
            sc.pixel(cx + 3 * k, cy - 0.5 * k, cz + r, "glow", 5)
        else:
            sc.pixel(cx + 3 * k, cy - 0.5 * k, cz + r, "void", 0)
            sc.pixel(cx + 3 * k, cy - 2 * k, cz + r, "dark", 1)

    if kind in ("helm", "horns", "crownHelm"):
        sc.ellipsoid(cx - 0.5 * k, cy - 1 * k, cz, r * 1.02, r * 1.02, r, "metal")
        sc.ellipsoid(cx + 2.2 * k, cy + 1.2 * k, cz + 1.5, r * 0.78, r * 0.85, r * 0.75, "metal")
        sc.slab([(cx + 1.5 * k, cy - 1.4 * k), (cx + r * 1.05, cy - 1.0 * k), (cx + r * 1.05, cy + 0.2 * k), (cx + 1.5 * k, cy - 0.2 * k)], cz + r * 0.95, "void", bevel=False, flat=0)
        sc.pixel(cx + 4 * k, cy - 0.6 * k, cz + r + 1, "glow", 5)
        for i in range(3):
            sc.pixel(cx + (3 + i * 1.5) * k, cy + 2.6 * k, cz + r + 1, "void", 1)
        sc.capsule((cx - 3 * k, cy - r * 0.95, cz + 1), (cx + 3 * k, cy - r * 0.9, cz + 2), 1.1 * k, 1.1 * k, "metal")
        if kind == "horns":
            sc.capsule((cx - r * 0.7, cy - 3 * k, cz + 1), (cx - r - 4 * k, cy - 8 * k, cz + 1), 2 * k, 1.4 * k, "bone")
            sc.capsule((cx - r - 4 * k, cy - 8 * k, cz + 1), (cx - r - 3 * k, cy - 13 * k, cz + 1), 1.4 * k, 0.3, "bone")
            sc.capsule((cx + r * 0.6, cy - 4 * k, cz - 2), (cx + r + 2 * k, cy - 9 * k, cz - 2), 1.8 * k, 1.2 * k, "bone")
            sc.capsule((cx + r + 2 * k, cy - 9 * k, cz - 2), (cx + r + 1 * k, cy - 13 * k, cz - 2), 1.2 * k, 0.3, "bone")
        if kind == "crownHelm":
            base = cy - r * 1.05
            sc.ellipsoid(cx, base + 1 * k, cz + 1, r * 0.95, 1.6 * k, r * 0.8, "gold")
            for off in (-4, 0, 4):
                sc.capsule((cx + off * k, base, cz + 2), (cx + off * k, base - 4.5 * k, cz + 2), 1.4 * k, 0.3, "gold")
            sc.pixel(cx, base + 1 * k, cz + r, "glow", 5)
    elif kind in ("hood", "mask"):
        sc.ellipsoid(cx - 1 * k, cy - 0.5 * k, cz - 1, r * 1.2, r * 1.25, r * 1.05, "accent")
        sc.capsule((cx - 2 * k, cy + 3 * k, cz - 2), (cx - 5 * k, cy + 9 * k, cz - 3), 4 * k, 5 * k, "accent")
        show_face = spec.get("show_face", True)
        if show_face:
            sc.ellipsoid(cx + 1.5 * k, cy + 0.6 * k, cz + 2.5, r * 0.75, r * 0.8, r * 0.75, "skin")
            sc.capsule((cx - 1.5 * k, cy - 4.2 * k, cz + r * 0.6 + 2.5), (cx + r * 0.95, cy - 3.6 * k, cz + r * 0.6 + 3), 2 * k, 1.6 * k, "accent")
            sc.pixel(cx + 3.5 * k, cy - 0.5 * k, cz + r + 3, "void", 0)
        else:
            sc.ellipsoid(cx + 1.5 * k, cy + 0.6 * k, cz + 2.5, r * 0.7, r * 0.8, r * 0.7, "void")
            sc.pixel(cx + 3.5 * k, cy, cz + r + 3, "glow", 5)
        if kind == "mask":
            sc.slab([(cx - 0.5 * k, cy + 1.6 * k), (cx + r + 0.5, cy + 1.6 * k), (cx + r, cy + 5 * k), (cx, cy + 5 * k)], cz + r + 3, "dark", tilt=(0, 0.3))
    elif kind == "cap":
        face()
        sc.ellipsoid(cx - 0.5 * k, cy - 3 * k, cz, r * 1.02, r * 0.7, r * 0.95, "accent")
        sc.ellipsoid(cx + r * 0.7, cy - 2.4 * k, cz + 2, r * 0.75, 1.1 * k, r * 0.7, "accent")
        sc.capsule((cx - r * 0.8, cy - 3 * k, cz + 1), (cx - r - 4 * k, cy - 8 * k, cz + 1), 0.9 * k, 0.4, "glow") if spec.get("feather") else None
    elif kind == "hat":
        face(spec.get("glow_eyes", False))
        sc.ellipsoid(cx, cy - 3.5 * k, cz, r * 1.75, 1.6 * k, r * 1.5, "main2")
        sc.capsule((cx - 0.5 * k, cy - 5 * k, cz), (cx - 4 * k, cy - 19 * k, cz - 1), r * 0.95, 0.6, "main")
        sc.ellipsoid(cx, cy - 4.8 * k, cz + 0.5, r * 1.0, 1.2 * k, r * 0.95, "accent")
    elif kind == "skull":
        sc.ellipsoid(cx - 1 * k, cy - 0.5 * k, cz - 1, r * 1.2, r * 1.25, r * 1.05, "main")
        sc.ellipsoid(cx + 1 * k, cy, cz + 2, r * 0.82, r * 0.85, r * 0.8, "bone")
        sc.ellipsoid(cx + 2 * k, cy + 4 * k, cz + 2.5, r * 0.5, r * 0.35, r * 0.5, "bone")
        sc.ellipsoid(cx + 3.2 * k, cy - 0.5 * k, cz + r * 0.8 + 2, 1.5 * k, 1.6 * k, 1, "void")
        sc.pixel(cx + 3.2 * k, cy - 0.5 * k, cz + r + 4, "glow", 5)
        sc.pixel(cx + 3 * k, cy + 4 * k, cz + r + 4, "void", 0)
    elif kind == "bald":
        face(True)
        sc.capsule((cx + 1 * k, cy - 2.6 * k, cz + r * 0.8), (cx + r * 0.9, cy - 2.2 * k, cz + r * 0.8), 0.9 * k, 0.9 * k, "dark")
        sc.pixel(cx + 2 * k, cy + 3.5 * k, cz + r + 1, "void", 0)
        sc.pixel(cx + 3 * k, cy + 3.5 * k, cz + r + 1, "void", 0)
    elif kind == "rat":
        sc.ellipsoid(cx - 0.5 * k, cy, cz, r * 0.95, r * 0.9, r * 0.85, "skin")
        sc.capsule((cx + 2 * k, cy + 1 * k, cz + 1), (cx + r + 6 * k, cy + 2.5 * k, cz + 1), 3.8 * k, 1.2 * k, "skin")
        sc.sphere(cx + r + 6.2 * k, cy + 2.3 * k, cz + 2.2, 1.1 * k, "dark")
        sc.ellipsoid(cx - 3 * k, cy - r + 0.5, cz - 1, 2.6 * k, 3 * k, 1.2 * k, "skin")
        sc.ellipsoid(cx - 3 * k, cy - r + 0.5, cz - 0.3, 1.5 * k, 2 * k, 1, "accent")
        sc.pixel(cx + 3 * k, cy - 1.2 * k, cz + r, "glow", 5)
        sc.ellipsoid(cx - 1 * k, cy - 3 * k, cz + 0.5, r * 0.9, r * 0.6, r * 0.85, "metal")
    else:
        face()


# Menschen-Form ---------------------------------------------------------------------------
def humanoid(sc, spec, frame, rat=False):
    build = spec.get("build", "normal")
    girth = {"brute": 1.3, "champion": 1.05}.get(build, 1.0)
    tall = {"champion": 1.0}.get(build, 1.0)
    k = min(1.06, spec.get("scale", 1.0)) * tall
    breath = BREATH.get(frame, 0.0)
    lean = {"windup": -1.5, "strike": 3.0, "follow": 2.0, "hit": -2.5}.get(frame, 0.0)
    pose = Pose(k, girth, dx=0, dy=breath * 0.6, lean=lean)
    extras = set(spec.get("extras", []))
    armored = spec.get("armored", False)
    robe = spec.get("robe", False)
    weapon_kind = spec.get("weapon", "sword")
    two_handed = weapon_kind in ("greatsword", "bow", "crossbow")
    limb = "metal" if armored else "main2"

    # Gelenke
    sh_b, sh_f = pose.p(24.5, 25, -5), pose.p(35.5, 25, 5)
    hip_b, hip_f = pose.p(27.5, 42, -2.5, upper=False), pose.p(32.5, 42, 2.5, upper=False)
    hip_b = (hip_b[0] + lean * 0.4, hip_b[1] + breath * 0.3, hip_b[2])
    hip_f = (hip_f[0] + lean * 0.4, hip_f[1] + breath * 0.3, hip_f[2])
    stride = 2.5 if frame == "strike" else 0
    knee_b, knee_f = pose.p(26 - stride * 0.4, 52, -3, upper=False), pose.p(35 + stride, 51.5, 3, upper=False)
    foot_b, foot_f = pose.p(25 - stride * 0.6, 60.5, -3, upper=False), pose.p(37 + stride, 60.5, 3, upper=False)

    hand_b = pose.p(22, 40, -1)
    elbow_b = pose.p(21.5, 33, -5)
    arm_poses = {
        "windup": ((31, 19, 7), (27, 13, 7), -40),
        "strike": ((42, 27, 7), (49, 31, 8), 98),
        "follow": ((40, 33, 7), (45, 41, 8), 150),
        "hit": ((37, 33, 6), (38, 40, 7), 10),
    }
    idle_angles = {"sword": 30, "greatsword": 25, "knife": 70, "axe": 25, "spear": 12, "hammer": 20, "flail": 38, "staff": 6, "crossbow": 90, "bow": 0}
    if frame in arm_poses:
        elbow_f, hand_f, angle = arm_poses[frame]
        elbow_f, hand_f = pose.p(*elbow_f), pose.p(*hand_f)
    else:
        elbow_f, hand_f = pose.p(38.5, 33, 6), pose.p(40, 40 - breath * 0.4, 7)
        angle = idle_angles.get(weapon_kind, 30) + breath * 2
    if weapon_kind in ("bow", "crossbow"):
        angle = 90 if weapon_kind == "crossbow" else 0
        hand_f = pose.p(42, 32 - breath * 0.3, 7) if frame != "hit" else pose.p(40, 34, 7)
        elbow_f = pose.p(38, 31, 6)
        hand_b = pose.p(31, 32, 4) if weapon_kind == "bow" else pose.p(35, 34, 5)
        elbow_b = pose.p(27, 32, -1)
    if two_handed and weapon_kind == "greatsword":
        hand_b = (hand_f[0] - 2.5 * k, hand_f[1] + 1.5 * k, hand_f[2] - 1)
        elbow_b = pose.p(28, 34, 0) if frame not in arm_poses else (elbow_f[0] - 3, elbow_f[1] + 2, 1)

    # Umhang, Köcher (hinter allem)
    if "cape" in extras:
        sway = {"idle1": 1, "idle2": 2, "idle3": 1, "windup": -1, "strike": 4, "follow": 3, "hit": -2}.get(frame, 0)
        top_l, top_r = pose.p(24, 23, -7), pose.p(33, 23, -7)
        sc.slab([(top_l[0], top_l[1]), (top_r[0], top_r[1]), (top_r[0] - 2, 60), (top_l[0] - 7 - sway, 61), (top_l[0] - 9 - sway, 50), (top_l[0] - 4, 36)], -9, "accent", tilt=(0.25, 0.1))
    if "quiver" in extras:
        a, b = pose.p(26, 26, -7), pose.p(21, 40, -7)
        sc.capsule(a, b, 2.6 * k, 2.3 * k, "leather")
        for off in (-1.5, 0, 1.5):
            sc.capsule((a[0] + off + 1, a[1] - 1, -6), (a[0] + off + 2, a[1] - 5 * k, -6), 0.6, 0.6, "white")

    # Hinterer Arm und hinteres Bein
    sc.capsule(sh_b, elbow_b, pose.r(2.9, True), pose.r(2.5, True), limb)
    sc.capsule(elbow_b, hand_b, pose.r(2.5, True), pose.r(2.2, True), limb)
    if not robe:
        sc.capsule(hip_b, knee_b, pose.r(3.4), pose.r(2.8), "metal" if armored else "dark")
        sc.capsule(knee_b, foot_b, pose.r(2.8), pose.r(2.3), "metal" if armored else "dark")
        sc.ellipsoid(foot_b[0] + 1.5, foot_b[1], foot_b[2], 3.6 * k, 2.2 * k, 2.5 * k, "leather")

    # Körper
    chest = pose.p(30, 30, 0)
    if robe:
        sc.capsule(pose.p(30, 26, 0), (30 + lean * 0.3, 57, 0), pose.r(7, True), pose.r(11.5, True), "main")
        sc.ellipsoid(30 + lean * 0.3, 58.5, 0, pose.r(11.5, True), 3 * k, pose.r(9, True), "main2")
        sc.capsule(pose.p(31, 30, 7.5), (31.5 + lean * 0.3, 58, 9.5), 1.3 * k, 1.6 * k, "accent")
        sc.ellipsoid(*pose.p(30, 37, 1), pose.r(7.8, True), 1.4 * k, pose.r(7, True), "accent")
    else:
        sc.capsule(hip_f, knee_f, pose.r(3.4), pose.r(2.8), "metal" if armored else "dark")
        sc.capsule(knee_f, foot_f, pose.r(2.8), pose.r(2.3), "metal" if armored else "dark")
        if armored:
            sc.sphere(*knee_f, 2.6 * k, "metal")
        sc.ellipsoid(foot_f[0] + 1.5, foot_f[1], foot_f[2] + 0.5, 3.8 * k, 2.3 * k, 2.6 * k, "leather")
        sc.ellipsoid(*pose.p(30, 41.5, 0), pose.r(6.8, True), 4.6 * k, pose.r(5, True), "main2")
        sc.ellipsoid(chest[0], chest[1], chest[2], pose.r(8, True), 8.5 * k, pose.r(5.8, True), "metal" if armored else "main")
        sc.ellipsoid(*pose.p(30, 36.5, 0.5), pose.r(6.5, True), 5 * k, pose.r(5.2, True), "metal" if armored else "main")
        if armored:
            # Wappenrock vorne
            tc = pose.p(30.8, 37, 4.2)
            sc.ellipsoid(tc[0], tc[1], tc[2], pose.r(3.8, True), 10.5 * k, 2.4 * k, "accent")
            sc.capsule(pose.p(30.8, 41, 6.5), (tc[0] - lean * 0.2, 48, 5.5), pose.r(3.4, True), pose.r(3.8, True), "accent")
            sc.ellipsoid(*pose.p(24.5, 24.5, -2), pose.r(4.6, True), 3.8 * k, 4 * k, "metal")
            sc.ellipsoid(*pose.p(35.5, 24.5, 4), pose.r(4.6, True), 3.8 * k, 4 * k, "metal")
        else:
            a, b = pose.p(25, 25, 5), pose.p(35, 39, 5.5)
            sc.capsule(a, b, 1.2 * k, 1.2 * k, "accent")
            sc.ellipsoid(*pose.p(30, 45.5, 0.5, upper=False), pose.r(6.4, True), 3.6 * k, pose.r(5.2, True), "main2")
        sc.ellipsoid(*pose.p(30, 39.5, 1), pose.r(6.9, True), 1.5 * k, pose.r(5.6, True), "leather")
        sc.pixel(*pose.p(33, 39.5)[:2], 8 * k, "gold", 4)
    if "apron" in extras:
        ac = pose.p(31, 40, 6)
        sc.ellipsoid(ac[0], ac[1], ac[2] * girth, pose.r(3.6, True), 8.5 * k, 1.8 * k, "leather")
    if "chains" in extras:
        a, b = pose.p(25, 26, 7), pose.p(35, 38, 7)
        for i in range(7):
            t = i / 6
            sc.sphere(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 8 * k, 0.9 * k, "metal")
    if "runes" in extras:
        rx, ry, _ = pose.p(30.5, 32)
        for ox, oy in ((0, -2), (-2, 0), (2, 0), (0, 2), (0, 0)):
            sc.pixel(rx + ox, ry + oy, 12, "glow", 5)

    # Nebenhand (Schild vor dem Körper)
    off = spec.get("off", "none")
    if not two_handed and off != "none":
        offhand(sc, pose, off, hand_b)
    sc.sphere(*hand_b, 2.1 * k, "metal" if armored else "skin")

    # Kopf
    hc = pose.p(31, 14.5 - (1 if build == "brute" else 0), 1)
    if frame == "hit":
        hc = (hc[0] - 1, hc[1], hc[2])
    sc.capsule(pose.p(30, 21, 0), pose.p(30.5, 18, 0.5), 2.4 * k, 2.4 * k, "skin")
    head(sc, pose, "rat" if rat else spec.get("head", "helm"), hc, spec)
    if "plume" in extras:
        top = (hc[0] - 1, hc[1] - 6 * k, hc[2] - 1)
        sway = 1 if frame in ("idle2", "strike") else 0
        sc.capsule(top, (top[0] - 6 * k - sway, top[1] - 3 * k, top[2] - 1), 2.2 * k, 1.4 * k, "accent")
        sc.capsule((top[0] - 6 * k - sway, top[1] - 3 * k, top[2] - 1), (top[0] - 10 * k - sway, top[1] + 2 * k, top[2] - 1), 1.4 * k, 0.4, "accent")

    # Waffe und vorderer Arm
    weapon(sc, pose, weapon_kind, hand_f, angle, frame)
    sc.capsule(sh_f, elbow_f, pose.r(3, True), pose.r(2.6, True), limb)
    sc.capsule(elbow_f, hand_f, pose.r(2.6, True), pose.r(2.3, True), limb)
    if armored:
        sc.sphere(*elbow_f, 2.4 * k, "metal")
    sc.sphere(hand_f[0], hand_f[1], hand_f[2] + 1, 2.2 * k, "metal" if armored else "skin")
    if two_handed and weapon_kind == "greatsword":
        sc.sphere(hand_b[0], hand_b[1], hand_b[2] + 3, 2.1 * k, "metal" if armored else "skin")


def rat(sc, spec, frame):
    k = spec.get("scale", 1.0)
    sway = {"idle1": 1, "idle2": 2, "idle3": 1, "strike": -2}.get(frame, 0)
    pts = [(25, 47, -6), (17, 50 + sway, -6), (10, 46 + sway, -6), (6, 40 + sway, -6)]
    for (a, b) in zip(pts, pts[1:]):
        sc.capsule(a, b, 1.6 * k, 1.1 * k, "skin")
    humanoid(sc, spec, frame, rat=True)


# Tiere -----------------------------------------------------------------------------------
def wolf(sc, spec, frame):
    k = spec.get("scale", 1.0)
    extras = set(spec.get("extras", []))
    breath = BREATH.get(frame, 0.0)
    shift = {"windup": -2.5, "strike": 4.5, "follow": 3, "hit": -2.5}.get(frame, 0.0)
    crouch = {"windup": 1.5, "strike": -1}.get(frame, 0.0)
    head_dip = {"windup": 2, "strike": 2.5, "follow": 1, "hit": -1.5}.get(frame, 0.0)
    jaw = 3 if frame in ("strike", "follow") else 0

    def P(x, y, z=0.0, body=True):
        return (30 + (x - 30) * k + (shift if body else shift * 0.3), 62 + (y - 62) * k + (crouch if body else 0) - (breath * 0.4 if body else 0), z * k)

    # Hinterbeine (hinten liegend, dunkler)
    for base, z in ((19, -4), (40, -4)):
        if base == 19:
            sc.capsule(P(base + 2, 41, z), P(base - 1, 50, z, True), 4.2 * k, 2.6 * k, "fur2")
            sc.capsule(P(base - 1, 50, z), P(base + 2, 60.5, z, False), 2.3 * k, 1.8 * k, "fur2")
            sc.ellipsoid(*P(base + 3.5, 61, z, False), 2.6 * k, 1.5 * k, 2 * k, "fur2")
        else:
            sc.capsule(P(base, 44, z), P(base + 1, 53, z, True), 3 * k, 2.3 * k, "fur2")
            sc.capsule(P(base + 1, 53, z), P(base + 1.5, 60.5, z, False), 2.1 * k, 1.8 * k, "fur2")
            sc.ellipsoid(*P(base + 3, 61, z, False), 2.6 * k, 1.5 * k, 2 * k, "fur2")
    # Schwanz
    sway = {"idle1": 1, "idle2": 2, "idle3": 1, "strike": -2, "hit": 3}.get(frame, 0)
    tail = [P(14, 36, -1), P(9, 41 + sway * 0.3, -2), P(6 - sway * 0.5, 48, -2), P(6 - sway, 53, -2)]
    radii = [(2.6, 3.4), (3.4, 3.3), (3.3, 1.2)]
    for (a, b), (r0, r1) in zip(zip(tail, tail[1:]), radii):
        sc.capsule(a, b, r0 * k, r1 * k, "fur")
    # Rumpf
    sc.ellipsoid(*P(22, 39, 0), 9.5 * k, 7.5 * k, 7 * k, "fur")
    sc.capsule(P(22, 39, 0), P(38, 38, 0), 7.2 * k, 8.6 * k, "fur")
    sc.ellipsoid(*P(39, 38.5, 1), 9.3 * k, 9.5 * k, 8 * k, "fur")
    sc.ellipsoid(*P(41, 44, 4), 5.5 * k, 5 * k, 4.5 * k, "accent")
    if "stripes" in extras:
        for x0 in (19, 24, 29, 34):
            sc.capsule(P(x0, 31.5, 7), P(x0 - 1.5, 37, 7.5), 0.9 * k, 0.6 * k, "glow")
    if "moss" in extras:
        for x0, y0 in ((18, 32), (24, 31), (30, 31), (35, 30), (21, 34)):
            sc.sphere(*P(x0, y0, 6.5), 1.4 * k, "accent")
    # Nackenfell
    for i, (x0, y0) in enumerate(((33, 30), (37, 28.5), (41, 28))):
        sc.capsule(P(x0, y0 + 2, 3), P(x0 - 2.5, y0 - 3, 2), 2.4 * k, 0.4, "fur")
    # Vorderbeine
    for base, z in ((36, 3), (43, 5)):
        sc.capsule(P(base, 45, z), P(base + 0.5, 53, z, True), 3.2 * k, 2.4 * k, "fur")
        sc.capsule(P(base + 0.5, 53, z), P(base + 0.5, 60.5, z, False), 2.2 * k, 1.9 * k, "fur")
        sc.ellipsoid(*P(base + 2, 61, z + 0.5, False), 2.8 * k, 1.6 * k, 2.2 * k, "fur")
    if "collar" in extras:
        for i in range(6):
            a = math.radians(-60 + i * 30)
            sc.sphere(*P(44 + math.cos(a) * 1.5, 34 + math.sin(a) * 5.5, 7), 1.4 * k, "accent" if i % 2 else "metal")
    # Hals und Kopf
    sc.capsule(P(42, 37, 3), P(48, 30 + head_dip, 3), 6.5 * k, 5.2 * k, "fur")
    hx, hy, hz = P(51, 27 + head_dip, 4)
    sc.ellipsoid(hx, hy, hz, 6.2 * k, 5.6 * k, 5.2 * k, "fur")
    sc.capsule((hx + 3 * k, hy + 1.5 * k, hz + 1), (hx + 10 * k, hy + 3.5 * k, hz + 1), 3.4 * k, 2.1 * k, "fur")
    sc.capsule((hx + 3 * k, hy + 4 * k, hz), (hx + 9 * k, hy + 5 * k + jaw, hz), 2.2 * k, 1.4 * k, "fur2")
    if jaw:
        for i in range(3):
            sc.pixel(hx + (5 + i * 1.5) * k, hy + 4.5 * k + jaw * 0.5, hz + 6, "white", 5)
    sc.sphere(hx + 10.3 * k, hy + 3 * k, hz + 2.5, 1.3 * k, "void")
    # Ohren
    sc.capsule((hx - 2 * k, hy - 4 * k, hz - 1), (hx - 3 * k, hy - 10 * k, hz - 1), 2.1 * k, 0.3, "fur2")
    sc.capsule((hx + 0.5 * k, hy - 4 * k, hz + 2), (hx + 0.5 * k, hy - 10.5 * k, hz + 2), 2.2 * k, 0.3, "fur")
    sc.pixel(hx + 3 * k, hy - 0.5 * k, hz + 6, "glow", 5)
    sc.pixel(hx + 2 * k, hy - 0.5 * k, hz + 6, "glow", 3)


def boar(sc, spec, frame):
    k = spec.get("scale", 1.0)
    extras = set(spec.get("extras", []))
    breath = BREATH.get(frame, 0.0)
    shift = {"windup": -2.5, "strike": 5, "follow": 3, "hit": -2.5}.get(frame, 0.0)
    dip = {"windup": 1, "strike": 2.5, "follow": 1}.get(frame, 0.0)

    def P(x, y, z=0.0, body=True):
        return (30 + (x - 30) * k + (shift if body else shift * 0.3), 62 + (y - 62) * k - (breath * 0.4 if body else 0), z * k)

    for x0, z in ((19, -4), (39, -4)):
        sc.capsule(P(x0, 46, z), P(x0, 60, z, False), 3.4 * k, 2.6 * k, "main2")
        sc.ellipsoid(*P(x0 + 1, 60.5, z, False), 3 * k, 1.8 * k, 2 * k, "dark")
    sc.capsule(P(13, 38, -1), P(9, 34, -1), 1.3 * k, 0.8 * k, "main2")
    sc.ellipsoid(*P(28, 41, 0), 16 * k, 11.5 * k, 10 * k, "fur")
    sc.ellipsoid(*P(30, 47, 3), 12 * k, 5.5 * k, 7 * k, "fur2")
    # Borstenkamm
    for i, x0 in enumerate(range(15, 44, 3)):
        h = 4 + (i % 2) * 2.5
        sc.capsule(P(x0, 32 - (2 if 22 < x0 < 38 else 0), 2), P(x0 - 1.5, 27 - h * 0.7 - (2 if 22 < x0 < 38 else 0), 1), 1.8 * k, 0.3, "accent")
    for x0, z in ((22, 5), (40, 5)):
        sc.capsule(P(x0, 47, z), P(x0, 60, z, False), 3.6 * k, 2.8 * k, "fur")
        sc.ellipsoid(*P(x0 + 1, 60.5, z, False), 3.2 * k, 1.8 * k, 2.2 * k, "dark")
    hx, hy, hz = P(47, 43 + dip, 4)
    sc.ellipsoid(hx, hy, hz, 8.5 * k, 7.5 * k, 6.5 * k, "fur")
    sc.capsule((hx + 3 * k, hy + 2 * k, hz + 1), (hx + 11 * k, hy + 4 * k, hz + 1), 4.4 * k, 3.6 * k, "fur")
    sc.ellipsoid(hx + 12 * k, hy + 4 * k, hz + 2, 2 * k, 3.4 * k, 2.4 * k, "main2")
    sc.pixel(hx + 13 * k, hy + 3 * k, hz + 6, "void", 0)
    sc.pixel(hx + 13 * k, hy + 5 * k, hz + 6, "void", 0)
    sc.capsule((hx + 7 * k, hy + 6 * k, hz + 4), (hx + 10 * k, hy - 1 * k, hz + 4), 1.5 * k, 0.4, "bone")
    sc.capsule((hx - 3 * k, hy - 5 * k, hz), (hx - 5 * k, hy - 11 * k, hz), 2.3 * k, 0.4, "fur2")
    sc.pixel(hx + 3 * k, hy - 2 * k, hz + 7, "glow", 5)
    if "crown" in extras:
        sc.ellipsoid(hx - 1 * k, hy - 6.5 * k, hz + 1, 5 * k, 1.6 * k, 4 * k, "gold")
        for off in (-4, -0.5, 3):
            sc.capsule((hx + off * k, hy - 7.5 * k, hz + 2), (hx + off * k, hy - 12.5 * k, hz + 2), 1.4 * k, 0.3, "gold")
        sc.pixel(hx - 0.5 * k, hy - 6.5 * k, hz + 6, "glow", 5)


def crow(sc, spec, frame):
    k = spec.get("scale", 1.0)
    hover = {"idle1": -1, "idle2": -2, "idle3": -1, "strike": -1}.get(frame, 0)
    shift = {"windup": -2, "strike": 5, "follow": 3, "hit": -3}.get(frame, 0.0)

    def P(x, y, z=0.0):
        return (30 + (x - 30) * k + shift, 62 + (y - 62) * k + hover, z * k)

    sc.capsule(P(28, 47, -1), P(27, 59, -1), 0.9 * k, 0.7 * k, "gold")
    sc.capsule(P(33, 47, 1), P(34, 59, 1), 0.9 * k, 0.7 * k, "gold")
    for x0 in (25, 27, 29, 32, 34, 36):
        sc.pixel(*P(x0, 59.5)[:2], 2, "gold", 2)
    sc.slab([P(16, 40)[:2], P(3, 44)[:2], P(4, 47)[:2], P(2, 50)[:2], P(17, 46)[:2]], -3, "main2", tilt=(0.1, -0.3))
    sc.ellipsoid(*P(30, 39, 0), 13 * k, 9 * k, 8 * k, "main")
    sc.ellipsoid(*P(35, 43, 3), 7 * k, 5 * k, 5 * k, "accent")
    wing = {
        "idle0": [(20, 34), (6, 44), (12, 47), (22, 46), (36, 40)],
        "idle1": [(20, 34), (8, 38), (12, 42), (22, 44), (36, 38)],
        "idle2": [(20, 34), (8, 24), (14, 22), (26, 32), (36, 36)],
        "idle3": [(20, 34), (8, 38), (12, 42), (22, 44), (36, 38)],
        "windup": [(20, 34), (6, 18), (14, 16), (28, 30), (36, 36)],
        "strike": [(20, 34), (2, 40), (8, 44), (22, 44), (36, 40)],
        "follow": [(20, 34), (4, 44), (10, 47), (22, 46), (36, 40)],
        "hit": [(20, 34), (10, 22), (16, 20), (28, 32), (36, 36)],
    }[frame]
    sc.slab([P(x, y)[:2] for x, y in wing], 9 * k, "main2", tilt=(-0.2, -0.4))
    for i in range(3):
        a, b = wing[1 + (i % 2)], wing[-1]
        sc.capsule((*P(*a)[:2], 9.5 * k), (*P(*b)[:2], 9.5 * k), 0.4, 0.4, "main")
    sc.sphere(*P(43, 29, 3), 6.5 * k, "main")
    beak_open = 2 if frame in ("strike", "follow") else 0
    sc.capsule(P(47, 29, 5), P(57, 31, 5), 2.4 * k, 0.4, "gold")
    if beak_open:
        sc.capsule(P(47, 32, 4), P(54, 35, 4), 1.5 * k, 0.3, "gold")
    sc.pixel(*P(45, 27)[:2], 12, "glow", 5)


def wraith(sc, spec, frame):
    k = spec.get("scale", 1.0)
    extras = set(spec.get("extras", []))
    hover = {"idle0": 0, "idle1": -1, "idle2": -2, "idle3": -1}.get(frame, -1)
    shift = {"windup": -2, "strike": 4, "follow": 3, "hit": -3}.get(frame, 0.0)

    def P(x, y, z=0.0):
        return (30 + (x - 30) * k + shift, 62 + (y - 62) * k + hover, z * k)

    wave = {"idle1": 1, "idle2": 2, "idle3": 1}.get(frame, 0)
    hem = []
    for i, x0 in enumerate(range(46, 13, -4)):
        hem.append(P(x0, 56 + ((i + wave) % 2) * 5)[:2])
    sc.slab([P(22, 28)[:2], P(40, 28)[:2], P(48, 52)[:2]] + hem + [P(13, 50)[:2]], -1, "main2", tilt=(0.0, -0.2))
    sc.capsule(P(31, 26, 0), P(31, 50, 0), 8.5 * k, 12.5 * k, "main")
    for x0 in (22, 27, 33, 38):
        sc.capsule(P(x0, 42, 9), P(x0 + 1, 54, 9), 0.6, 0.6, "main2")
    reach = {"windup": -3, "strike": 7, "follow": 5}.get(frame, 0)
    sc.capsule(P(36, 30, 6), P(46 + reach, 37, 8), 3.4 * k, 2.4 * k, "main")
    if "claws" in extras:
        for dy in (-1.5, 0.5, 2.5):
            sc.capsule(P(47 + reach, 37 + dy, 9), P(52 + reach, 38.5 + dy, 9), 0.7, 0.3, "accent")
    else:
        sc.sphere(*P(47 + reach, 37, 9), 2.2 * k, "accent")
    sc.ellipsoid(*P(31, 19, 0), 9 * k, 10 * k, 7 * k, "main")
    sc.capsule(P(29, 9, -1), P(24, 4, -2), 3.5 * k, 0.5, "main")
    sc.ellipsoid(*P(34, 21, 5), 5.6 * k, 6.5 * k, 2.5 * k, "void")
    sc.pixel(*P(33, 20)[:2], 20, "glow", 5)
    sc.pixel(*P(36.5, 20)[:2], 20, "glow", 5)
    sc.pixel(*P(33, 21)[:2], 20, "glow", 3)
    sc.pixel(*P(36.5, 21)[:2], 20, "glow", 3)



FORMS = {"humanoid": humanoid, "rat": rat, "wolf": wolf, "boar": boar, "crow": crow, "wraith": wraith}


def draw(spec, frame):
    sc = Scene(SIZE, SIZE)
    materials(sc, spec.get("colors", {}))
    FORMS[spec.get("form", "humanoid")](sc, spec, frame)
    return sc.render()
