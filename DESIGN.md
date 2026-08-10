---
name: vitorx86.dev
description: A developer's terminal session that lives in a garage — code, cars, robots and anime, all addressed as shell commands.
colors:
  terminal-ink: "#111827"
  panel-graphite: "#1f2937"
  midnight-garage: "#14142f"
  blueprint-line: "#3b3b78"
  snow-paper: "#FFFAFA"
  prompt-teal: "#0d9488"
  prompt-teal-bright: "#2dd4bf"
  phosphor-green: "#4ade80"
  ink-body: "#374151"
  fog-body: "#d1d5db"
  steel-muted: "#6b7280"
  silver-muted: "#9ca3af"
  hairline-gray: "#e5e7eb"
  anime-indigo: "#a5b4fc"
  promo-blue: "#2563eb"
  jacket-pink: "#f9a8d4"
  clay-blob: "#DED3C7"
typography:
  display:
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    fontSize: "2.25rem → 3.75rem (text-4xl to lg:text-6xl in steps)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    fontSize: "1.875rem → 2.25rem (text-3xl to sm:text-4xl)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.78
  label:
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.75
  tag:
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "0.125rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  full: "9999px"
spacing:
  gutter: "1.5rem"
  gutter-lg: "2rem"
  card-gap: "1.5rem"
  section-y: "4rem"
  section-y-lg: "6rem"
components:
  button-terminal:
    backgroundColor: "{colors.terminal-ink}"
    textColor: "{colors.phosphor-green}"
    rounded: "{rounded.lg}"
    padding: "0.75rem 1.25rem"
  button-terminal-hover:
    backgroundColor: "{colors.panel-graphite}"
  nav-link:
    textColor: "{colors.terminal-ink}"
    rounded: "{rounded.md}"
    padding: "0.5rem 0.75rem"
  nav-link-hover:
    backgroundColor: "{colors.terminal-ink}"
    textColor: "{colors.phosphor-green}"
  tag-chip:
    textColor: "{colors.prompt-teal-bright}"
    rounded: "0.25rem"
    padding: "0.25rem 0.5rem"
  card-terminal:
    backgroundColor: "{colors.terminal-ink}"
    rounded: "{rounded.lg}"
  panel-dark:
    backgroundColor: "{colors.midnight-garage}"
    rounded: "{rounded.xl}"
---

# Design System: vitorx86.dev

## Overview

**Creative North Star: "The Hacker's Garage"**

The whole site is a developer's terminal session that happens to live in a garage. Every section opens as a shell command (`~$ whoami`, `~$ git log --author=vitor`, `~$ cat ./contacts.txt`), every link is named like an executable (`./github`, `./clone_alissa.sh`), and the things being worked on — race cars, ESP32 watches, robots, an anime AI companion — sit beside the code as equals. The register is **playful but precise**: the jokes live in the copy ("old shitbox", `exit 0`), while the pixels stay disciplined — one typeface, one content column, consistent lockups, production-grade alignment.

Light and dark alternate like a garage with the door open: a snow-white page for the workbench sections, full-bleed dark panels (near-black or midnight navy with faint diagonal blueprint grids) for the showcase moments. Terminal-dark objects — buttons, link panels, project cards with traffic-light dots — float on the light page; on dark panels, content glows in phosphor green and bright teal instead.

**Key Characteristics:**
- Terminal grammar everywhere: `~$` prompt eyebrows, `$` command CTAs, `./executable` link names, `#` comment captions.
- One typeface (JetBrains Mono) carrying the entire hierarchy.
- Alternating light page / full-bleed dark panels with 45° blueprint grid textures.
- Interactive elements are "floating terminals": dark, rounded-lg, real shadows, hover lift.
- Each themed section may bring one guest accent from its own artwork (anime blue-indigo, Alissa pink); the house accents stay teal and green.

## Colors

A near-monochrome terminal palette — ink, graphite, snow — with teal as the prompt voice, phosphor green as the action voice, and short-lived guest accents borrowed from each section's artwork.

