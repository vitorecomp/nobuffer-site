#!/usr/bin/env python3
# AI-material step 1/2: rebuild the UV atlas from nanobanana-generated
# material tiles. The generated swatches (helper/textures/) are mirror-tiled
# across the 2K canvas (mirroring guarantees seam-free repeats), normalized
# to the site's industrial palette, masked by the UV-space material-ID bake,
# multiplied by baked AO, and finished with faint ink lines along feature
# edges so the arm still reads crisply at page size.
# Run with system python3 (needs Pillow + numpy).
import json
import random

import numpy as np
from PIL import Image, ImageDraw

ROOT = "/home/vitor/workspace/personal/nobuffer-site"
S = 2048
AO_STRENGTH = 0.55
random.seed(7)

ao = np.asarray(Image.open(f"{ROOT}/helper/renders/comic_ao.png").convert("L"),
                dtype=np.float32) / 255.0
idm = np.asarray(Image.open(f"{ROOT}/helper/renders/comic_id.png").convert("RGB"),
                 dtype=np.float32) / 255.0

r, g, b = idm[..., 0], idm[..., 1], idm[..., 2]
t = 0.35
masks = {
    "pla_yellow": (r > t) & (g < t) & (b < t),
    "aluminum": (g > t) & (r < t) & (b < t),
    "steel": (b > t) & (r < t) & (g < t),
    "hw_black": (r > t) & (b > t) & (g < t),
    "motor_stack": (g > t) & (b > t) & (r < t),
}
known = np.zeros((S, S), dtype=bool)
for m in masks.values():
    known |= m


def mirror_tile(path):
    """1024 tile -> 2048 canvas via 2x2 mirror repeat (continuous at seams)."""
    tile = np.asarray(Image.open(path).convert("RGB").resize((S // 2, S // 2)),
                      dtype=np.float32) / 255.0
    top = np.concatenate([tile, tile[:, ::-1]], axis=1)
    return np.concatenate([top, top[::-1]], axis=0)


def normalized(canvas, target):
    """Scale per-channel means to the palette color, keep the AI's texture."""
    mean = canvas.reshape(-1, 3).mean(axis=0)
    return np.clip(canvas * (np.asarray(target, np.float32) / np.maximum(mean, 1e-4)), 0, 1)


pla = mirror_tile(f"{ROOT}/helper/textures/tile_pla_yellow_2.png")
blk = mirror_tile(f"{ROOT}/helper/textures/tile_hw_black.png")
met = mirror_tile(f"{ROOT}/helper/textures/tile_metal.png")

# targets echo the matcap palette robot.js was tuned for (warm PLA gold,
# readable charcoal hardware, bright galvanized steel)
fills = {
    "pla_yellow": normalized(pla, (0.92, 0.72, 0.06)),
    "hw_black": normalized(blk, (0.15, 0.16, 0.18)),
    "motor_stack": normalized(blk, (0.11, 0.12, 0.13)),
    "aluminum": normalized(met, (0.88, 0.90, 0.92)),
    "steel": normalized(met, (0.76, 0.78, 0.81)),
}

img = np.zeros((S, S, 3), dtype=np.float32)
for name, mask in masks.items():
    img[mask] = fills[name][mask]

# soft baked AO: crevices darken, open faces keep the material color
factor = (1.0 - AO_STRENGTH) + AO_STRENGTH * ao
img *= factor[..., None]

# bleed island colors into the empty background so mipmaps at page distance
# never blend island borders toward black (plain-numpy dilation, no scipy)
grow = img.copy()
have = known.copy()
for _ in range(24):
    if have.all():
        break
    acc = np.zeros_like(grow)
    cnt = np.zeros((S, S), dtype=np.float32)
    for dy, dx in ((0, 1), (0, -1), (1, 0), (-1, 0)):
        acc += np.roll(grow * have[..., None], (dy, dx), axis=(0, 1))
        cnt += np.roll(have.astype(np.float32), (dy, dx), axis=(0, 1))
    new = ~have & (cnt > 0)
    grow[new] = acc[new] / cnt[new, None]
    have |= new
grow[~have] = img[known].reshape(-1, 3).mean(axis=0)
img = np.where(known[..., None], img, grow)

# --- faint ink along feature edges (kept from the comic pass, much subtler) ---
pil = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
ink_dark = Image.new("L", (S, S), 0)
ink_lite = Image.new("L", (S, S), 0)
dd, dl = ImageDraw.Draw(ink_dark), ImageDraw.Draw(ink_lite)
DARK_MATS = {"hw_black", "motor_stack"}
segments = json.load(open(f"{ROOT}/helper/renders/comic_edges.json"))
n_drawn = 0
for u1, v1, u2, v2, mat in segments:
    x1, y1 = u1 * S, (1 - v1) * S
    x2, y2 = u2 * S, (1 - v2) * S
    if abs(x1 - x2) < 0.5 and abs(y1 - y2) < 0.5:
        continue
    if mat in DARK_MATS:
        dl.line([(x1, y1), (x2, y2)], fill=255, width=1)
    else:
        dd.line([(x1, y1), (x2, y2)], fill=255, width=2)
    n_drawn += 1

arr = np.asarray(pil, dtype=np.float32) / 255.0
a_dark = (np.asarray(ink_dark, np.float32) / 255.0 * 0.45)[..., None]
a_lite = (np.asarray(ink_lite, np.float32) / 255.0 * 0.30)[..., None]
arr = arr * (1 - a_dark) + np.array((0.16, 0.13, 0.04), np.float32) * a_dark
arr = arr * (1 - a_lite) + np.array((0.55, 0.57, 0.61), np.float32) * a_lite

out = f"{ROOT}/helper/blender/robot_atlas_ai.png"
Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8)).save(out)
print("segments drawn:", n_drawn)
print("WROTE", out)
