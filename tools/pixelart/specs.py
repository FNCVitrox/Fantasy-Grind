"""Beschreibung aller Figuren: Form, Kopf, Waffe, Nebenhand, Extras und Farben.

Die Schlüssel entsprechen den Gegnern in scripts/data-world.js und den Klassen/Builds in scripts/data-player.js.
Gezeichnet werden die Figuren in figures.py.
"""

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
