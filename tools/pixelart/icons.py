"""Item-Icons als Pixel-Art, 16x16 pro Slot. Die Seltenheit zeigt das Spiel über Rahmen und Leuchten."""

from pixel import Sprite

ICON = 16


def _base():
    s = Sprite(ICON, ICON)
    s.material("metal", "#b8c2cf")
    s.material("gold", "#d8a83a")
    s.material("wood", "#7a5432")
    s.material("leather", "#8a5a34")
    s.material("cloth", "#4a6a9a")
    s.material("gem", "#d0484a")
    s.material("blue", "#4a8ad8")
    return s


def weapon():
    s = _base()
    s.poly([(13, 1), (14, 2), (6, 10), (5, 9)], "metal")
    s.line(7, 7, 12, 2, "metal", shade=4)
    s.line(3, 8, 7, 12, "gold", width=2)
    s.line(2, 13, 5, 10, "leather", width=2)
    s.pixel(1, 14, "gold", shade=3)
    return s.render()


def offhand():
    s = _base()
    s.poly([(2, 2), (13, 2), (13, 8), (8, 14), (7, 14), (2, 8)], "metal")
    s.poly([(4, 4), (11, 4), (11, 8), (8, 12), (7, 12), (4, 8)], "cloth")
    s.line(7, 4, 7, 11, "gold")
    s.line(4, 7, 11, 7, "gold")
    return s.render()


def chest():
    s = _base()
    s.poly([(3, 2), (6, 2), (8, 4), (10, 2), (13, 2), (15, 5), (13, 7), (12, 6), (12, 14), (4, 14), (4, 6), (3, 7), (1, 5)], "metal")
    s.line(8, 5, 8, 13, "metal", shade=1)
    s.rect(4, 11, 12, 11, "leather")
    s.pixel(8, 11, "gold", shade=3)
    return s.render()


def pants():
    s = _base()
    s.poly([(3, 2), (13, 2), (14, 14), (10, 14), (8, 7), (6, 14), (2, 14)], "leather")
    s.rect(3, 2, 13, 3, "wood")
    s.pixel(8, 2, "gold", shade=3)
    return s.render()


def boots():
    s = _base()
    s.poly([(4, 1), (9, 1), (9, 9), (14, 11), (14, 14), (3, 14), (4, 9)], "leather")
    s.rect(4, 1, 9, 2, "wood")
    s.rect(3, 13, 14, 14, "wood")
    s.pixel(10, 11, "metal", shade=4)
    return s.render()


def necklace():
    s = _base()
    for x, y in ((3, 2), (2, 4), (2, 6), (3, 8), (5, 10), (12, 2), (13, 4), (13, 6), (12, 8), (10, 10)):
        s.pixel(x, y, "gold", shade=3)
    s.poly([(7, 9), (9, 9), (11, 12), (8, 15), (5, 12)], "gold")
    s.ellipse(6, 10, 9, 13, "blue")
    s.pixel(7, 11, "blue", shade=4)
    return s.render()


def ring():
    s = _base()
    s.ellipse(3, 5, 12, 14, "gold")
    s.ellipse(5, 7, 10, 12, "gold", erase=True)
    s.poly([(5, 4), (7, 1), (9, 1), (11, 4), (8, 7)], "gem")
    s.pixel(7, 2, "gem", shade=4)
    return s.render()


def material():
    s = _base()
    s.poly([(4, 2), (11, 2), (14, 6), (8, 14), (2, 6)], "blue")
    s.poly([(4, 2), (7, 2), (6, 6), (2, 6)], "blue", shade=3)
    s.line(2, 6, 14, 6, "blue", shade=1)
    s.pixel(5, 3, "blue", shade=4)
    return s.render()


ICONS = {"weapon": weapon, "offhand": offhand, "chest": chest, "pants": pants, "boots": boots,
         "necklace": necklace, "ring": ring, "material": material}
