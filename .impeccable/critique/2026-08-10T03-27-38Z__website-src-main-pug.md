---
target: website/src/main.pug
total_score: 23
max_score: 36
na_heuristics: 10
p0_count: 1
p1_count: 2
timestamp: 2026-08-10T03-27-38Z
slug: website-src-main-pug
---
Method: dual-agent (A: a7fc6f27ee1773be4 · B: a78be5351930c2bfa) — first A attempt died on an API stream timeout and was relaunched fresh; isolation preserved.

# Design Critique #5 — vitorx86.dev main page (`website/src/main.pug`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Robot placeholder lifecycle "exemplary"; no aria-current anywhere; dead-host clicks end on raw DNS pages |
| 2 | Match System / Real World | 3 | Terminal idiom authentic for devs, opaque to non-technical HR |
| 3 | User Control and Freedom | 3 | Carousel loops with swipe/keys/buttons; everything opens target=_blank — even the same-site resume PDF, four times |
| 4 | Consistency and Standards | 2 | Portfolio eyebrow uses the dark-panel colorway on the light page (recent owner restyle — teal-400 + white ~$ on snow); ./portfolio vs #portfolio; ./social vs ./linkedin |
| 5 | Error Prevention | 1 | 11 dead-host link instances (the noscript nav added two) with zero guarding — deferred item |
| 6 | Recognition Rather Than Recall | 3 | Dot-nav dots unlabeled for sighted users |
| 7 | Flexibility and Efficiency | 3 | Skip link, dot-nav, arrow keys with modifier guard, swipe |
| 8 | Aesthetic and Minimalist Design | 3 | Three ambient systems + orbit cubes + two pulsing cursors is heavy ornament, however well gated |
| 9 | Error Recovery | 2 | CDN/JS failure paths now "best-in-class"; dead subdomains remain unrecoverable in-site |
| 10 | Help and Documentation | n/a | Single-scroll portfolio |
| **Total** | | **23/36 (64%)** | **First dip in the trend — driven by the eyebrow regression (H4) offset by improved failure handling (H9 1→2)** |

## Design Specificity Verdict

"Genuinely bespoke and disciplined — a real design system executed with rare code-level rigor… Not template output." Weakest spots: one colorway slip, backdrop-dependent glass contrast, and links that betray principle #1.

**Deterministic scan:** 52 findings, same stable profile; zero gray-on-color findings survive source verification; net genuine signal ≈3 caveated items (robot matcaps, watermark kanji sizes, an 11-em-dash advisory) plus the systemic "Tailwind default scale vs DESIGN.md ramp" question. Detector's em-dash count of 15 decomposed exactly: 11 real + 4 CLI flags.

**Visual overlays:** unavailable — CLI-only evidence.

## Fixed During Synthesis

Two aria gaps from earlier passes: the pulsing ▌ cursor spans in the hero and contacts headlines are now aria-hidden (screen readers were reading the glyph), and the hero CTA's chevron svg got the aria-hidden the other CTAs already had.

## What's Working

1. **Failure-state engineering "best-in-class"** — SRI pins, honest placeholder copy for every robot failure branch, two noscript blocks, controls hidden until JS boots, hoverOnlyWhenSupported.
2. **Reduced-motion coverage is total** — CSS + all three JS loops on one query, static robot frame included.
3. **Performance hygiene** — webp ≤80KB, fetchpriority hero, width/height everywhere, dpr cap, visibility-gated rAF ×3, deferred Draco GLB.

## Priority Issues

**[P0] Dead-host links** (deferred; instance count rose to 11 — the new noscript nav mirrors two of them). The nav's ./portfolio still DNS-fails one screen above a working #portfolio; the AI copy still claims "running live right now."

**[P1] Portfolio eyebrow contrast — recent owner restyle.** `p.font-mono.font-bold.text-base.leading-7.text-teal-400` + `span.text-white ~$` on the snow background (portfolio.pug:47-49): the white prefix is invisible and teal-400 computes ≈1.8:1. This is the dark-panel colorway on a light section. Owner edit — reported, not reverted. If the brighter/bolder look is wanted, `text-teal-600 font-bold` with a gray-500 prefix keeps the pop and passes.

**[P1] Glass-card contrast is backdrop-dependent** (repeat). bg-gray-900/60 over bare snow ≈ #70737B → body ≈3.2:1, and the robot placeholder text ≈2.3:1. Legibility depends on a JS-positioned rotated slab. Solid ink or an opaque underlay fixes it unconditionally.

**[P2] No-JS backdrop risk + landmark gaps.** Without JS the 300%-tall planetary slab is never trimmed and may darken light sections below #ai (source-inferred). Dot-nav is a div, not nav[aria-label]; no aria-current; zero section elements.

**[P3] Recruiter SEO/copy nits.** Title/og:title "Vitor Open Dev" undersells for name-search; no JSON-LD Person; PRODUCT.md still names the old resume filename; navbar brand slot still empty.

## Persona Red Flags

**Jordan:** "shitbox" ×3 in the forwardable artifact; ./portfolio DNS-fails her first verification click; "$ ls" means nothing to her. **Casey:** ~600KB three.js + two loaders from two origins on every visit for decoration; strong mitigations acknowledged. **Riley:** now "the best-served persona" — noscript nav, static Subaru, honest robot placeholder; residual: untrimmed slab risk, 7 mystery dots with no active state without JS.

## Minor Observations

The open-source glass card lacks the 45° blueprint grid DESIGN.md mandates for dark panels (doc/code drift); two CDNs for one three.js version doubles the blocked-origin surface, plus the runtime unpkg decoder; robot.glb at 1.3MB is 4× everything else combined (lazy, acceptable); resume opens in a new tab from four places.

## Questions to Consider

1. If the site is the work sample, what does the most-clicked nav item resolving to a DNS error say to the exact person the site exists to convince — and is that cost paid daily while the subdomains wait?
2. Three ambient canvas systems share one page's attention and battery budget — would the robot alone, given all of it, persuade harder than the ensemble?
