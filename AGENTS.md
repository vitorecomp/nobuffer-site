# Nobuffer Site (`nobuffer-site`) — Agent Guide

Main personal developer website for Vitor (`vitorecomp/nobuffer-site`, live at [`www.vitorx86.dev`](https://www.vitorx86.dev/)), built with **Webpack 5**, **Pug** (`pug-plugin`), **Tailwind CSS 3**, **PostCSS / Sass**, and client-side **Three.js** (`r128`).

This repository defines the canonical **"Hacker's Garage"** terminal design system (documented in [`DESIGN.md`](./DESIGN.md) and [`PRODUCT.md`](./PRODUCT.md)) shared with `personal-portifolio` (`cases.vitorx86.dev`) and `personal-blog` (`blog.vitorx86.dev`), and houses the Blender/Python tooling behind the 3D AR2/AR3 robot arm (`helper/`).

## Commands

All website commands run from the repository root using **`npm`** (locked via [`package-lock.json`](./package-lock.json)):

- **Install dependencies**: `npm ci --registry=https://registry.npmjs.org` (or `npm install`)
- **Start dev server (HMR)**: `npm run dev` (runs `webpack-dev-server --config webpack.config.dev.js --mode development --hot`)
- **Production build**: `npm run build` (runs `webpack --config webpack.config.js --mode production`, outputting compiled static files to `build/`)

### Robot Model Tooling (`helper/`)

- **Run Blender pipeline scripts**: `blender --background --python helper/scripts/<script>.py`
  - Always invoke `blender` by bare name so the `~/.local/bin/blender` wrapper pins `/usr/bin` Python ahead of `mise` Python (avoiding `No module named 'math'`). See [`helper/README.md`](./helper/README.md) for the atlas bake and comic-restyle pipelines.

## Architecture & Key Files

- [`DESIGN.md`](./DESIGN.md), [`PRODUCT.md`](./PRODUCT.md) & [`.impeccable/design.json`](./.impeccable/design.json): Canonical design tokens (`JetBrains Mono`, `#111827` terminal-ink, `#0d9488`/`#2dd4bf` prompt-teal, `#4ade80` phosphor-green, `#14142f` midnight-garage, `#FFFAFA` snow-paper), component rules, and product principles.
- [`webpack.config.js`](./webpack.config.js) & [`webpack.config.dev.js`](./webpack.config.dev.js): Webpack 5 + `pug-plugin` configurations compiling `src/main.pug` into `build/` with content-hashed assets (`img/`, `models/`, `files/`, `assets/js/`, `assets/css/`).
- [`tailwind.config.js`](./tailwind.config.js): Tailwind CSS 3 configuration (`JetBrains Mono` mono stack, semantic Hacker's Garage color tokens, `hoverOnlyWhenSupported: true`, `@tailwindcss/typography`, `@tailwindcss/forms`).
- [`src/`](./src): Main static website source:
  - [`src/main.pug`](./src/main.pug): Root document entry (`index.html`), SEO/OpenGraph metadata, font preconnects, SRI-pinned Three.js CDN scripts, and section includes.
  - [`src/mixins.pug`](./src/mixins.pug): Shared terminal UI Pug mixins (`+terminalEyebrow`, `+terminalEyebrowLight`, `+terminalCta`, `+tagChips`, `+navLink`, `+panelLink`).
  - [`src/sections/`](./src/sections): Global navigation ([`navbar.pug`](./src/sections/navbar.pug) and IntersectionObserver-driven [`dot-nav.pug`](./src/sections/dot-nav.pug)).
  - [`src/views/`](./src/views): Single-page sections in scroll order (`main/`, `portfolio/`, `open-source/`, `ai/`, `backyard-mech/`, `ai-companion/`, `contacts/`, plus ambient `background/`).
  - [`src/scripts/`](./src/scripts): Client-side interactive scripts ([`robot.js`](./src/scripts/robot.js) Three.js GLTF/Draco viewer, [`carousel.js`](./src/scripts/carousel.js), [`constellation.js`](./src/scripts/constellation.js), [`background.js`](./src/scripts/background.js)).
  - [`src/assets/`](./src/assets): Stylesheet (`css/style.css`), images (`img/`), 3D model (`models/robot.glb`), and resume PDF (`files/vitor-vieira-resume.pdf`).
- [`helper/`](./helper): Offline Blender scenes (`helper/blender/`), Python scripts (`helper/scripts/`), solid-body component maps (`helper/data/`), and textures (`helper/textures/`) used to bake and restyle `robot.glb`.
- [`assets/`](./assets): Source GIMP artwork files (`.xcf`).
- [`.github/workflows/trigger-deploy.yml`](./.github/workflows/trigger-deploy.yml): Dispatches `deploy-nobuffer-site` to `vitorecomp/personal-infra` on pushes to `master` touching website source or build configs (GCP infrastructure, Cloud Build pipelines, maintenance page, and nginx reverse-proxy configs live in `personal-infra/cloud/nobuffer-site`).

## Conventions & Guardrails

- **Design System Fidelity (`DESIGN.md`)**: Follow the `vitorx86.dev` terminal grammar (`~$ <command>` eyebrows, `$ ./script.sh` CTAs, `./slug` links, `JetBrains Mono` as the sole typeface, `#111827` floating terminal cards, and section-scoped guest accents).
- **Reuse Shared Pug Mixins**: Use the mixins in [`src/mixins.pug`](./src/mixins.pug) (`+terminalEyebrow`, `+terminalEyebrowLight`, `+terminalCta`, `+tagChips`, `+navLink`, `+panelLink`) instead of duplicating terminal markup.
- **Tailwind Configuration Guardrails**: Stick to stock Tailwind CSS utilities and semantic tokens configured in [`tailwind.config.js`](./tailwind.config.js) (do not use undefined template classes like `text-primary`, `text-body-color`, or `text-dark`, and do not enable `@tailwindcss/aspect-ratio`, which disables native `aspect-*` utilities such as `aspect-square`).
- **Product Principles (`PRODUCT.md`)**: Keep every claim recruiter-verifiable in one click; do not fabricate testimonials, employer logos, or live-host claims for planned subdomains.
- **Generated Build Artifacts**: Never hand-edit files in `build/`; Webpack cleans and regenerates `build/` on every build.
- **Verification**: Always run `npm run build` after modifying Pug templates, styles, scripts, or assets to verify that Webpack and `pug-plugin` resolve all `require()` asset references cleanly.
