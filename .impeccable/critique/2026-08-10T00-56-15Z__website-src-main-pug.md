---
target: website/src/main.pug
total_score: 15
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 2
timestamp: 2026-08-10T00-56-15Z
slug: website-src-main-pug
---
Method: dual-agent (A: aea6a076512564540 · B: abd015ce372eabe58)

# Design Critique — vitorx86.dev main page (`website/src/main.pug`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Dot-nav and carousel counter are good, but zero loading feedback while ~30MB of images/3D populate — empty blob, blank carousel stage, void robot panel |
| 2 | Match System / Real World | 3 | Terminal idiom authentic and consistent; recruiters must decode `./clone_alissa.sh`, untranslated 生成/「キャラクター生成」 |
| 3 | User Control and Freedom | 1 | No `prefers-reduced-motion` anywhere despite 4 perpetual animation systems; carousel is next-only; every link forces a new tab |
| 4 | Consistency and Standards | 2 | Breaks its own DESIGN.md rules (invisible white `~$` on light in portfolio; backyard-mech has no eyebrow lockup; phantom classes `w-15`/`scale-x-200`/`-z-9`); 5 `<h1>`s; markup before `<!DOCTYPE>` → quirks mode |
| 5 | Error Prevention | 1 | Seven links walk users into DNS dead-ends, including primary nav `./portfolio` |
| 6 | Recognition Rather Than Recall | 3 | Consistent `./` grammar and visible labels; `./social` hides that it's LinkedIn — the one link a recruiter hunts for |
| 7 | Flexibility and Efficiency | n/a | Single-purpose scroll page; dot-nav + anchors already are the accelerators |
| 8 | Aesthetic and Minimalist Design | 3 | Disciplined palette/type; 3–4 simultaneous ambient motion layers; AI panel stacks six typographic events in one column |
| 9 | Error Recovery | 0 | Dead subdomains open raw browser DNS errors in new tabs; no fallback possible |
| 10 | Help and Documentation | n/a | Portfolio landing; `# comment` captions are appropriate micro-help |
| **Total** | | **15/32 (47%)** | **Poor band — dragged down almost entirely by dead links (H5, H9) and missing motion/control affordances (H3)** |

## Design Specificity Verdict

**LLM assessment:** Authored, emphatically — not category-interchangeable. The terminal grammar is systemic (eyebrow lockups, `./executable` naming, guest-accent quarantine per section), and the interactive artifacts are real engineering: the AR3 robot with self-calibrating IK chasing the cursor, the two-layer SVG orbit whose cubes pass behind the portrait, the Goldberg-polyhedron atom feeding a shadow light. Two generic pockets: the hero/open-source skeletons are recognizable Tailwind UI sticky-two-column boilerplate, and the contacts footer is a standard link wall in terminal clothes — both rescued by the chrome, not the bones.

**Deterministic scan:** 51 findings on the built output (the detector cannot scan `.pug` — its source pass silently skipped all 15 templates, so built HTML is the authoritative evidence). After triage, most are compiled-output artifacts: all 14 "gray-on-color" warnings pair unrelated elements collapsed onto one minified line; the "Roboto" font and most size/radius/rgba hits are Tailwind's own generated utilities. Genuine signals: authored arbitrary sizes `text-[9rem]`/`text-[13rem]` (the AI kanji watermark and banner sit off the documented type ramp), four authored accent alphas outside the DESIGN.md palette (blue-400/red-500/yellow-500/blue-200 — the traffic lights and promo blues, which the palette simply doesn't list), and 14 em-dashes in body copy. Notably, the real contrast problems (teal-600 eyebrows ≈3.7:1, gray-400 prefixes ≈2.9:1 on snow) were caught by the design review, not the detector.

**Visual overlays:** not available — no browser automation in this session (CLI-only evidence; fallback signal reported by Assessment B).

## Overall Impression

This is a genuinely authored site with a coherent voice from `~$ whoami` to `~$ exit 0`, and its best moments (the robot arm, the terminal grammar) double as proof of skill. But the surface craft outruns the plumbing: seven links point at hosts that don't exist, the page ships ~30MB with render-blocking CDN scripts and a quirks-mode doctype, and the copy stumbles exactly where the personality is being sold. The single biggest opportunity: make everything the site claims *real* — PRODUCT.md Principle 4 says the site is the work sample, and right now DevTools grades it below the design.

## What's Working

1. **A real design system, self-documented and mostly obeyed.** Eyebrow lockups, prompt/action color voices, and guest-accent quarantine execute across all seven sections — one hand, and DESIGN.md's named rules match the code.
2. **The robot is the resume.** `robot.js` (URDF chain, self-calibrating planar IK, IntersectionObserver-gated GLB load) is stronger engineering evidence than any portfolio card — Principle 4 made literal.
3. **Voice consistency from copy to chrome.** `~$ cat ./contacts.txt` → `$ ls ./links` → `~$ exit 0` is a complete narrative arc; the footer echoing the mobile menu is a working-memory bridge most sites never build.

## Priority Issues

**[P0] Seven dead links + a false "running live right now" claim.**
Why: violates Principles 1 and 3 verbatim; the recruiter's most likely click (navbar `./portfolio` → cases.vitorx86.dev) opens a DNS error. Three separate paths lead to the dead demo (AI CTA, slab link, caption). This one defect class converts "meticulous engineer" into "broken site."
Fix: point `./portfolio` at `#portfolio`; remove or "coming soon" the blog links; re-aim the AI CTA at the repo and soften "running live right now" until demo resolves.
Suggested command: /impeccable harden

