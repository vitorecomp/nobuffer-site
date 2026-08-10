---
target: website/src/main.pug
total_score: 18
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 2
timestamp: 2026-08-10T01-30-41Z
slug: website-src-main-pug
---
Method: dual-agent (A: a6a3adf720eb4c628 · B: a9bb15d6a7cf04db6)

# Design Critique #2 — vitorx86.dev main page (`website/src/main.pug`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Dot-nav, carousel counter, aria-expanded all good; robot panel is a silent 28rem void until the 4.8MB GLB arrives — no loading state |
| 2 | Match System / Real World | 3 | Terminal metaphor consistent and self-explanatory to devs; `./social` and `./open_cases.sh` still require decoding by non-technical recruiters |
| 3 | User Control and Freedom | 2 | Carousel is next-only (no prev, no direct selection); every link forces a new tab; no back-to-top |
| 4 | Consistency and Standards | 3 | High internal consistency per DESIGN.md; navbar "./portfolio" (off-site, dead) vs on-page "Portfolio" section is one word with two destinations |
| 5 | Error Prevention | 1 | 8 of 20 outbound links point at NXDOMAIN hosts (user-deferred) |
| 6 | Recognition Rather Than Recall | 2 | Dot-nav dots visually unlabeled (aria-label only); shell filenames require translation |
| 7 | Flexibility and Efficiency | n/a | Single-scroll landing; dot-nav is the accelerator and exists |
| 8 | Aesthetic and Minimalist Design | 3 | Disciplined type/palette; top half still runs 4 ambient motion layers; AI section stacks six decorative devices |
| 9 | Error Recovery | 1 | Dead subdomains yield raw DNS errors (user-deferred); without JS the mobile menu button is inert |
| 10 | Help and Documentation | n/a | `# comment` captions serve as micro-help and do it well |
| **Total** | | **18/32 (56%)** | **Acceptable band — up from 15/32; the remaining 1s are the dead links (deferred) and motion/control affordances** |

