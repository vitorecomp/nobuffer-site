# Nobuffer Site (vitorx86)

> All the files on the build folder are automatically generated.

Collection of my static sites code. The source files are compiled using Webpack. Infrastructure provisioning and deployment automation are managed in the [`personal-infra`](https://github.com/vitorecomp/personal-infra) repository.

## Stack

The tech stack used on the websites is:

- NodeJs
- Webpack
- Pug (Jade)
- Tailwind CSS

## Sites

The code for the following sites is in this repo:

- [My Main Webpage](https://www.vitorx86.dev/)
- My Portfolio Webpage (`me.vitorx86.dev` — not live yet)
- Product Benchmark Webpage (`bench.vitorx86.dev` — not live yet)

## Directory Structure

- `src`: Source code for the main website (Pug, Tailwind, Webpack).
- `build`: Compiled site output — automatically generated, do not edit by hand.
- `helper`: Blender/Python tooling behind the site's robot model (`robot.glb`) — see `helper/README.md`.
- `assets`: Source image files (.xcf) for site artwork.

## Local Development

To run the main website locally:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   This runs webpack-dev-server with hot reloading.
