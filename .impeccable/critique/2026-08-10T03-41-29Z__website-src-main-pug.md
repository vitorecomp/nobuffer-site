---
target: website/src/main.pug
total_score: 25
max_score: 36
na_heuristics: 10
p0_count: 1
p1_count: 2
timestamp: 2026-08-10T03-41-29Z
slug: website-src-main-pug
---
Method: dual-agent (A: a60fb3448441b0660 · B: a52b85ee709717886)

# Design Critique #6 — vitorx86.dev main page (`website/src/main.pug`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Robot placeholder states "exemplary"; dead links give zero warning before the DNS page |
| 2 | Match System / Real World | 3 | Terminal grammar rescued by plain-English headings |
| 3 | User Control and Freedom | 3 | Everything opens target=_blank (34 instances), even the resume PDF |
| 4 | Consistency and Standards | 3 | ./portfolio vs #portfolio; aria-current + menu-header gray fixed during synthesis |
| 5 | Error Prevention | 1 | Five UI paths into non-resolving hosts (deferred) |
| 6 | Recognition Rather Than Recall | 3 | Dots carry aria-labels only — no visible tooltip |
| 7 | Flexibility and Efficiency | 3 | Dot-nav, skip link, arrows, swipe; phones have no section nav at all |
| 8 | Aesthetic and Minimalist Design | **4** | "Genuinely excellent system: one font, named rules actually followed, guest accents never leak" |
| 9 | Error Recovery | 2 | Robot failure copy is "a model answer"; dead links unrecoverable |
| 10 | Help and Documentation | n/a | # captions do the job |
| **Total** | | **25/36 (69%)** | **New high; first 4 awarded. Verified: 3+3+3+3+1+3+3+4+2=25** |

## Design Specificity Verdict

"A genuinely designed site, not a themed template… The craft floor is high; the ceiling is held down by one product-level breach — dead links — not by visual design." Riley (JS-off/CDN-blocked) called "the best-served persona I've seen at this size."

**Deterministic scan:** 52 findings → ~46 artifacts (stable minified-pairing + Tailwind-codegen profile), ~6 genuine-with-caveat (kanji watermark sizes, robot matcaps, accent classes vs palette scope, em-dash count inflated by CLI flags).

**Visual overlays:** unavailable — CLI-only evidence.

## Fixed During Synthesis

Two objective slips from earlier passes: the navbar mobile menu's `$ ls ./links` header was still gray-500 on gray-900 (3.7:1) while its contacts twin had been fixed — now gray-400; and the dot-nav's active-state attribute is now `aria-current="location"` (the ARIA-correct value for nav position) instead of `"true"`.

## What's Working

1. **Resilience engineering as brand proof** — noscript nav + static slide, in-voice failure copy, SRI pins, hoverOnlyWhenSupported, authored focus-visible, safe-area padding.
2. **A design system that survived implementation** — DESIGN.md's named rules verifiably true in code.
3. **Personality with receipts** — every hobby section terminates in a real repo link.

## Priority Issues

**[P0] Dead links + the "running live right now" claim** (deferred). The copy fix remains independent of DNS.

**[P1] No-JS background sizing.** #planetary-background and the atom container carry conflicting h-full + h-[300%] classes and rely on background.js to clamp their height; without JS the 50%-black rotated slab may tint light sections. Fix: a sane CSS default (or hidden-until-JS).

**[P1] Phones have no section navigation.** Dot-nav is sm:block (the adapt trade-off's cost); the mobile menu lists only external links — reaching #contacts takes ~7 viewports of scrolling. Fix: add an in-page ./contacts entry to the mobile menu.

**[P3] Head/meta.** Title wastes the SERP slot; no twitter:image; navbar brand slot still an empty div while logo.svg sits unused.

## Persona Notes

**Jordan:** ./download_resume.sh opens rather than downloads (label mismatch); contact rail is LinkedIn-only by choice. **Casey:** ~700KB of deferred three.js from two CDNs for below-fold decoration; images/lazy-loading otherwise strong. **Riley:** best-served persona; residual: dead $ ls button with JS off, dots never highlight without JS, the P1 slab risk.

## Minor Observations

Stray dev comment in open-source.pug:1; carousel counter labels look clickable but aren't; the arrow-key listener never unbinds (harmless today, a trap later); window.__atomLight as an undocumented cross-script bus; atom canvas z-20 above content deserves a real-browser check.

## Questions to Consider

1. Would you hand a hiring manager a resume containing three links you know 404? If not, why is the shipped homepage different?
2. The robot's self-calibrating IK is the deepest engineering on the page and it's presented as anonymous decoration — why does the best work sample on a "site as work sample" have no repo link or "I built this" line?
