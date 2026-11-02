"""Volumen-Renderer für Pixel-Art.

Figuren werden aus einfachen Körpern gebaut (Ellipsoide, sich verjüngende Kapseln, flache Platten),
pro Pixel wird Tiefe und Oberflächen-Normale berechnet. Daraus entsteht Licht (oben links vorne),
Glanz auf Metall, Schlagschatten zwischen Teilen, Innenkanten und eine farbige Aussenkontur.
Zum Schluss wird jede Helligkeit auf eine handverlesene Farbrampe (6 Stufen) gerundet - so bleibt
es echte Pixel-Art ohne weiche Kanten.
"""

import colorsys
import math

import numpy as np
from PIL import Image, ImageDraw

LIGHT = np.array([-0.55, -0.72, 0.62])
LIGHT = LIGHT / np.linalg.norm(LIGHT)
HALF = LIGHT + np.array([0.0, 0.0, 1.0])
HALF = HALF / np.linalg.norm(HALF)
BAYER2 = np.array([[0.0, 0.5], [0.75, 0.25]])


def hex_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def _shift(h, target, amount):
    diff = ((target - h + 0.5) % 1.0) - 0.5
    return (h + diff * amount) % 1.0


def ramp6(base, spread=0.11):
    """6 Farbstufen: 0 = tiefster Schatten ... 5 = Glanzlicht. Schatten kühler, Licht wärmer."""
    r, g, b = [c / 255 for c in hex_rgb(base)]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    out = []
    for index in range(6):
        k = index - 3
        nl = min(0.96, max(0.035, l + k * spread + (0.03 if k > 0 else 0)))
        if k < 0:
            nh, ns = _shift(h, 0.69, 0.07 * -k), min(1, s * (1 + 0.06 * -k))
        else:
            nh, ns = _shift(h, 0.14, 0.06 * k), max(0, s * (1 - 0.09 * k))
        rr, gg, bb = colorsys.hls_to_rgb(nh, nl, ns)
        out.append((round(rr * 255), round(gg * 255), round(bb * 255)))
    return out


class Material:
    def __init__(self, base, spec=0.0, shine=18, noise=0.0, emissive=False, spread=0.11):
        self.ramp = ramp6(base, spread)
        self.spec = spec
        self.shine = shine
        self.noise = noise
        self.emissive = emissive