### Primary
- **Prompt Teal** (#0d9488): the site's ambient accent on light backgrounds — `~$` eyebrow commands, the hero's orbit line and cubes, the active dot-nav dot, the vertical detail band. It marks "the machine is talking."
- **Prompt Teal Bright** (#2dd4bf): the same voice adapted for dark panels — eyebrows and `»` caption markers on `midnight-garage` and `terminal-ink` surfaces.

### Secondary
- **Phosphor Green** (#4ade80): the action color. Text of every terminal button, hover color of every `./link`, the arrow in card footers. Green means "you can run this." It appears only on dark surfaces, never on the light page directly.

### Tertiary (guest accents — one per themed section, drawn from its artwork)
- **Anime Indigo** (#a5b4fc) with **Promo Blue** (#2563eb): AI section only — tag chips, the skewed promo slab gradient (blue-500 → blue-600 → indigo-700), sparkle badge (indigo-600 #4f46e5).
- **Jacket Pink** (#f9a8d4): AI-companion section only — capability tags (border pink-400/40) and Alissa's backdrop glow (pink-500/20), pulled from her race jacket.

### Neutral
- **Terminal Ink** (#111827): the workhorse dark — terminal buttons, cards, link panels, mobile menu, and all headings on light backgrounds.
- **Panel Graphite** (#1f2937): hover state of terminal surfaces; card title bars use it at 60% opacity.
- **Midnight Garage** (#14142f): the anime-promo panel navy (AI and AI-companion sections), always textured with a 45° grid stroked in **Blueprint Line** (#3b3b78 at 35% opacity).
- **Snow Paper** (#FFFAFA): the page itself (`background: snow`).
- **Ink Body** (#374151) / **Fog Body** (#d1d5db): body copy on light / on dark.
- **Steel Muted** (#6b7280) and **Silver Muted** (#9ca3af): the quiet halves of terminal lockups — `$` and `~$` prefixes, `./` prefixes, captions, inactive dots.
- **Hairline Gray** (#e5e7eb): light-mode grid textures (footer, box background) and thin borders.
- **Clay Blob** (#DED3C7): the one warm neutral — the organic blob behind the hero portrait.

### Named Rules
**The Prompt Rule.** Accents go where a terminal would put them: teal for prompts and ambient marks, green for anything executable (links, buttons, actions). If it isn't a prompt or an action, it stays neutral.

**The Guest Accent Rule.** A themed section may introduce exactly one accent family taken from its own artwork (indigo/blue from the anime promo, pink from Alissa's jacket). Guest accents never appear outside their section; the house accents (teal, green) appear everywhere.

## Typography

**Display Font:** JetBrains Mono (with ui-monospace, Menlo, Consolas fallbacks)
**Body Font:** JetBrains Mono (same stack)
**Label/Mono Font:** JetBrains Mono — there is no second typeface.

**Character:** A single monospace voice from hero to footer. Hierarchy is built entirely from size, weight (400/700/800), and color — never from a family change. The effect is a terminal that learned typography: technical, honest, quietly confident.

### Hierarchy
- **Display** (700, 2.25rem → 3.75rem in responsive steps, tracking-tight): the hero's "Hi, I'm Vitor" with its pulsing ▌ cursor. The AI section's banner variant goes bigger and louder: 800, 3.75–4.5rem, letter-spacing 0.35em.
- **Headline** (700, 1.875rem → 2.25rem, tracking-tight): section titles, dark gray-900 on light, white on dark.
- **Body** (400, 1.125rem, line-height ~1.78): section copy — gray-700 on light, gray-300 on dark. Larger hero variant: 1.25rem, leading-9.
- **Label** (400, 0.875–1rem, line-height 1.75): the `~$` eyebrow lockup — teal command text after a muted prompt prefix.
- **Tag** (400, 0.75rem): chip labels, captions, `# comment` lines under CTAs, card title bars.

### Named Rules
**The One Font Rule.** JetBrains Mono is the only typeface on the site. New work never introduces a second family — emphasis comes from weight, size, and the palette's voices.

**The Eyebrow Lockup Rule.** Every section opens with the same two-tone prompt: muted `~$ ` prefix (silver on light, white on dark), then the command in teal. The command is thematic and real-looking (`git log --grep=ai`, `./alissa --diagnose ./old-shitbox`).

## Layout

One scrolling page. Content lives in a single centered column (`max-w-7xl`, 1.5rem side gutters, 2rem at lg); full-bleed moments break out of it deliberately. Dark showcase panels span up to 90vw and attach to a viewport edge — `rounded-l-none` when flush left (open-source), `rounded-r-none` when flush right (AI) — or go full-width (AI companion). Two-column grids (`lg:grid-cols-2` or 12-col splits) pair a text block with a visual panel; on mobile everything stacks with the text first (`lg:order-*` handles desktop swaps). Section vertical rhythm is 4rem padding on mobile, 6rem from sm up. A fixed dot-nav rides the right edge (3×3px gray dots; the active section's dot turns teal and doubles in height) driven by an IntersectionObserver. The snow background carries persistent ambient decoration: a JS-generated box grid, a rotated dark "planetary" slab, and a constellation canvas.

## Elevation & Depth

A hybrid, governed by object type: **interactive terminal objects float; environmental panels sit flush.** Buttons and cards rest at `shadow-md`/`shadow-lg` and respond to hover by lifting (`-translate-y-0.5` for buttons, `-translate-y-1` for cards) with a shadow step up — the transition is always ~200ms. Full-bleed dark panels never cast shadows; they read as environment, separated from the page by a 1px `ring-gray-400/10` hairline and their own darkness. Depth inside dark panels comes from layering (glow blurs, offset outline echoes, watermark kanji) rather than shadows.

### Shadow Vocabulary
- **Resting card** (`box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` — shadow-md): terminal buttons and cards at rest.
- **Hover / prominent** (`0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` — shadow-lg): hover state, link panels, mobile menu.
- **Showcase** (`0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` — shadow-xl): section panels that need presence (open-source glass card) and card hover peaks.

### Named Rules
**The Floating Terminal Rule.** If you can click it, it floats and lifts on hover. If it's environment (a full-bleed panel, a background grid), it's flat with at most a hairline ring. Never shadow a dark panel.

## Shapes

Softly rounded rectangles are the default: `rounded-lg` (0.5rem) for buttons, cards, and panels-within-panels; `rounded-xl` (0.75rem) for section-level containers; `rounded-md` (0.375rem) for nav links; `rounded-full` for dots (dot-nav, traffic lights, social circles, carousel button). Two deliberate exceptions define the personality: the **organic blob** clipping the hero portrait (`border-radius: 55% 45% 40% 60% / 60% 40% 60% 40%` over clay #DED3C7), and the **anime promo slab** — a `-skew-x-[12deg]` rectangle with `rounded-sm` corners, backed by an offset outline echo (`border-2`, translated 1rem right/down). The offset-echo device (a shape's outline repeated behind it at +1rem offset) recurs as a framing motif, including behind Alissa. Dark panels are textured with 45°-rotated line grids (36px cells on dark, 450×150 cells on light).

## Components

### Buttons (the terminal CTA)
- **Character:** a one-line shell command you can press.
- **Shape:** gently rounded (0.5rem), `border border-gray-700`.
- **Primary:** `terminal-ink` background, `phosphor-green` mono text, muted `$ ` prefix in gray-500, padding 0.75rem 1.25rem (1rem 1.5rem from sm), `shadow-md`, optional trailing icon at h-5/w-5.
- **Hover / Focus:** background to `panel-graphite`, `shadow-lg`, lift `-translate-y-0.5`, 200ms.
- **Labels:** always shell-script style — `./download_resume.sh`, `./clone_alissa.sh` — often followed by a gray-500 `# comment` caption line below.

### Chips (tag chips)
- **Style:** transparent background, 1px border in the accent at 40% opacity, accent-300 text, 0.75rem mono, `rounded` (0.25rem), padding 0.25rem 0.5rem.
- **State:** static labels (no selected state). Accent follows the section: teal (portfolio), indigo (AI), pink (AI companion).

### Cards / Containers (terminal windows)
- **Corner Style:** `rounded-lg` (0.5rem), overflow hidden.
- **Background:** `terminal-ink`; title bar `panel-graphite` at 60% with bottom hairline `border-gray-700/60`.
- **Title bar:** three traffic-light dots (red/yellow/green at 80%, 0.75rem circles) + `~/projects/<name>` path in gray-400 0.75rem.
- **Shadow Strategy:** floating — `shadow-md` at rest, `shadow-xl` + `-translate-y-1` on hover (whole card is the link).
- **Internal Padding:** 1.25rem; footer action pinned to the bottom with `mt-auto` (`$ ./open_repo.sh` + arrow that slides right on group-hover).

### Navigation
- **Desktop:** mono 0.875rem links named `./github`, `./portfolio`… — gray-900 text, `./` prefix in gray-400; hover inverts to a gray-900 pill with green text (`rounded-md`, 150ms).
- **Mobile:** a `$ ls` button (gray-900, green mono) opens a gray-900 terminal panel headed by a faint `$ ls ./links` line; links are gray-300 rows that hover to gray-800/green.
- **Dot-nav:** fixed right-edge column of 0.75rem gray-400 dots; active dot turns `prompt-teal` and stretches to 1.5rem height (200ms).

### The Eyebrow Lockup (signature)
Every section header: `p` in mono label size — `~$ ` prefix (gray-400 on light / white on dark) + command text (teal-600 light / teal-400 dark) — followed by the mono headline, then body copy at mt-6. The hero and footer headlines append a pulsing `▌` cursor in teal (`animate-pulse`).

### The Dark Showcase Panel (signature)
Full-bleed `midnight-garage` (or `bg-gray-900/60` glass) container, `ring-1 ring-gray-400/10`, 45° blueprint grid overlay (#3b3b78 at 0.35, 36px cells), holding a two-column story: text lockup on one side, an art object (skewed slab, glowing character, 3D robot) on the other. Guest accent allowed inside; shadows not.

## Do's and Don'ts

### Do:
- **Do** open every new section with the eyebrow lockup — a muted `~$ ` prefix and a thematic teal command — before the headline.
- **Do** name every link and CTA as an executable: `./name` for nav links, `$ ./verb_noun.sh` for buttons, `# comment` captions in gray-500 for context.
- **Do** keep interactive objects dark and floating: gray-900 surface, green action text, shadow at rest, ~200ms hover lift.
- **Do** reuse the content column (`mx-auto max-w-7xl px-6 lg:px-8`) for anything inside a panel, and stack text-first on mobile using `lg:order-*` for desktop swaps.
- **Do** texture any new dark panel with the 45° blueprint grid (#3b3b78, 35% opacity, 36px cells) and separate it with `ring-1 ring-gray-400/10`.

### Don't:
- **Don't** introduce a second typeface, ever — hierarchy is weight/size/color in JetBrains Mono.
- **Don't** let a guest accent (indigo/blue, pink) escape its home section; site-wide accents are teal and green only.
- **Don't** put shadows on full-bleed dark panels, and don't leave interactive cards shadowless — the depth rule is what separates object from environment.
- **Don't** use Tailwind classes that aren't in this build (`text-primary`, `text-body-color`, `text-dark` came from a template and compile to nothing) — the config is stock Tailwind + JetBrains Mono.
- **Don't** write buttons or links in sentence case ("View my projects") — the terminal grammar (`./view_projects.sh`) is the brand voice.