(Note: Assessment A's own header stated 20/32; its table sums to 18/32. The corrected total is used throughout.)

## Design Specificity Verdict

**LLM assessment:** AUTHORED, with the concept executed rather than decorated. The alternating edge-attached panels, offset-echo motifs, clay blob portrait, and teal continuity band are not template shapes; the robot arm runs real URDF kinematics with self-calibrating IK, and the constellation atom publishes its position as the robot's shadow-light source — a cross-scene lighting link that is genuinely original. Template skeletons remain visible in the hero/open-source grid scaffolding, fully repainted.

**Deterministic scan:** 53 findings on the built output; 48 triaged as artifacts (minified single-line pairing of unrelated elements accounts for all 16 gray-on-color warnings — every flagged colored background is a text-free decorative element; the font-size/radius/rgba/Roboto hits are Tailwind's own generated utilities). Genuine: the authored `text-[9rem]`/`text-[13rem]` watermark kanji sizes (decorative, off the documented ramp), the two robot matcap hexes (WebGL material tints, not UI), and em-dash density — corrected by B from 16 to 12 real em-dashes (4 were CLI flags like `--grep=ai`), still above the rule threshold. The real contrast findings again came from the design review, not the detector.

**Visual overlays:** not available — no browser automation; CLI-only evidence.

## Overall Impression

Meaningfully better than round one: the page went from 31MB to 5.4MB, standards mode, one h1, working reduced-motion in two of the three animation systems, a share card, and every section speaking the signature. What keeps it out of the Good band: the deferred dead links still control H5/H9, and a second ring of finish work is now visible — the robot's ungated animation loop, the missing direct contact channel at the exact recruiter-contact moment, and small a11y residue (dot contrast, focus-visible, aria-live).

## What's Working

1. **A concept executed, not decorated** — terminal grammar total, from eyebrows to `~$ exit 0`, and the code matches DESIGN.md's named rules.
2. **The robot panel is the thesis proven** — real URDF kinematics, honest attribution, no template equivalent anywhere.
3. **Real performance craft where it was done** — WebP-only images (36–79KB), observer-gated GLB, next-slide-only carousel preload, visibility-gated constellation with a documented flicker fix.

## Priority Issues

**[P0] 8 dead-host links + the "running live right now" claim.** (User-deferred by explicit decision — recorded, not planned.) 40% of outbound navigation; the AI section's only two interactive elements both fail. Cheapest interim: navbar `./portfolio` → `#portfolio`, planned-tense the demo copy.
Suggested command: /impeccable harden (when the user re-opens it)

**[P1] The two loudest animations ignore reduced-motion.** robot.js runs an unconditional rAF from load (the base literally never stops spinning, even off-screen) and the hero orbit cubes are SMIL, which the CSS override can't stop. constellation.js and background.js do it right — the pattern exists in the codebase.
Fix: gate robot.js like constellation.js (IntersectionObserver + matchMedia + one static frame); pause/replace SMIL under reduced motion.
Suggested command: /impeccable polish

**[P1] No direct contact channel at the contact moment.** The `$ ls ./links` panel offers github/linkedin/insta/blog(dead)/resume — no email. The success metric is "recruiter gets in contact in one visit"; the highest-intent visitor lands in LinkedIn's messaging wall.
Fix: `./send_mail.sh` → mailto as the first link.
Suggested command: /impeccable harden

**[P2] Contrast/target residue.** Dot-nav inactive dots gray-400 on snow = 2.46:1 with 24px hit area (guideline 44px); `$` prefixes gray-500 on gray-900 = 3.67:1 on every CTA; slab caption blue-100 on blue-600 = 4.24:1. No authored focus-visible styles anywhere; carousel slide changes have no aria-live; several Japanese decorative strings not aria-hidden.
Suggested command: /impeccable polish

**[P2] Third-party fragility + the one heavy asset.** three.js r128 from cdnjs + GLTFLoader from unpkg (no SRI) — an unpkg hiccup silently kills the site's best feature; robot.glb is 4.8MB (~90% of shipped weight), Draco/meshopt would take it under 1MB.
Suggested command: /impeccable optimize

**[P3] No brand mark; weak title.** navbar's left slot is an empty div while logo.svg sits unreferenced in assets; `<title>Vitor Open Dev</title>` undersells. A `vitor@x86:~$` wordmark linking to #main would fill the slot in-voice.
Suggested command: /impeccable delight

## Persona Red Flags

**Jordan (HR recruiter):** hero reads instantly credible, then the most recruiter-shaped nav word ("./portfolio") is a DNS error. "Shitbox" ×3 before the resume. After downloading the resume, her next instinct — email — has no target.

**Casey (mobile, slow):** hero genuinely fast now (45KB webp, fetchpriority). But menu items 2 and 3 are both dead; the robot section is a tall dark void on 3G; dots ride the content edge at 2.46:1.

**Riley (stress tester):** JS off — carousel shows the Subaru noscript (good), mobile nav inert (bad). Keyboard — all reachable, default UA focus ring only. Screen reader — un-hidden kanji announced as garbage; silent carousel swaps. Both AI-section interactive elements dead.

## Minor Observations

Three identical dead CSS files (`.term { color: aliceblue }`) under views/*/description/css/; shipped typo `//- Move it to a a template`; "Building it was really amazing" is filler where a concrete claim would land; carousel slide naming inverts (title vs nick); og:image points at a content-hashed URL that breaks for cached crawlers each rebuild; Google Fonts via `@import` serializes the font chain; DESIGN.md's own shadow rules contradict each other (Floating Terminal Rule vs Shadow Vocabulary) — the code follows the vocabulary; the carousel connector affordance is quietly excellent.

## Questions to Consider

1. If the terminal is the brand, why can't I type into it? One working prompt would convert the metaphor from costume into proof — static-site compatible.
2. Why is the best engineering on the page anonymous? The robot deserves its own portfolio card; it's the only project the visitor has already interacted with.
3. What is the minimum honest demo? A 20-second telemetry GIF or an embedded sample generation would restore principle #1 without waiting for subdomains.
