---
target: website/src/main.pug
total_score: 24
max_score: 36
na_heuristics: 10
p0_count: 1
p1_count: 1
timestamp: 2026-08-10T02-55-59Z
slug: website-src-main-pug
---
Method: dual-agent (A: a410501ffc4637875 · B: a09fa863693fad77c)

# Design Critique #4 — vitorx86.dev main page (`website/src/main.pug`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Robot panel has no loading state — blank dark void until the 1.3MB GLB arrives |
| 2 | Match System / Real World | 3 | Terminal jargon paired with plain headlines works; still opaque in spots for non-devs |
| 3 | User Control and Freedom | 3 | Dot-nav, looping carousel, swipe + arrows; keydown lacked a modifier guard (fixed during synthesis) |
| 4 | Consistency and Standards | 3 | Near-perfect internally; nav "./portfolio" (external, dead) vs on-page #portfolio, "./social" vs "./linkedin" |
| 5 | Error Prevention | 2 | Dead-host links remain (deferred); no fallback when CDN/JS fails for the robot |
| 6 | Recognition Rather Than Recall | 3 | Dot-nav dots visually unlabeled (aria-label only) |
| 7 | Flexibility and Efficiency | 3 | Real accelerators: skip link, arrow keys, swipe, dot-nav — unusual for a portfolio |
| 8 | Aesthetic and Minimalist Design | 3 | Three ambient systems compete in the hero→AI stretch; atom canvas floats z-20 over content |
| 9 | Error Recovery | 1 | Dead subdomains land on raw DNS errors (deferred) |
| 10 | Help and Documentation | n/a | # comment captions do the contextual-hint job |
| **Total** | | **24/36 (67%)** | **Top of Acceptable, knocking on Good — verified arithmetic (3+3+3+3+2+3+3+3+1=24)** |

## Design Specificity Verdict

**LLM assessment:** "Genuinely bespoke — top decile of personal sites for design-system discipline… The site's weaknesses are trust seams and failure-state gaps, not genericism." The reviewer independently verified DESIGN.md's named rules audit clean against the code, and called the SMIL reduced-motion handling "a genuinely expert touch."

**Deterministic scan:** 52 findings; 24 verified pure artifacts (minified-pairing, Tailwind internals, one misattribution), 27 compiler reflections of genuine class usage, leaving ~4 distinct authored decisions (robot matcaps, the kanji watermark sizes, terminal-copy em-dashes). Same stable profile as rounds 1–3.

**Visual overlays:** unavailable — CLI-only evidence.

## Fixed During Synthesis

Two defects in this session's carousel work, caught by Assessment A and repaired immediately: (1) the arrow-key handler now ignores modified keys, so Alt+Left (browser back) no longer also steps the carousel; (2) the viewport preload now warms both neighbors, so the first *prev* click/swipe on a slow connection swaps instantly instead of showing a blank stage.

## What's Working

1. **A design system that is actually obeyed** — the named rules audit clean; guest accents never leak; every interactive object floats and lifts at ~200ms.
2. **Engineering craft as visible evidence** — SRI pins, observer-lazy Draco GLB, reduced-motion across all four animation systems including SMIL, noscript fallback, authored focus-visible, skip link, passive touch listeners.
3. **Delight mapped to skills** — the IK robot, the cross-canvas atom-light coupling, real car photos: range proven, not decorated.

## Priority Issues

**[P0] Copy still claims a dead demo is "running live right now."** The subdomain is deferred, but PRODUCT.md's own principle says the *copy softening* is not — "Never claim what isn't live." Future-tense the line and the "# live demo" caption, or point the slab at the generator's repo until DNS exists.

**[P1] Nav "./portfolio" dead-ends past a live Portfolio section.** The most recruiter-shaped word in the nav 404s while #portfolio sits one scroll below — PRODUCT.md's open decision, still open.

**[P2] Glass-card contrast is a computed risk.** The open-source card is bg-gray-900/60; where only snow sits behind it, gray-300 body text computes to ≈3.2:1. Contrast currently depends on a JS-positioned decorative slab. Raise to /80+ or solid ink — needs a browser check.

**[P2] Navigation semantics.** Both navs unlabeled; dot-nav isn't a nav landmark and the active dot lacks aria-current; the mobile button's accessible name is "$ ls"; the navbar's `$ ls ./links` header is gray-500 (its contacts twin is gray-400 — inconsistent); the brand slot is still an empty div while logo.svg sits unused.

**[P2] Robot panel has no loading/failure state.** Corporate networks that block cdnjs/unpkg get a permanent blank half of the flagship panel. A static render as placeholder would double as the noscript fallback.

**[P3] Copy nits:** "Building it was really amazing"; title/og:title "Vitor Open Dev"; the NFS Peugeot slide inverts the name/nick convention; og:image is webp — LinkedIn's scraper (the one that matters here) historically mishandles it.

## Persona Red Flags

**Jordan:** resume in 1 click (excellent); nav "./portfolio" → DNS error remains the worst first click; LinkedIn-only contact costs least with this persona. **Casey:** webp everywhere and passive listeners win; the GLB is ~30s on 3G with a blank void; the constellation framebuffer allocates tens of MB of GPU memory on cheap phones. **Riley:** keyboard-only run "genuinely clean"; JS-off mobile still has zero navigation; CDN-blocked degrades silently but safely.

## Minor Observations

Doc drift (report only): DESIGN.md says dots are gray-400 — build uses gray-500 (better; update the spec); spec says tag chips are teal-400 — portfolio uses teal-300; PRODUCT.md still names the resume curriculo-en.pdf. Carousel connectors and CTA lifts are the last ~5% not covered by reduced-motion. background.js churns 50 cells/second even scrolled far away (gated on tab visibility, not viewport). The atom's rest position hard-couples to #open-source-title's geometry.

## Questions to Consider

1. The robot survived a technical screen better than anything else on the page — why is it still anonymous while lesser artifacts get ./open_repo.sh?
2. If a recruiter gets exactly one click of goodwill, which click is the site optimizing — the one that 404s?
3. Would the hero read as more engineered if the atom were the only ambient performer until the robot takes over?
