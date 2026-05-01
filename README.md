# Nobuffer Site (vitorx86)

> All the files on the build folder are automatically generated.

[![Build and Deploy the Website](https://github.com/vitorecomp/nobuffer-site/actions/workflows/build-website.yml/badge.svg)](https://github.com/vitorecomp/nobuffer-site/actions/workflows/build-website.yml)


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
- [My Portfolio Webpage](https://me.vitorx86.dev/)
- [Product Benchmark Webpage](https://bench.vitorx86.dev/)

## Directory Structure

- `.github/workflows`: GitHub Actions workflow files.
- `website`: Source code for the main website (Pug, Tailwind, Webpack).
- `maintenance`: Static maintenance page.
- `myself`: Static personal page (currently looks like another maintenance page).
- `reverse-proxy`: Nginx configuration files for subdomains.
- `cloudbuild.yaml`: Google Cloud Build configuration.

## CI/CD Configuration

This project uses GitHub Actions to trigger Google Cloud Build.

### Required GitHub Secrets
- `GCP_SA_KEY`: A JSON service account key with permissions to run Cloud Build and access the target GCS bucket.

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
   npm run start:dev-server
   ```
   This will start the webpack watcher and a live-server to preview the site.
