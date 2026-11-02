"""Hintergründe der Kampfbühne, ein Bild pro Gebiet (256x96 Pixel, Boden unten bei y>=72)."""

import math
import random

from PIL import Image

from pixel import hex_rgb

W, H = 256, 96
GROUND = 74
BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def c(value):
    return hex_rgb(value) + (255,) if isinstance(value, str) else value


class Canvas:
    def __init__(self, seed):
        self.img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
        self.px = self.img.load()
        self.rng = random.Random(seed)

    def set(self, x, y, color):
        x, y = int(round(x)), int(round(y))
        if 0 <= x < W and 0 <= y < H:
            self.px[x, y] = c(color)

    def get(self, x, y):
        return self.px[int(x), int(y)]

    def gradient(self, y0, y1, colors):
        """Senkrechter Verlauf über mehrere Farben mit geordnetem Dithering (keine weichen Übergänge)."""
        colors = [c(v) for v in colors]
        steps = len(colors) - 1
        for y in range(y0, y1):
            t = (y - y0) / max(1, y1 - y0 - 1) * steps
            index = min(steps - 1, int(t))
            frac = t - index
            for x in range(W):
                use = colors[index + 1] if frac * 16 > BAYER[y % 4][x % 4] else colors[index]
                self.px[x, y] = use

    def ridge(self, base, amp, color, freq=1.0, seed=0, jag=0.0):
        """Hügel- oder Bergkette: alles unter einer welligen Linie füllen."""
        phase = [self.rng.random() * 6.28 for _ in range(3)]
        for x in range(W):
            y = base
            y += math.sin(x * 0.021 * freq + phase[0]) * amp
            y += math.sin(x * 0.053 * freq + phase[1]) * amp * 0.45
            y += math.sin(x * 0.13 * freq + phase[2]) * amp * jag
            for yy in range(max(0, int(y)), H):
                self.px[x, yy] = c(color)

    def rect(self, x0, y0, x1, y1, color):
        for y in range(max(0, int(y0)), min(H, int(y1) + 1)):
            for x in range(max(0, int(x0)), min(W, int(x1) + 1)):
                self.px[x, y] = c(color)

    def glow(self, cx, cy, radius, color, strength=0.6):
        """Lichtschein in drei harten Ringen (typisch für Pixel-Art), mischt die Farbe in die Pixel."""
        rgb = c(color)
        for y in range(int(cy - radius), int(cy + radius) + 1):
            for x in range(int(cx - radius), int(cx + radius) + 1):
                if not (0 <= x < W and 0 <= y < H):
                    continue
                d = math.hypot((x - cx), (y - cy) * 1.15) / radius
                if d >= 1:
                    continue
                ring = 3 if d < 0.33 else 2 if d < 0.66 else 1
                mix = strength * ring / 3 * 0.55
                base = self.px[x, y]
                self.px[x, y] = tuple(int(base[i] + (rgb[i] - base[i]) * mix) for i in range(3)) + (255,)

    def pine(self, x, base, height, color, trunk=None):
        width = height * 0.42
        for row in range(int(height)):
            y = base - row
            tier = (row % max(3, int(height / 4))) / max(3, int(height / 4))
            half = (1 - row / height) * width * (0.65 + 0.35 * (1 - tier))
            for xx in range(int(x - half), int(x + half) + 1):
                self.set(xx, y, color)
        if trunk:
            self.rect(x - 1, base, x, base + 2, trunk)

    def dead_tree(self, x, base, height, color):
        self.rect(x, base - height, x + 1, base, color)
        for i in range(4):
            by = base - height * (0.45 + i * 0.13)
            direction = -1 if i % 2 else 1
            length = height * (0.35 - i * 0.05)
            for t in range(int(length)):
                self.set(x + direction * t, by - t * 0.6, color)

    def ground_noise(self, y0, colors, density=0.25):
        for y in range(y0, H):
            for x in range(W):
                if self.rng.random() < density:
                    self.px[x, y] = c(self.rng.choice(colors))

    def bricks(self, x0, y0, x1, y1, base, mortar, light=None, bw=8, bh=4):
        self.rect(x0, y0, x1, y1, base)
        for y in range(y0, y1 + 1):
            row = (y - y0) // bh
            if (y - y0) % bh == 0:
                for x in range(x0, x1 + 1):
                    self.set(x, y, mortar)
                continue
            offset = (bw // 2) * (row % 2)
            for x in range(x0, x1 + 1):
                if (x - x0 + offset) % bw == 0:
                    self.set(x, y, mortar)
                elif light and (y - y0) % bh == 1 and self.rng.random() < 0.35:
                    self.set(x, y, light)

    def stars(self, y1, colors, count):
        for _ in range(count):
            self.set(self.rng.randrange(W), self.rng.randrange(y1), self.rng.choice(colors))

    def save(self, path):
        self.img.save(path)


def meadow():
    cv = Canvas(11)
    cv.gradient(0, 60, ["#16233a", "#24405a", "#3f6a73", "#c98a5a", "#e8b26a"])
    cv.stars(20, ["#9fb6cf", "#d8e4f0"], 18)
    cv.ridge(48, 6, "#2a3d4c", freq=0.7)
    for x in range(-4, W, 9):
        cv.pine(x + cv.rng.randrange(4), 60, 20 + cv.rng.randrange(10), "#1d2f33")
    cv.ridge(62, 3, "#1a2a24", freq=1.4, jag=0.3)
    for x in range(2, W, 13):
        cv.pine(x + cv.rng.randrange(6), 72, 26 + cv.rng.randrange(12), "#13201c", trunk="#2a1c14")
    cv.gradient(GROUND, H, ["#2f4a2a", "#26391f", "#1c2a18"])
    cv.ground_noise(GROUND, ["#3d5c33", "#203018", "#4a6a3a"], 0.2)
    for x in range(0, W, 5):
        h = cv.rng.randrange(2, 5)
        for t in range(h):
            cv.set(x + cv.rng.randrange(3), GROUND - t + 1, "#4f7a3c")
    for _ in range(9):
        cv.set(cv.rng.randrange(W), cv.rng.randrange(48, 72), "#f6e58a")
    return cv


def road():
    cv = Canvas(23)
    cv.gradient(0, 62, ["#1c2238", "#3a3f5c", "#7a5f6a", "#d58a5a", "#f2c27a"])
    cv.ridge(52, 4, "#3a3a4c", freq=0.6)
    # Wachturm und Palisade in der Ferne
    cv.rect(188, 30, 196, 56, "#262634")
    cv.rect(185, 26, 199, 31, "#262634")
    cv.set(191, 34, "#f2c27a")
    for x in range(150, 236, 3):
        cv.rect(x, 48 + (x % 2), x + 1, 58, "#2a2a38")
    cv.ridge(62, 2, "#2c2a2e", freq=1.2)
    for x in range(-2, W, 16):
        cv.pine(x + cv.rng.randrange(8), 66, 14 + cv.rng.randrange(10), "#1f2026")
    cv.gradient(GROUND - 4, H, ["#4a3a2c", "#3a2e24", "#2a2019"])
    # Weg mit Spurrillen
    for y in range(GROUND - 2, H):
        for x in range(W):
            if (x + y * 2) % 37 == 0 or abs(((y - GROUND) * 3) - (x % 9)) == 0 and cv.rng.random() < 0.2:
                cv.set(x, y, "#5c4a38")
    cv.ground_noise(GROUND - 2, ["#57452f", "#2e241b", "#6a553c"], 0.18)
    for x in range(8, W, 30):
        cv.rect(x, GROUND - 9, x + 1, GROUND, "#3a2a1c")
        cv.rect(x, GROUND - 7, x + 30, GROUND - 6, "#4a3826")
    return cv


def fields():
    cv = Canvas(37)
    cv.gradient(0, 62, ["#141226", "#2c2142", "#4a3c5a", "#6a7a5a", "#9aa86a"])
    cv.stars(24, ["#b8a8d8"], 10)
    # fahler Mond
    for y in range(8, 22):
        for x in range(200, 216):
            if math.hypot(x - 208, y - 15) < 7:
                cv.set(x, y, "#d8e0b8" if math.hypot(x - 206, y - 13) < 6 else "#a8b090")
    cv.ridge(56, 3, "#2a2638", freq=0.8)
    cv.gradient(60, GROUND, ["#3a3a46", "#4a4c52"])
    for x in range(0, W, 4):
        cv.rect(x, 60, x + 1, GROUND, "#2a2e2a" if x % 8 else "#343a30")
    for x in (30, 92, 170, 232):
        cv.dead_tree(x, 66, 22 + cv.rng.randrange(8), "#15121c")
    # Vogelscheuche
    cv.rect(132, 46, 133, 66, "#1a1622")
    cv.rect(125, 51, 140, 52, "#1a1622")
    cv.rect(130, 42, 135, 47, "#1a1622")
    cv.gradient(GROUND, H, ["#3c3a2e", "#2c2a22", "#1f1d18"])
    cv.ground_noise(GROUND, ["#4c4a34", "#2a281e", "#5a6a3a"], 0.2)
    # Nebelbänder
    for band_y in (63, 69):
        for x in range(W):
            if (x // 3 + band_y) % 5 and cv.rng.random() < 0.5:
                base = cv.get(x, band_y)
                cv.set(x, band_y, tuple(min(255, v + 28) for v in base[:3]) + (255,))
    return cv


def ashgrounds():
    cv = Canvas(41)
    cv.gradient(0, 60, ["#1a0c10", "#3a1414", "#6a2418", "#b84a20", "#e88a3a"])
    # Vulkan
    for y in range(18, 62):
        half = (y - 18) * 1.25
        for x in range(int(70 - half), int(70 + half)):
            cv.set(x, y, "#2a1414")
    cv.glow(70, 18, 14, "#ff8a3a", 0.8)
    cv.ridge(54, 5, "#2a1416", freq=0.9, jag=0.4)
    cv.ridge(64, 3, "#1c0e10", freq=1.6, jag=0.5)
    cv.gradient(GROUND, H, ["#2a1a18", "#1f1414", "#160e0e"])
    cv.ground_noise(GROUND, ["#3a2420", "#120a0a"], 0.25)
    # Glutrisse
    for _ in range(14):
        x, y = cv.rng.randrange(W), cv.rng.randrange(GROUND + 3, H)
        for t in range(cv.rng.randrange(4, 10)):
            cv.set(x + t, y + (t // 3) * (1 if cv.rng.random() < 0.5 else -1), "#ff6a2a" if t % 3 else "#ffb347")
    for _ in range(26):
        cv.set(cv.rng.randrange(W), cv.rng.randrange(0, 70), cv.rng.choice(["#ff8a3a", "#ffcf5a"]))
    return cv


def dungeon_floor(cv, base, mortar, light):
    cv.gradient(GROUND, H, [base, mortar])
    for y in range(GROUND, H):
        for x in range(W):
            if (y - GROUND) % 6 == 0 or (x + ((y - GROUND) // 6) * 7) % 14 == 0:
                cv.set(x, y, mortar)
            elif (y - GROUND) % 6 == 1 and cv.rng.random() < 0.3:
                cv.set(x, y, light)


def torch(cv, x, y, flame="#ffb347"):
    cv.rect(x, y, x + 1, y + 6, "#3a2a1c")
    cv.glow(x + 0.5, y - 1, 22, flame, 0.55)
    cv.rect(x - 1, y - 3, x + 2, y - 1, flame)
    cv.set(x, y - 4, "#fff0b0")


def crypt():
    cv = Canvas(53)
    cv.bricks(0, 0, W - 1, GROUND - 1, "#2a2a34", "#1a1a22", "#34343f", bw=10, bh=5)
    for ax in (40, 128, 216):
        for y in range(18, GROUND):
            for x in range(ax - 18, ax + 18):
                inside = abs(x - ax) < 16 and (y > 34 or math.hypot(x - ax, y - 34) < 16)
                if inside:
                    cv.set(x, y, "#100f16" if y > 30 else "#14131c")
        cv.rect(ax - 20, 16, ax - 17, GROUND, "#3a3a46")
        cv.rect(ax + 17, 16, ax + 20, GROUND, "#3a3a46")
    # Särge und Knochen in den Nischen
    cv.rect(118, 62, 138, 70, "#3a2e26")
    cv.rect(119, 63, 137, 64, "#4a3c30")
    for x, y in ((30, 70), (34, 69), (210, 70), (222, 71)):
        cv.set(x, y, "#c9c1ad")
    torch(cv, 84, 36)
    torch(cv, 172, 36)
    dungeon_floor(cv, "#26242c", "#16151c", "#33313b")
    return cv


def ironhold():
    cv = Canvas(61)
    cv.bricks(0, 0, W - 1, GROUND - 1, "#2c3036", "#1a1d22", "#3a3f46", bw=12, bh=6)
    # Eisentor
    cv.rect(100, 22, 156, GROUND, "#16181c")
    for x in range(102, 156, 5):
        cv.rect(x, 22, x + 1, GROUND, "#4a4f58")
    for y in (32, 50):
        cv.rect(100, y, 156, y + 1, "#4a4f58")
    # Banner
    for bx in (40, 210):
        cv.rect(bx - 8, 12, bx + 8, 46, "#6a1f24")
        for x in range(bx - 8, bx + 9):
            if (x - bx) % 4 == 0:
                cv.set(x, 47, "#6a1f24")
        cv.rect(bx - 2, 24, bx + 2, 32, "#c9a24a")
    # Ketten
    for cx in (70, 186):
        for y in range(0, 40, 2):
            cv.set(cx + (y // 2) % 2, y, "#5a5f68")
    # Esse
    cv.glow(20, 66, 26, "#ff8a3a", 0.5)
    torch(cv, 80, 40)
    torch(cv, 176, 40)
    dungeon_floor(cv, "#2a2c30", "#18191c", "#383b40")
    return cv


def tower():
    cv = Canvas(71)
    cv.bricks(0, 0, W - 1, GROUND - 1, "#2a2440", "#191528", "#352e50", bw=9, bh=5)
    # Fenster mit Sternenhimmel
    for wx in (48, 208):
        for y in range(16, 50):
            for x in range(wx - 9, wx + 10):
                if y > 24 or math.hypot(x - wx, y - 24) < 9.5:
                    cv.set(x, y, "#0c0a1c" if cv.rng.random() > 0.04 else "#d8d0ff")
        cv.rect(wx - 11, 49, wx + 11, 51, "#3a3256")
    # Runenkreis am Boden und an der Wand
    for a in range(0, 360, 12):
        x = 128 + math.cos(math.radians(a)) * 30
        y = 38 + math.sin(math.radians(a)) * 18
        cv.set(x, y, "#b089ff")
    cv.glow(128, 38, 26, "#b089ff", 0.35)
    for a in range(0, 360, 45):
        cv.set(128 + math.cos(math.radians(a)) * 20, 38 + math.sin(math.radians(a)) * 12, "#e8d8ff")
    torch(cv, 92, 40, "#c8a8ff")
    torch(cv, 164, 40, "#c8a8ff")
    dungeon_floor(cv, "#2c2840", "#1a1628", "#3a3452")
    return cv


def ashcathedral():
    cv = Canvas(83)
    cv.bricks(0, 0, W - 1, GROUND - 1, "#2e1c1c", "#1a0f10", "#3c2524", bw=10, bh=5)
    # Gotische Fenster mit Glut dahinter
    for wx in (36, 128, 220):
        for y in range(8, 56):
            for x in range(wx - 10, wx + 11):
                pointed = y > 22 or (abs(x - wx) < (y - 8) * 0.75)
                if pointed:
                    t = (y - 8) / 48
                    cv.set(x, y, "#ff8a3a" if (x + y) % 7 == 0 else ("#b83a20" if t > 0.5 else "#e86a2a"))
        cv.rect(wx - 1, 8, wx, 56, "#2a1414")
        cv.rect(wx - 10, 32, wx + 10, 33, "#2a1414")
        cv.glow(wx, 34, 26, "#ff7a3a", 0.35)
    # Säulen
    for px in (82, 174):
        cv.rect(px - 4, 0, px + 4, GROUND, "#3a2626")
        cv.rect(px - 3, 0, px - 2, GROUND, "#4a3030")
    # Teppich
    dungeon_floor(cv, "#2a1a1a", "#160c0c", "#382222")
    cv.rect(96, GROUND, 160, H, "#5a1a1e")
    for x in range(96, 161, 4):
        cv.set(x, GROUND, "#c9a24a")
    for _ in range(30):
        cv.set(cv.rng.randrange(W), cv.rng.randrange(0, GROUND), cv.rng.choice(["#8a7a70", "#5a4a44"]))
    return cv


BACKGROUNDS = {"meadow": meadow, "road": road, "fields": fields, "ashgrounds": ashgrounds,
               "crypt": crypt, "ironhold": ironhold, "tower": tower, "ashcathedral": ashcathedral}
