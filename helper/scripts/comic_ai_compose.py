#!/usr/bin/env python3
# dcomix step 1/2: compose the 4K comic atlas from nanobanana marker swatches
# (helper/textures/comic_*.png, styled after style_reference.jpeg) + the 4K
# UV-space bakes. Stylized-shading best practices instead of photoreal AO:
#   - flat marker fills from the AI swatches (mirror-tiled, seam-free)
#   - POSTERIZED AO: two flat cel-shadow bands with noise-wobbled thresholds
#     (a drawing has tone steps, not gradients)
#   - hand-drawn dashed hatching inside the shadow bands (the ref's scribble
#     shading), plus white scratch highlights on the black hardware
#   - bold ink lines along every sharp feature edge (thick like the ref)
#   - island-color bleed into the background so 4K mips never ring dark
# Run with system python3 (needs Pillow + numpy).
import json
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = "/home/vitor/workspace/personal/nobuffer-site"
S = 4096
random.seed(7)
rng = np.random.default_rng(7)

ao = np.asarray(Image.open(f"{ROOT}/helper/renders/comic_ao_4k.png").convert("L"),
                dtype=np.float32) / 255.0
idm = np.asarray(Image.open(f"{ROOT}/helper/renders/comic_id_4k.png").convert("RGB"),
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
light = masks["pla_yellow"] | masks["aluminum"] | masks["steel"]
dark = masks["hw_black"] | masks["motor_stack"]


def mirror_tile(path):
    """1024 swatch -> 4096 canvas via 4x4 mirror repeat (continuous seams)."""
    tile = np.asarray(Image.open(path).convert("RGB").resize((1024, 1024)),
                      dtype=np.float32) / 255.0
    row = np.concatenate([tile, tile[:, ::-1], tile, tile[:, ::-1]], axis=1)
    return np.concatenate([row, row[::-1], row, row[::-1]], axis=0)


def leveled(canvas, target, soften=0.0):
    """Scale per-channel means to the marker color; soften pulls the strokes
    toward the flat fill (tames the AI hatching's contrast against moire)."""
    mean = canvas.reshape(-1, 3).mean(axis=0)
    out = canvas * (np.asarray(target, np.float32) / np.maximum(mean, 1e-4))
    if soften:
        out = out * (1 - soften) + np.asarray(target, np.float32) * soften
    return np.clip(out, 0, 1)


white = mirror_tile(f"{ROOT}/helper/textures/comic_white.png")
black = mirror_tile(f"{ROOT}/helper/textures/comic_black.png")
gray = mirror_tile(f"{ROOT}/helper/textures/comic_gray.png")

# body stays the comic white of the previous pass; metals are near-flat
# NEUTRAL grays (QA: the AI hatch read as pale-blue denim at page scale —
# marker texture comes from the big drawn strokes below instead)
fills = {
    "pla_yellow": leveled(white, (0.95, 0.95, 0.94), soften=0.35),
    "aluminum": leveled(gray, (0.85, 0.855, 0.865), soften=0.93),
    "steel": leveled(gray, (0.90, 0.905, 0.91), soften=0.95),
    # charcoal a step above the hull ink (0x14161a) so outlines stay legible
    # between adjacent dark parts instead of fusing into one black mass
    "hw_black": leveled(black, (0.145, 0.15, 0.165)),
    "motor_stack": leveled(black, (0.115, 0.12, 0.13)),
}

img = np.zeros((S, S, 3), dtype=np.float32)
for name, mask in masks.items():
    img[mask] = fills[name][mask]

# --- posterized cel shadow (noise-wobbled thresholds = hand-painted bands) ---
noise = np.asarray(
    Image.fromarray((rng.random((S // 16, S // 16)) * 255).astype(np.uint8))
    .resize((S, S), Image.BILINEAR)
    .filter(ImageFilter.GaussianBlur(5)),
    dtype=np.float32) / 255.0
# gamma lifts the mid-gray plate AO so only genuine crevices fall in a band
ao_n = ao ** 0.6 + (noise - 0.5) * 0.14

band_mid = light & (ao_n < 0.55)
band_deep = light & (ao_n < 0.38)
img[band_mid] *= 0.84
img[band_deep] *= 0.70  # cumulative: deep band lands at ~0.59x (hard cel step)


def hatch_layer(angle_deg, spacing, width, dash, gap, jitter, seed):
    """Hand-drawn dashed hatching as a coverage mask (0..1), 4K-scaled."""
    rnd = random.Random(seed)
    layer = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(layer)
    ang = np.radians(angle_deg)
    ux, uy = np.cos(ang), np.sin(ang)
    nx, ny = -uy, ux
    diag = int(S * 1.5)
    for k in range(-diag, diag, spacing):
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


# QA: dense micro-hatching collapsed into gray noise at page scale. The
# reference draws a HANDFUL of huge marker strokes per panel — so the strokes
# are now part-scale (hundreds of px long, ~12 px wide) and sparse: they land
# on the big body islands and mostly miss the confetti micro-islands, which
# stay clean instead of speckled.
h_big1 = hatch_layer(38, 140, 12, (260, 720), (240, 680), 9, 41)
h_big2 = hatch_layer(-52, 190, 12, (220, 620), (280, 760), 9, 42)
hw_big = hatch_layer(41, 120, 9, (140, 400), (160, 500), 6, 44)

INK = np.array((0.075, 0.078, 0.090), dtype=np.float32)
WHITE_INK = np.array((0.82, 0.84, 0.87), dtype=np.float32)

# near-black marker strokes inside the cel-shadow bands
m1 = band_mid & (h_big1 > 0.4)
m2 = band_deep & ((h_big1 > 0.4) | (h_big2 > 0.4))
img[m1] = img[m1] * 0.15 + INK * 0.85
img[m2] = img[m2] * 0.10 + INK * 0.90
# bold white scratch highlights where the black hardware catches light
mh = dark & (ao_n > 0.72) & (hw_big > 0.4)
img[mh] = img[mh] * 0.20 + WHITE_INK * 0.80

# --- bleed island colors outward (mip-safe background) ------------------------
grow = img.copy()
have = known.copy()
for _ in range(16):
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
grow[~have] = img[light].reshape(-1, 3).mean(axis=0)
img = np.where(known[..., None], img, grow)

# --- bold ink outlines along feature edges (the ref's thick contours) ---------
pil = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
d = ImageDraw.Draw(pil)
segments = json.load(open(f"{ROOT}/helper/renders/comic_edges.json"))
DARK_MATS = {"hw_black", "motor_stack"}
n_drawn = 0
for u1, v1, u2, v2, mat in segments:
    x1, y1 = u1 * S, (1 - v1) * S
    x2, y2 = u2 * S, (1 - v2) * S
    # QA: micro-segments from confetti islands rendered as grime specks and
    # needle-fans at the joints — only edges long enough to read as drawn
    # contours get ink, and the long panel lines get the boldest pen
    seg_len = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
    if seg_len < 6.0:
        continue
    jx, jy = random.uniform(-2.0, 2.0), random.uniform(-2.0, 2.0)
    if mat in DARK_MATS:
        d.line([(x1 + jx, y1 + jy), (x2 + jx, y2 + jy)], fill=(150, 155, 163), width=4)
    else:
        w = 10 if seg_len > 60 else 8
        d.line([(x1 + jx, y1 + jy), (x2 + jx, y2 + jy)], fill=(16, 17, 20), width=w)
    n_drawn += 1

out = f"{ROOT}/helper/blender/robot_atlas_comic_ai.png"
pil.save(out)
print("segments drawn:", n_drawn)
print("WROTE", out)
