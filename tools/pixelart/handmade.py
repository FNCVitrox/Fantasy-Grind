"""Handgezeichnete Pixel-Sprites im Stil von 0x72 (dunkle Kontur #222222, flache Farben, 1 Licht, 1 Schatten).

Ergänzt, was im Paket fehlt: Wolf, Keiler, Krähe, Schild, Krone.
Jede Zeile ist eine Pixelreihe; jedes Zeichen ein Pixel. '.' = transparent.
Farbschlüssel: k Kontur, D dunkel, M Grundfarbe, L hell, E Auge, W weiss (Zähne), A Akzent.
"""

from PIL import Image

OUTLINE = (34, 34, 34, 255)

WOLF = [
    "......................k..k......",
    ".....................kMk.kLk....",
    ".....................kMMkkMMk...",
    "....................kMMMMMMMMk..",
    "....................kMMMMEMMMkk.",
    "...k...............kMMMMMMMLLLLk",
    "..kMk..............kMMMMMMLLLLkk",
    "..kMMk..kkkkkkkkkkkMMMMMLLLkk...",
    "...kMMkkMMMMMMMMMMMMMMMMMLLk....",
    "....kMMMMMMMMMLMMMMMMMMMLLLk....",
    "....kMMMMMMMMMMMMMMMMMMLLLk.....",
    "....kDMMMMMMMMMMMMMMMMMLLLk.....",
    "....kDDMMMMMMMMMMMMMMMDLLLk.....",
    "....kDDDDkkkkkkkkkkkkDDMLk......",
    "....kDDkDk.........kDkMMk.......",
    "....kDkkDk.........kDkkMk.......",
    "....kDk.kDk........kDk.kMk......",
    "...kkDk.kDk.......kkDk.kMk......",
    "...kkkk.kkkk......kkkk.kkkk.....",
]

WOLF_BITE = [
    "......................k..k......",
    ".....................kMk.kLk....",
    ".....................kMMkkMMk...",
    "....................kMMMMMMMMk..",
    "....................kMMMMEMMMkk.",
    "...k...............kMMMMMMMLLLLk",
    "..kMk..............kMMMMMMWkkkkk",
    "..kMMk..kkkkkkkkkkkMMMMMMk......",
    "...kMMkkMMMMMMMMMMMMMMMMMkWkk...",
    "....kMMMMMMMMMLMMMMMMMMMLLLLLk..",
    "....kMMMMMMMMMMMMMMMMMMLLLkkk...",
    "....kDMMMMMMMMMMMMMMMMMLLLk.....",
    "....kDDMMMMMMMMMMMMMMMDLLLk.....",
    "....kDDDDkkkkkkkkkkkkDDMLk......",
    "....kDDkDk.........kDkMMk.......",
    "....kDkkDk.........kDkkMk.......",
    "....kDk.kDk........kDk.kMk......",
    "...kkDk.kDk.......kkDk.kMk......",
    "...kkkk.kkkk......kkkk.kkkk.....",
]

BOAR = [
    "........kk.k.k.k.k..............",
    ".......kAkkAkAkAkAk.............",
    "......kAAAAAAAAAAAAkk...........",
    ".....kMMMMMMMMMMMMMMMk..kk......",
    "....kMMMMMMMMMMMMMMMMMkkMMk.....",
    "...kMMMMMMMMMMMMMMMMMMMMMMMk....",
    "..kMMMMMMMMMMMMMMMMMMMMMEMMMk...",
    "..kMMMMMMMMMMMMMMMMMMMMMMMMMMk..",
    ".kkMMMMMMMMMMMMMMMMMMMMMMMMLLLk.",
    "kMkMMMMMMMMMMMMMMMMMMMMMMWMLkLk.",
    ".kkDMMMMMMMMMMMMMMMMMMMMMWkLLLk.",
    "..kDDMMMMMMMMMMMMMMMMMMMMMkkkk..",
    "..kDDDMMMMMMMMMMMMMMMMMMDk......",
    "...kDDDDDDDDDDDDDDDDDDDDk.......",
    "....kDkDk.........kDkDk.........",
    "....kDkDk.........kDkDk.........",
    "...kkkkkk........kkkkkk.........",
]

