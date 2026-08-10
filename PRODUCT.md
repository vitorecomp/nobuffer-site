# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recruiters and hiring managers first: the site's job is to earn interviews and professional credibility for Vitor (vitorx86). Fellow developers and the open-source community are the second audience — the site should also work as a place to share projects and personality. Confirmed 2026-08-09.

## Product Purpose

Personal developer site (www.vitorx86.dev) for Vitor — a professional showcase first, with the personality and hobby sections (racing, embedded hardware, AI/anime experiments) as deliberate differentiators rather than filler. Success: a recruiter can verify skills and get in contact in one visit; a developer leaves with a repo to explore or a reason to follow.

## Positioning

A portfolio told entirely in the developer's own working idiom — terminal prompts, shell-script link names, monospace type — backed by verifiable public work (86 GitHub repos) and real hobbies (an old race car, ESP32 builds, AI experiments) that prove range instead of decorating it. Current employer fact: **Google** (the site's "Google developer" copy is correct; the GitHub bio saying Red Hat is stale — confirmed 2026-08-09).

## Operating Context

- Monorepo of static sites (`nobuffer-site`), main site source in `website/` (Pug + Tailwind 3 + Webpack, JetBrains Mono via Google Fonts). Dev: `npm run dev` in `website/`; build output goes to `build/website/`.
- Deployed via GitHub Actions → Google Cloud Build → Google Cloud Storage bucket, fronted by an nginx reverse proxy (`reverse-proxy/`) for subdomains.
- Repo also holds `maintenance/` and `myself/` static pages and infra config.
- Main page is a single scrolling page: hero → portfolio → open-source → AI → backyard-mech (cars) → AI companion (Alissa) → contacts footer, with a dot side-nav.

## Capabilities and Constraints

- Static site only — no backend; anything interactive must run client-side (Three.js robot, carousel, constellation background already do).
- **Subdomain reality (confirmed 2026-08-09): only www.vitorx86.dev is live.** blog.vitorx86.dev, cases.vitorx86.dev, demo.vitorx86.dev (and any other *.vitorx86.dev) do NOT resolve yet — they are planned. Future work must not present them as live; the AI section's "running live right now" demo claim and the navbar/portfolio links to cases/blog currently point at dead hosts and need either the subdomains brought up or the copy/links softened.
- Resume is served as a local PDF: `website/src/assets/files/vitor-vieira-resume.pdf` (linked from the navbar, the hero CTA, and the contacts footer).
- Open decision: whether the navbar's `./portfolio` should point at the in-page `#portfolio` section until cases.vitorx86.dev is live.

## Brand Commitments

- Name/handles: Vitor (Vieira Vitor), vitorx86, GitHub `vitorecomp`, LinkedIn `vieiravitor`, Instagram `vitorx86.dev`.
- Voice: playful terminal/hacker register — `~$` prompt eyebrows, `./link` naming, shell-script CTAs — with self-deprecating honesty ("old shitbox").
- Assets on hand: `logo.svg` / `logo-color.png`, `profile_picture.png`, `alissa.png` (the AI racing companion character), car photos (`assets/img/cars/`), `robot.glb`, favicon.

## Evidence on Hand

- Real public work: 86 repos at github.com/vitorecomp; portfolio highlights turbovec (Rust vector index), ruscene (Rust search engine), go-ls, esp32-watch-so, ai-advanced-ocr, alissa-ai-racing-companion.
- Real resume PDF (English) in the repo.
- Absences future work must not fabricate: no testimonials, no case studies, no live demos (until subdomains exist), no employer logos or endorsements.

## Product Principles

1. **Recruiter-verifiable in one click.** Every claim should land on something real — a repo, the resume PDF, a live page. No dead links, no vapor.
2. **Personality is the differentiator, not decoration.** The racing, embedded, and anime/AI sections stay; they prove range and authenticity that a template portfolio can't.
3. **Never claim what isn't live.** Planned properties are presented as planned (or not at all) until they resolve.
4. **The site is itself a work sample.** Code quality, performance, and polish of this site are part of the evidence.
5. **Everything real is open.** The work shown lives in public repos; the site should always route visitors to the source.
