"""Kleines Pixel-Art-Werkzeug fuer Fantasy Grind.

Arbeitsweise (wie beim Zeichnen von Hand, nur reproduzierbar):
1. Formen werden ohne Kantenglaettung in eine Label-Karte gemalt (jedes Pixel kennt Material und Teil).
2. Jedes Material hat eine Farbrampe mit 5 Stufen (dunkel -> hell, mit Farbton-Verschiebung).
3. Schattierung: Licht kommt von oben links. Kanten oben/links eines Teils werden heller,
   Kanten unten/rechts dunkler, dazu ein leichter Verlauf von oben nach unten im Teil.
4. Kontur: Um die Silhouette kommt eine dunkle, farbige Linie (Selout), keine reine Schwarzlinie.
"""

import colorsys
import math

from PIL import Image, ImageDraw


def hex_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4))


def _shift_hue(h, target, amount):
    diff = ((target - h + 0.5) % 1.0) - 0.5
    return (h + diff * amount) % 1.0


def ramp(base, steps=5, spread=0.13):
    """Farbrampe: Mitte = Grundfarbe; dunkler Richtung Blau/Violett, heller Richtung Gelb."""
    r, g, b = [c / 255 for c in hex_rgb(base)]
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    out = []
    mid = steps // 2
    for index in range(steps):
        k = index - mid
        nl = min(0.95, max(0.04, l + k * spread))
        if k < 0:
            nh = _shift_hue(h, 0.70, 0.10 * -k)
            ns = min(1.0, s * (1 + 0.08 * -k))
        elif k > 0:
            nh = _shift_hue(h, 0.15, 0.08 * k)
            ns = max(0.0, s * (1 - 0.10 * k))
        else:
            nh, ns = h, s
        rr, gg, bb = colorsys.hls_to_rgb(nh, nl, ns)
        out.append((round(rr * 255), round(gg * 255), round(bb * 255)))
    return out


