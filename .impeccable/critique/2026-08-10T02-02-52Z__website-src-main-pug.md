---
target: website/src/main.pug
total_score: 21
max_score: 36
na_heuristics: 10
p0_count: 1
p1_count: 2
timestamp: 2026-08-10T02-02-52Z
slug: website-src-main-pug
---
Method: dual-agent (A: af541eb4ef41b9554 · B: ae8d1d4981178462e)

# Design Critique #3 — vitorx86.dev main page (`website/src/main.pug`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Dot-nav + carousel counter good; robot/atom panels are silent blank space until CDN three.js + 1.3MB GLB arrive — no placeholder |
| 2 | Match System / Real World | 3 | Shell grammar authentic; navbar `./social` vs footer `./linkedin` names the same destination two ways |
| 3 | User Control and Freedom | 2 | Carousel forward-only (no prev/swipe/keyboard); navbar not sticky, and dot-nav has no `#contacts` entry — after first scroll the contact moment has no route |
| 4 | Consistency and Standards | 3 | Strong system; drift: `//` comments in carousel vs `#` elsewhere; white/scale-hover next-button vs green/lift rule; `shadow-xl` on dark panels vs the Floating Terminal Rule |
| 5 | Error Prevention | 1 | 8 of 30 external links target dead hosts (recorded owner decision) |
| 6 | Recognition Rather Than Recall | 2 | Navbar "./portfolio" (external, dead) vs on-page "Portfolio" section; Alissa forward-referenced twice before her introduction |
| 7 | Flexibility and Efficiency | 3 | Dot-nav is a real accelerator; no skip link, no contacts dot |
| 8 | Aesthetic and Minimalist Design | 3 | Disciplined; AI section stacks six devices; z-20 atom canvas floats above content across two sections |
| 9 | Error Recovery | 1 | Dead subdomains land on raw DNS errors (deferred); noscript fallback exists for carousel only |
| 10 | Help and Documentation | n/a | Single-page portfolio; `# comment` captions are the right micro-help |
| **Total** | | **21/36 (58%)** | **Acceptable band, trending up — arithmetic verified (3+3+2+3+1+2+3+3+1=21)** |

## Design Specificity Verdict

**LLM assessment:** "Genuinely bespoke — top decile for a personal site." The terminal grammar is load-bearing information architecture, not decoration; the reviewer independently identified the reduced-motion coverage across all four animation systems as "genuinely uncommon" and the robot as Product Principle #4 made literal. Losses are finish, not distinctiveness.

**Deterministic scan:** 53 findings, 28 triaged as artifacts (same minified-pairing and Tailwind-generated-utility profile as before — verified case by case, e.g. every "gray-on-color" pairs a text-free decorative element with unrelated text on the same minified line). Genuine, all caveated as decorative/non-UI: the 9rem/13rem watermark kanji, traffic-light dot colors, three blue AI-accent values, indigo chips (detector misattributes them to a heading), robot matcap hexes, and ~11 genuine em-dashes (detector counted 16; 4 were CLI flags like `--grep=ai`).

**Visual overlays:** unavailable — no browser automation; CLI-only evidence.

## Overall Impression

Third round, still climbing: 47% → 56% → 58%. The heavy lifting (performance, standards mode, reduced-motion, contrast, share card, attribution) has moved the site from "broken plumbing under good design" to "good site with a short finish list." What's left splits cleanly: the deferred owner decisions (dead links, no email) that cap H5/H9 at 1, and a final ring of interaction affordances — routing to the contact moment, carousel reversibility, document landmarks.

## What's Working

1. **The eyebrow lockup as system, not gimmick** — 7/7 sections, thematically correct shell, brand recognition and wayfinding at once.
2. **Engineering-as-evidence** — URDF kinematics, self-calibrating IK, observer-gated Draco GLB, SRI-pinned scripts; the code a recruiter-engineer reads *is* the resume.
3. **Motion discipline rare at this ambition level** — all four animation systems gate on visibility + tab state + reduced-motion, with CSS covering the SMIL cubes and cursors.

## Priority Issues

