# Nobuffer Site (vitorx86)

> All the files on the build folder are automatically generated.

[![Build the Main Website](https://github.com/vitorecomp/nobuffer-site/actions/workflows/build-website.yml/badge.svg)](https://github.com/vitorecomp/nobuffer-site/actions/workflows/build-website.yml)

Collection of my static sites code. The source files are compiled using Webpack and deployed via Cloud Build to a Google Cloud Storage bucket.

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

- `.github/workflows`: GitHub Actions workflow files (website build, nginx deploy).
- `website`: Source code for the main website (Pug, Tailwind, Webpack). Includes `website/cloudbuild.yaml`, the Google Cloud Build configuration.
- `build`: Compiled site output — automatically generated, do not edit by hand.
- `maintenance`: Static maintenance page.
- `reverse-proxy`: Nginx configuration files for subdomains.
- `infra`: Terraform for the GCP infrastructure (load balancer module, prod environment).
- `helper`: Blender/Python tooling behind the site's robot model (`robot.glb`) — see `helper/README.md`.
- `assets`: Source image files (.xcf) for site artwork.

## CI/CD Configuration

This project uses GitHub Actions with two workflows:

- `build-website.yml`: triggers Google Cloud Build (`website/cloudbuild.yaml`) to compile the site and publish it to the GCS bucket.
- `deploy-nginx-sites.yml`: copies the `reverse-proxy` configs to the server over SSH, validates and reloads nginx, and issues certificates.

### Required GitHub Secrets

- `GCP_SA_KEY`: A JSON service account key with permissions to run Cloud Build and access the target GCS bucket.
- `HOST`, `USERNAME`, `KEY`: SSH connection details for the nginx deploy workflow.

### Required GitHub Variables

- `GCS_BUCKET_NAME`: The name of the Google Cloud Storage bucket where the static site files will be stored.

## Local Development

To run the main website locally:

1. Navigate to the `website` directory:

   ```bash
   cd website
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   This runs webpack-dev-server with hot reloading.