class Scene:
    def __init__(self, width=64, height=64):
        self.w, self.h = width, height
        ys, xs = np.mgrid[0:height, 0:width]
        self.X = xs + 0.5
        self.Y = ys + 0.5
        self.z = np.full((height, width), -1e9)
        self.n = np.zeros((height, width, 3))
        self.mat = np.full((height, width), -1, dtype=int)
        self.prim = np.full((height, width), -1, dtype=int)
        self.flat = np.full((height, width), -1.0)
        self.materials = []
        self.names = {}
        self.count = 0

    def material(self, name, *args, **kw):
        self.names[name] = len(self.materials)
        self.materials.append(Material(*args, **kw))

    def _apply(self, mask, z, nx, ny, nz, mat, flat=None):
        if mat not in self.names:
            raise KeyError(mat)
        win = mask & (z > self.z)
        if not win.any():
            self.count += 1
            return
        length = np.sqrt(nx * nx + ny * ny + nz * nz) + 1e-9
        self.z[win] = z[win]
        self.n[win, 0] = (nx / length)[win]
        self.n[win, 1] = (ny / length)[win]
        self.n[win, 2] = (nz / length)[win]
        self.mat[win] = self.names[mat]
        self.prim[win] = self.count
        self.flat[win] = -1.0 if flat is None else flat
        self.count += 1

    # Körper -----------------------------------------------------------------------------
    def ellipsoid(self, cx, cy, cz, rx, ry, rz, mat):
        dx = (self.X - cx) / rx
        dy = (self.Y - cy) / ry
        q = 1 - dx * dx - dy * dy
        mask = q > 0
        hz = np.sqrt(np.clip(q, 0, 1))
        z = cz + rz * hz
        self._apply(mask, z, dx / rx, dy / ry, hz / rz, mat)

    def sphere(self, cx, cy, cz, r, mat):
        self.ellipsoid(cx, cy, cz, r, r, r, mat)

    def capsule(self, a, b, r0, r1, mat):
        """Sich verjüngende Kapsel von a=(x,y,z) nach b, Radius r0 -> r1 (Arme, Beine, Schwänze, Griffe)."""
        ax, ay, az = a
        bx, by, bz = b
        vx, vy = bx - ax, by - ay
        length2 = vx * vx + vy * vy + 1e-9
        t = np.clip(((self.X - ax) * vx + (self.Y - ay) * vy) / length2, 0, 1)
        cx = ax + vx * t
        cy = ay + vy * t
        r = r0 + (r1 - r0) * t
        dx = self.X - cx
        dy = self.Y - cy
        d2 = dx * dx + dy * dy
        mask = d2 < r * r
        h = np.sqrt(np.clip(r * r - d2, 0, None))
        z = az + (bz - az) * t + h
        self._apply(mask, z, dx, dy, h + 1e-3, mat)

    def slab(self, points, z, mat, tilt=(0.0, 0.0), bevel=True, flat=None):
        """Flache Platte (Klingen, Schilde, Umhänge, Federn). tilt neigt die Fläche zum Licht."""
        img = Image.new("1", (self.w, self.h), 0)
        ImageDraw.Draw(img).polygon([(round(x), round(y)) for x, y in points], fill=1)
        mask = np.array(img, dtype=bool)
        nx = np.full(mask.shape, float(tilt[0]))
        ny = np.full(mask.shape, float(tilt[1]))
        nz = np.ones(mask.shape)
        if bevel:
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                shifted = np.zeros_like(mask)
                ys = slice(max(0, dy), self.h + min(0, dy))
                yd = slice(max(0, -dy), self.h + min(0, -dy))
                xs = slice(max(0, dx), self.w + min(0, dx))
                xd = slice(max(0, -dx), self.w + min(0, -dx))
                shifted[yd, xd] = mask[ys, xs]
                edge = mask & ~shifted
                nx[edge] += dx * 0.9
                ny[edge] += dy * 0.9
        self._apply(mask, np.full(mask.shape, float(z)), nx, ny, nz, mat, flat)

    def pixel(self, x, y, z, mat, level):
        """Einzelnes Pixel mit fester Stufe (Augen, Nieten, Funken)."""
        x, y = int(x), int(y)
        if 0 <= x < self.w and 0 <= y < self.h and z > self.z[y, x] - 0.01:
            self.z[y, x] = z
            self.mat[y, x] = self.names[mat]
            self.prim[y, x] = self.count
            self.flat[y, x] = level
            self.count += 1

    # Ausgabe ---------------------------------------------------------------------------
    def render(self, outline=True):
        filled = self.mat >= 0
        nx, ny, nz = self.n[..., 0], self.n[..., 1], self.n[..., 2]
        diffuse = np.clip(nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2], 0, 1)
        spec_dot = np.clip(nx * HALF[0] + ny * HALF[1] + nz * HALF[2], 0, 1)
        value = np.zeros((self.h, self.w))
        level = np.zeros((self.h, self.w), dtype=int)
        rng = np.random.default_rng(7)
        noise_field = rng.random((self.h, self.w)) - 0.5
        bayer = np.tile(BAYER2, (self.h // 2 + 1, self.w // 2 + 1))[: self.h, : self.w]
        for index, material in enumerate(self.materials):
            m = self.mat == index
            if not m.any():
                continue
            v = 0.2 + 0.7 * diffuse[m] + 0.06 * nz[m]
            if material.spec:
                v = v + material.spec * spec_dot[m] ** material.shine
            if material.noise:
                v = v + material.noise * noise_field[m]
            if material.emissive:
                v = 0.72 + 0.3 * nz[m]
            value[m] = v
        # Schlagschatten: ein Teil weiter vorne oben links wirft Schatten nach unten rechts
        shadow = np.zeros_like(filled)
        for dx, dy in ((1, 1), (1, 0), (0, 1), (2, 2), (2, 1)):
            front = np.full_like(self.z, -1e9)
            front[dy:, dx:] = self.z[: self.h - dy, : self.w - dx]
            same = np.zeros_like(filled)
            same[dy:, dx:] = self.prim[: self.h - dy, : self.w - dx] == self.prim[dy:, dx:]
            shadow |= filled & (front > self.z + 2.2) & ~same
        value = value - shadow * 0.2
        level = np.clip(np.floor(value * 4.9), 0, 5).astype(int)
        # Innenkanten: deutlicher Tiefensprung -> hintere Seite dunkel absetzen
        for dx, dy in ((1, 0), (0, 1), (-1, 0), (0, -1)):
            neighbour_z = np.full_like(self.z, -1e9)
            ys = slice(max(0, dy), self.h + min(0, dy))
            yd = slice(max(0, -dy), self.h + min(0, -dy))
            xs = slice(max(0, dx), self.w + min(0, dx))
            xd = slice(max(0, -dx), self.w + min(0, -dx))
            neighbour_z[yd, xd] = self.z[ys, xs]
            jump = filled & (neighbour_z > self.z + 3.5) & (neighbour_z > -1e8)
            level[jump] = np.maximum(0, level[jump] - 2)
        fixed = self.flat >= 0
        level[fixed] = self.flat[fixed].astype(int)
        img = Image.new("RGBA", (self.w, self.h), (0, 0, 0, 0))
        px = img.load()
        for y in range(self.h):
            for x in range(self.w):
                if filled[y, x]:
                    px[x, y] = self.materials[self.mat[y, x]].ramp[level[y, x]] + (255,)
        if outline:
            for y in range(self.h):
                for x in range(self.w):
                    if filled[y, x]:
                        continue
                    best = None
                    for dx, dy in ((0, 1), (0, -1), (1, 0), (-1, 0)):
                        xx, yy = x + dx, y + dy
                        if 0 <= xx < self.w and 0 <= yy < self.h and filled[yy, xx]:
                            if best is None or self.z[yy, xx] > best[0]:
                                best = (self.z[yy, xx], self.mat[yy, xx])
                    if best:
                        dark = self.materials[best[1]].ramp[0]
                        px[x, y] = tuple(int(c * 0.55) for c in dark) + (255,)
        return img