CROW = [
    "..........kkk.........",
    ".........kMMMk........",
    "........kMMMMMk.......",
    "........kMMEMMMkk.....",
    "........kMMMMMMAAAk...",
    "........kMMMMMkkAAAAk.",
    ".......kMMMMMMk.kkkk..",
    "......kMMMMMMMMk......",
    "....kkMLLMMMMMMk......",
    "..kkMMLLLLMMMMMk......",
    ".kMMMMLLLLLMMMMk......",
    "kMMMMMMLLLMMMMk.......",
    ".kkkDDDDMMMMMk........",
    "....kkDDDDDDk.........",
    "......kkAkAkk.........",
    ".......kA.kA..........",
    "......kAAkAAk.........",
]

CROW_WING_UP = [
    "..kk......kkk.........",
    ".kMMk....kMMMk........",
    ".kMMMk..kMMMMMk.......",
    "..kMMMk.kMMEMMMkk.....",
    "..kMLMMkkMMMMMMAAAk...",
    "...kMLLMMMMMMMkkAAAAk.",
    "...kMMLLMMMMMk.kkkk...",
    "....kMMLLMMMMMk.......",
    ".....kMMMMMMMMk.......",
    "......kMMMMMMMk.......",
    "......kMMMMMMMk.......",
    ".....kDMMMMMMk........",
    "....kDDDMMMMk.........",
    "....kkDDDDDk..........",
    "......kkAkAkk.........",
    ".......kA.kA..........",
    "......kAAkAAk.........",
]

SHIELD = [
    ".kkkkkkk.",
    "kMMMMMMMk",
    "kMLLALLMk",
    "kMLLALLMk",
    "kMAAAAAMk",
    "kMLLALLMk",
    "kMLLALLMk",
    ".kMLALMk.",
    "..kMMMk..",
    "...kkk...",
]

CROWN = [
    "k.k.k.k",
    "kAkAkAk",
    "kAAEAAk",
    "kkkkkkk",
]

PALETTES = {
    "wolf": {"D": "#4a505a", "M": "#7f8792", "L": "#c8ccd0", "E": "#f3c64a", "W": "#f6f2e6", "A": "#7f8792"},
    "bog_wolf": {"D": "#34402a", "M": "#5b6e43", "L": "#93a86a", "E": "#c8f56a", "W": "#e6e8c8", "A": "#7f9e4a"},
    "iron_hound": {"D": "#4a3a30", "M": "#7a6250", "L": "#a8907a", "E": "#ff8a4c", "W": "#f2efe6", "A": "#b0884a"},
    "cinder_hound": {"D": "#1c1818", "M": "#3a3434", "L": "#6a5a52", "E": "#ffe06a", "W": "#ffcf8a", "A": "#ff6a2a"},
    "boar": {"D": "#4a3020", "M": "#7a5236", "L": "#c49a74", "E": "#ff5a3a", "W": "#f4ecd6", "A": "#2e1e14"},
    "crow": {"D": "#1a1b24", "M": "#2f3242", "L": "#4e5f86", "E": "#b8f06a", "W": "#ffffff", "A": "#d0a040"},
    "shield_steel": {"M": "#9aa6b5", "L": "#3a5aa8", "A": "#d6b44a"},
    "shield_rust": {"M": "#8a7a68", "L": "#6a4a3a", "A": "#b08a4a"},
    "shield_gold": {"M": "#d6b44a", "L": "#6a2f8a", "A": "#f4e7a0"},
    "shield_purple": {"M": "#a99ad6", "L": "#3d3566", "A": "#d5b8ff"},
    "crown": {"A": "#e2b855", "E": "#e04060"},
}


def hex_rgba(value):
    value = value.lstrip("#")
    return tuple(int(value[i:i + 2], 16) for i in (0, 2, 4)) + (255,)


def draw(rows, palette):
    """ASCII-Raster -> RGBA-Bild."""
    height = len(rows)
    width = max(len(r) for r in rows)
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    px = img.load()
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch == ".":
                continue
            px[x, y] = OUTLINE if ch == "k" else hex_rgba(palette[ch])
    return img


def shift_rows(rows, top_rows, dy):
    """Oberkörper um dy Pixel senken (Atmen): Zeilen 0..top_rows-1 nach unten schieben."""
    if dy == 0:
        return rows
    width = len(rows[0])
    upper = rows[:top_rows]
    lower = rows[top_rows:]
    return ["." * width] * dy + upper[:len(upper)] + lower[dy:]


def idle_frames(rows, palette, body_rows):
    """4 Ruhe-Frames: normal, eingeatmet (1 px tiefer), normal, eingeatmet."""
    a = draw(rows, palette)
    b = draw(shift_rows(rows, body_rows, 1), palette)
    return [a, b, a, b]