**[P0] Dead-link load on the recruiter path** (recorded owner decision, deferred). 8 of 30 external links; navbar slot #2 and the contact panel both mined; the "running live right now" claim still points at NXDOMAIN. The ~20-line interim softening remains available whenever wanted.

**[P1] The contact moment has no primary action and no route to it.** `#contacts` is reachable only by full-page scroll: non-sticky navbar has no contact link, and the dot-nav's six dots skip contacts entirely. Inside the panel, five identical links with none marked primary. Fix: add a `#contacts` dot; add a primary `$ ./connect_linkedin.sh` CTA above the grid.
Suggested command: /impeccable polish

**[P1 — CONFIRMED AND FIXED DURING SYNTHESIS] `$` prefix contrast on dark CTAs.** The prior round's fix silently missed 6 of 8 files — a shell-quoting bug made the file-selection grep treat `$` as an end-anchor, so only files also containing `./` prefixes were patched. Assessment A caught the residue (gray-500 on gray-900 = 3.67:1). All 8 prefixes now gray-400 (~7:1); build verified.

**[P2] Carousel is a one-way street and off-system.** No prev/swipe/keyboard (to re-see car 1 from car 2, cycle through 3); the next button is white-on-ink with `hover:scale-105`, breaking both the Prompt Rule (executables are green) and the Floating Terminal Rule (lift, not scale); slide copy uses `//` where the site speaks `#`.
Suggested command: /impeccable polish

**[P2] Landmark/structure gaps.** No `<main>`, no skip link, sections are bare `div#id`; on mobile the open-source section stacks the 28rem robot canvas *before* its heading, contradicting DESIGN.md's own text-first rule (ai-companion does it correctly with `lg:order-*`).
Suggested command: /impeccable polish

**[P3] Head/copy finish.** `<title>Vitor Open Dev</title>` and og:title undersell next to otherwise sharp copy; no canonical link; "Building it was really amazing" is filler; Google Fonts still loads via `@import` (a discovery hop the preconnects only partly hide).
Suggested command: /impeccable clarify

## Persona Red Flags

**Jordan:** strong landing (works, resume downloads at 124KB), then navbar `./portfolio` → DNS error; wants email at the end, finds none (deliberate); `./blog` in the contact panel is a second DNS error. Nothing above the fold states role/seniority beyond "Google developer."

**Casey:** hero fast; hard-coded 400px blob + 480px orbit likely clips on 360px viewports (source-inferred, browser-check worthy); robot panel blank on 3G with only its attribution caption visible; swipe — the first gesture tried — does nothing on the carousel.

**Riley:** noscript carousel works; JS-off mobile nav dead; authored focus ring present; 28px dot targets pass WCAG 2.5.8 minimum; all rAF loops stop on tab-away; DRACO decoder fetched at runtime without SRI (loader-internal fetch — SRI not applicable there); r128 is a 5-year-old pin across two CDNs.

## Minor Observations

The teal band splice across backyard-mech → ai-companion is clever but geometry-fragile; the 生成 watermark has no font/lang control (aria-hidden, and JetBrains Mono has no CJK glyphs — system font renders it); DESIGN.md's Floating Terminal Rule and Shadow Vocabulary still contradict each other while the code follows the vocabulary; dead commented copyright line in main.pug; `#open-source-title` id sits on a paragraph, and the atom's rest position depends on it — the id lies and a future refactor will move the atom; Twitter card lacks its own image/title (falls back to OG, acceptable).

## Questions to Consider

1. Who is the shell grammar really for — is the honest position that the site charms engineers who *refer* Vitor, with recruiters as the cover story? If Jordan is truly first, a role/title line in the hero costs nothing.
2. The site's best proof of skill is invisible when it matters most (slow mobile, JS-off, CDN hiccup) — and no copy says "I built this arm simulation." Why does the strongest artifact ship with zero self-attribution and zero fallback narrative?
3. Six sections, zero numbers. "86 repos" lives in PRODUCT.md but never on the page. Would one line of verifiable stats under the hero do more persuading than the entire AI banner?