class Sprite:
    """Leinwand mit Label-Karte. paint() malt eine Form mit Material, Teil-Kennung und optionaler fester Stufe."""

    def __init__(self, width, height):
        self.w = width
        self.h = height
        self.mat = [[None] * width for _ in range(height)]
        self.part = [[0] * width for _ in range(height)]
        self.fixed = [[None] * width for _ in range(height)]
        self.materials = {}
        self.next_part = 1

    def material(self, name, base, spread=0.13):
        self.materials[name] = ramp(base, spread=spread)
        return name

    def set_color(self, name, colors):
        self.materials[name] = [tuple(c) if not isinstance(c, str) else hex_rgb(c) for c in colors]

    def _mask(self, draw_fn):
        mask = Image.new("1", (self.w, self.h), 0)
        draw_fn(ImageDraw.Draw(mask))
        return mask

    def paint(self, mask, material, shade=None, part=None, only_on=None, erase=False):
        if part is None:
            part = self.next_part
            self.next_part += 1
        data = mask.load()
        for y in range(self.h):
            for x in range(self.w):
                if not data[x, y]:
                    continue
                if only_on is not None and self.mat[y][x] not in only_on:
                    continue
                if erase:
                    self.mat[y][x] = None
                    self.fixed[y][x] = None
                    continue
                self.mat[y][x] = material
                self.part[y][x] = part
                self.fixed[y][x] = shade
        return part

    # Formen -----------------------------------------------------------------
    def rect(self, x0, y0, x1, y1, material, **kw):
        return self.paint(self._mask(lambda d: d.rectangle([round(x0), round(y0), round(x1), round(y1)], fill=1)), material, **kw)

    def ellipse(self, x0, y0, x1, y1, material, **kw):
        return self.paint(self._mask(lambda d: d.ellipse([round(x0), round(y0), round(x1), round(y1)], fill=1)), material, **kw)

    def poly(self, points, material, **kw):
        pts = [(round(x), round(y)) for x, y in points]
        return self.paint(self._mask(lambda d: d.polygon(pts, fill=1)), material, **kw)

    def line(self, x0, y0, x1, y1, material, width=1, **kw):
        def draw(d):
            if width <= 1:
                d.line([(round(x0), round(y0)), (round(x1), round(y1))], fill=1, width=1)
                return
            dx, dy = x1 - x0, y1 - y0
            length = math.hypot(dx, dy) or 1
            nx, ny = -dy / length * (width / 2), dx / length * (width / 2)
            d.polygon([(round(x0 + nx), round(y0 + ny)), (round(x1 + nx), round(y1 + ny)),
                       (round(x1 - nx), round(y1 - ny)), (round(x0 - nx), round(y0 - ny))], fill=1)
            d.line([(round(x0), round(y0)), (round(x1), round(y1))], fill=1, width=1)
        return self.paint(self._mask(draw), material, **kw)

    def pixel(self, x, y, material, shade=None):
        x, y = round(x), round(y)
        if 0 <= x < self.w and 0 <= y < self.h:
            self.mat[y][x] = material
            self.fixed[y][x] = shade
            self.part[y][x] = self.next_part
            self.next_part += 1

    def pixels(self, coords, material, shade=None):
        for x, y in coords:
            self.pixel(x, y, material, shade)

    # Ausgabe ---------------------------------------------------------------
    def _filled(self, x, y):
        return 0 <= x < self.w and 0 <= y < self.h and self.mat[y][x] is not None

    def render(self, outline=True, outline_color=None, light=True):
        img = Image.new("RGBA", (self.w, self.h), (0, 0, 0, 0))
        px = img.load()
        # Teil-Ausdehnung fuer den Verlauf von oben nach unten
        extent = {}
        for y in range(self.h):
            for x in range(self.w):
                if self.mat[y][x] is None:
                    continue
                p = self.part[y][x]
                top, bottom = extent.get(p, (y, y))
                extent[p] = (min(top, y), max(bottom, y))
        for y in range(self.h):
            for x in range(self.w):
                m = self.mat[y][x]
                if m is None:
                    continue
                colors = self.materials[m]
                if self.fixed[y][x] is not None:
                    level = self.fixed[y][x]
                else:
                    level = 2
                    if light:
                        p = self.part[y][x]
                        same = lambda xx, yy: 0 <= xx < self.w and 0 <= yy < self.h and self.part[yy][xx] == p and self.mat[yy][xx] is not None
                        if not same(x, y - 1) or not same(x - 1, y):
                            level += 1
                        if not same(x, y + 1) or not same(x + 1, y):
                            level -= 1
                        top, bottom = extent[p]
                        if bottom - top >= 6 and y > top + (bottom - top) * 0.68:
                            level -= 1
                        if not same(x, y - 1) and not same(x - 1, y):
                            level += 1
                level = max(0, min(len(colors) - 1, level))
                px[x, y] = colors[level] + (255,)
        if outline:
            for y in range(self.h):
                for x in range(self.w):
                    if self.mat[y][x] is not None:
                        continue
                    neighbours = [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
                    touching = [self.mat[ny][nx] for nx, ny in neighbours if self._filled(nx, ny)]
                    if not touching:
                        continue
                    if outline_color:
                        px[x, y] = outline_color + (255,)
                    else:
                        base = self.materials[touching[0]][0]
                        px[x, y] = tuple(max(0, int(c * 0.45 + 14 * (i == 2))) for i, c in enumerate(base)) + (255,)
        return img


def sheet(frames):
    """Mehrere gleich grosse Bilder nebeneinander zu einem Sprite-Sheet."""
    w, h = frames[0].size
    out = Image.new("RGBA", (w * len(frames), h), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        out.paste(frame, (index * w, 0))
    return out


def upscale(img, factor):
    return img.resize((img.width * factor, img.height * factor), Image.NEAREST)
