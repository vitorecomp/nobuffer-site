# helper — robot model tooling

Tooling and assets behind `website/src/assets/models/robot.glb` (the AR2/AR3
arm on the site). See `ATTRIBUTION.md` at the repo root for mesh provenance.

## blender/

- `robot_textured.blend` — **texture-paint master**. Open it, enter Texture
  Paint mode, paint on the model (writes into the `robot_atlas` image), then
  `File > Export > glTF Binary` over `website/src/assets/models/robot.glb`
  and rebuild the site.
- `robot_atlas.png` — the baked 2048px atlas (base color x ambient
  occlusion) embedded in robot.glb.
- `robot_beauty.blend` / `robot_id.blend` — the original painting/verification
  scenes from the STL era (photo-matched materials / one flat color per
  solid body).

## scripts/  (run with: `blender --background --python <script>`)

- `bake_texture.py` — atlas pipeline: imports robot.glb, welds the
  flat-shaded vertices back together, Smart-UV-unwraps everything into one
  atlas, bakes base color + AO with Cycles, embeds the atlas and re-exports
  robot.glb. Also refreshes `blender/robot_textured.blend` and
  `blender/robot_atlas.png`.
- `comic_dump.py` / `comic_compose.py` / `comic_apply.py` — the hand-inked
  comic restyle, in three steps: (1) Blender bakes AO + material-ID masks in
  the existing UV layout and dumps every sharp feature edge as UV segments;
  (2) system python (Pillow) composes the atlas — white body, light metals,
  black hardware, ink lines along the dumped edges, AO-driven marker
  hatching (black on light parts, white on dark); (3) Blender puts the atlas
  into robot.glb, zeroes metallic and re-exports. Style knobs (colors, hatch
  spacing/angles, AO thresholds, ink widths) live in `comic_compose.py` —
  rerun steps 2+3 to iterate; the result is `blender/robot_atlas_comic.png`
  and `blender/robot_comic.blend`.
- `paint_robot.py` — STL-era generator: assembled the arm from the ar3_core
  STLs, split every solid body by triangle ranges, painted it to match the
  reference photo, rendered turntables/close-ups, and exported the first
  robot.glb. NOTE: needs the original STLs, which were removed from
  `website/src/assets/models/` — recover them from git history to rerun.
- `highpoly.py` — low-poly CAD -> high-poly: welds the flat-shading splits,
  rebuilds quads from the triangulation, creases every sharp feature edge
  (>32 deg), applies crease-preserving Catmull-Clark subdivision (curves round
  out, mechanical edges stay crisp), then dissolves the pointless subdivision
  back out of flat regions (UV-seam aware). Smooth shading with sharp-edge
  normal splits; UVs/texture carry through. Saves `blender/robot_highpoly.blend`.
- `inspect_components.py` / `inspect_exact.py` — connected-component analysis
  of the STLs (welded / exact vertex matching); produced `data/components*.json`.
- `verify_glb_render.py` — round-trip check from the per-link-GLB era
  (imports `<link>.glb` files that no longer exist; kept for reference).

## data/

- `components.json` / `components_exact.json` — per-STL solid-body inventory:
  triangle ranges, bounding boxes, centers. This is how motors, gearboxes,
  couplers, brackets and pulleys were identified and painted.

## renders/  (gitignored — regenerable diagnostics)

Turntable/close-up renders from the paint iterations, GLB round-trip checks,
and headless-Chromium screenshots of the site (`renders/site/`).

## Gotcha: Blender vs mise Python

Blender resolves its Python stdlib via the first `python3` on PATH; the
mise-managed Python breaks it (`No module named 'math'`). The wrapper
`~/.local/bin/blender` pins `/usr/bin` first — always invoke `blender` by
bare name so the wrapper applies.
