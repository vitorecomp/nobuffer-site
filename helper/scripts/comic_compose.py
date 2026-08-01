#!/usr/bin/env python3
# Comic-style step 2/3: compose the hand-inked atlas from the dumped masks.
#   base flats (white body / light metals / black hardware)
#   + AO-driven marker hatching (black on light parts, white on dark parts)
#   + ink lines along every sharp feature edge.
# Run with system python3 (needs Pillow + numpy).
import json
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = "/home/vitor/workspace/personal/nobuffer-site"
S = 2048
random.seed(7)
rng = np.random.default_rng(7)

ao = np.asarray(Image.open(f"{ROOT}/helper/renders/comic_ao.png").convert("L"),
                dtype=np.float32) / 255.0
idm = np.asarray(Image.open(f"{ROOT}/helper/renders/comic_id.png").convert("RGB"),
                 dtype=np.float32) / 255.0

r, g, b = idm[..., 0], idm[..., 1], idm[..., 2]
t = 0.35
m_pla = (r > t) & (g < t) & (b < t)
m_alu = (g > t) & (r < t) & (b < t)
m_steel = (b > t) & (r < t) & (g < t)
m_black = (r > t) & (b > t) & (g < t)
m_stack = (g > t) & (b > t) & (r < t)
m_none = ~(m_pla | m_alu | m_steel | m_black | m_stack)
light = m_pla | m_alu | m_steel
dark = m_black | m_stack

img = np.zeros((S, S, 3), dtype=np.float32)
img[m_pla] = (0.957, 0.957, 0.949)   # white body (was yellow)
img[m_alu] = (0.886, 0.906, 0.918)   # light gray metal
img[m_steel] = (0.929, 0.937, 0.945)
img[dark] = (0.090, 0.094, 0.110)    # inked black hardware
img[m_none] = (0.925, 0.925, 0.925)


def hatch_layer(angle_deg, spacing, width, dash, gap, jitter, seed):
    """Hand-drawn dashed hatching as a coverage mask (0..1)."""
    rnd = random.Random(seed)
    layer = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(layer)
    ang = np.radians(angle_deg)
    ux, uy = np.cos(ang), np.sin(ang)
    nx, ny = -uy, ux
    diag = int(S * 1.5)
    for k in range(-diag, diag, spacing):
        # walk along the stroke direction laying dashes
        pos = -diag + rnd.uniform(0, dash[1])
        while pos < diag:
            ln = rnd.uniform(*dash)
            j1 = rnd.uniform(-jitter, jitter)
            j2 = rnd.uniform(-jitter, jitter)
            cx, cy = S / 2 + nx * k, S / 2 + ny * k
            x1, y1 = cx + ux * pos + nx * j1, cy + uy * pos + ny * j1
            x2, y2 = cx + ux * (pos + ln) + nx * j2, cy + uy * (pos + ln) + ny * j2
            d.line([(x1, y1), (x2, y2)], fill=255, width=width)
            pos += ln + rnd.uniform(*gap)
    return np.asarray(layer, dtype=np.float32) / 255.0


h1 = hatch_layer(45, 9, 2, (12, 34), (6, 18), 1.6, 11)
h2 = hatch_layer(-47, 12, 2, (10, 26), (7, 20), 1.6, 22)
hw = hatch_layer(41, 14, 2, (16, 44), (8, 22), 1.4, 33)

# organic thresholds: soft noise so hatch boundaries wobble like marker work
noise = np.asarray(
    Image.fromarray((rng.random((S // 8, S // 8)) * 255).astype(np.uint8))
    .resize((S, S), Image.BILINEAR)
    .filter(ImageFilter.GaussianBlur(3)),
    dtype=np.float32) / 255.0
ao_n = ao + (noise - 0.5) * 0.14

INK = np.array((0.075, 0.078, 0.090), dtype=np.float32)
WHITE_INK = np.array((0.82, 0.84, 0.87), dtype=np.float32)

# black marker shading on the white/light parts
mask1 = light & (ao_n < 0.62)
mask2 = light & (ao_n < 0.40)
for mask, layer, op in ((mask1, h1, 0.9), (mask2, h2, 0.95)):
    m = mask & (layer > 0.4)
    img[m] = img[m] * (1 - op) + INK * op
# white highlight strokes on the black parts
mh = dark & (ao_n > 0.74) & (hw > 0.4)
img[mh] = img[mh] * 0.25 + WHITE_INK * 0.75

# --- ink the feature edges ------------------------------------------------------
pil = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
d = ImageDraw.Draw(pil)
segments = json.load(open(f"{ROOT}/helper/renders/comic_edges.json"))
DARK_MATS = {"hw_black", "motor_stack"}
n_drawn = 0
for u1, v1, u2, v2, mat in segments:
    x1, y1 = u1 * S, (1 - v1) * S
    x2, y2 = u2 * S, (1 - v2) * S
    if abs(x1 - x2) < 0.5 and abs(y1 - y2) < 0.5:
        continue
    jx, jy = random.uniform(-0.7, 0.7), random.uniform(-0.7, 0.7)
    if mat in DARK_MATS:
        d.line([(x1 + jx, y1 + jy), (x2 + jx, y2 + jy)], fill=(150, 155, 163), width=2)
    else:
        d.line([(x1 + jx, y1 + jy), (x2 + jx, y2 + jy)], fill=(16, 17, 20), width=3)
    n_drawn += 1

out = f"{ROOT}/helper/blender/robot_atlas_comic.png"
pil.save(out)
print("segments drawn:", n_drawn)
print("WROTE", out)