**[P0] ~30MB payload with render-blocking head.**
Why: 10.3MB hero PNG above the fold, three 4.2MB car PNGs eagerly instantiated at DOMContentLoaded (`carousel.js`), three.js + GLTFLoader render-blocking from two CDNs, markup emitted before `<!DOCTYPE>` forcing quirks mode. Casey on 3G may never reach the fold; an engineer-recruiter with DevTools open watches the work sample fail its own audit.
Fix: WebP/AVIF hero ≤200KB with dimensions; lazy-load carousel slides; defer and self-host the 3D scripts; move head assets after the doctype.
Suggested command: /impeccable optimize

**[P1] Accessibility bundle.**
Why: invisible white `~$` prefix on the snow background in portfolio.pug (copy-paste from a dark-variant lockup); no `prefers-reduced-motion` despite perpetual animation (WCAG 2.3.3); sub-AA contrast on teal-600 eyebrows (≈3.7:1) and gray-400 prefixes (≈2.9:1); five `<h1>`s and no heading outline; 12px dot-nav targets; generic "Profile picture" alt.
Fix: gray-400 prefix in portfolio; a reduced-motion gate stopping the rAF/interval loops and pulses; bump caption grays one step; one `h1`, sections demoted to `h2`; padded dot hit areas; descriptive hero alt.
Suggested command: /impeccable polish

**[P1] Copy defects clustered in the charm sections.**
Why: "Meet Alissa, **a AI** racing companion", "companion **can be used together of** your racing shitbox", "Building it**, was** really amazing", "**Fine tuning Models**" — recruiters read exactly these sentences to gauge communication; the errors sit in the two sections PRODUCT.md calls the differentiators.
Fix: "an AI racing companion", "that rides along with your racing shitbox", "Building it was genuinely fun", "model fine-tuning".
Suggested command: /impeccable clarify

**[P2] The system violates itself in small, visible ways.**
Why: backyard-mech is the only section with no eyebrow lockup, heading, or framing copy (a first-timer sees a giant car and "// nick: subarin" with zero context); phantom Tailwind classes `w-15`/`scale-x-200` collapse the mobile carousel's active connector to 0 width; `-z-9` leaves the planetary slab's stacking to DOM-order luck; the contacts grid is 6 columns holding 5 links.
Fix: add the standard lockup to backyard-mech ("~$ ls /garage"); replace phantom classes with real ones (`w-16`, `scale-x-100`, `-z-10`); balance the contacts grid.
Suggested command: /impeccable layout

## Persona Red Flags

**Jordan (first-timer / HR recruiter):** clicks `./portfolio` → "This site can't be reached" → concludes the site is broken. Doesn't know `./social` is LinkedIn. Lands on backyard-mech: cars with no explanation. Reads "shitbox" before any context earns it. Can't read 「キャラクター生成」.

**Casey (mobile, slow connection):** render-blocking CDN scripts, then a 10.3MB PNG — beige empty blob for tens of seconds on 3G. All three car images download 4 screens early. No width/height on injected imgs → layout shift. 12px dots hug the right edge → mis-taps. Every dead link opens a disorienting new error tab.

**Riley (stress tester):** 2 of 5 nav items dead; three paths to the same dead demo. Carousel can't go backwards; counter labels are inert. Tab order hits 6 dot stops before content; no custom focus-visible styles. With JS off, the cars section renders literally empty. View-source shows quirks-mode doctype and `#sitebackgroung-fotter-grid`.

## Minor Observations

- Typos in public identifiers: `background-fotter.pug`, `#sitebackgroung-fotter-grid`, `#planettary-background` — the repo is itself a work sample.
- Resume saves as `curriculo-en.pdf` — Portuguese filename on the English resume; rename to `vitor-vieira-resume.pdf`.
- No meta description or OG tags; `<title>Vitor Open Dev</title>` — the LinkedIn share card for the exact recruiter flow is blank.
- Navbar has an empty left slot; `logo.svg` exists but identity only arrives at the hero.
- The robot — the strongest artifact on the page — is unlabeled and unlinked; a `# ar3 — open-source robot arm` caption linking the source would explain it and honor Principle 5.
- Constellation canvas runs an unthrottled rAF over a multi-thousand-px framebuffer with no visibility gating (robot.js gates; constellation.js doesn't).
- `#open-source-title.p.mt-6` puts a literal class `p` on a div — was meant to be a `<p>`.
- Em-dash density (14 in body copy) reads AI-flavored to detector heuristics; worth a pass for voice.

## Questions to Consider

1. **If the site is the work sample, what grade does DevTools give it?** Would you ship a 30MB quirks-mode page with phantom classes in a review at work?
2. **Who is the terminal for?** The product says recruiters first; the grammar is written for peers. Would renaming `./social` → `./linkedin` and translating the kanji captions cost the brand anything — or only cost Jordan less?
3. **Why is the strongest engineering on the page anonymous?** The robot outperforms every portfolio card as proof, yet it has no name, caption, or repo link — while three prime CTAs point at hosts that don't exist.
