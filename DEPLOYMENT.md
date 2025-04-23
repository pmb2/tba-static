# Deployment Guide

This document explains how the website is structured and how to deploy it correctly.

## Current Structure

The website is now set up to be served directly from the root directory, eliminating the need for the `/out/` route redirection. This means:

1. The main content is now accessible directly at `https://backus.agency/` instead of `https://backus.agency/out/`
2. JavaScript files and assets have been moved to their proper locations in the root directory

## Key Files

- `form-fixer.js` - Handles form submissions by creating GitHub issues
- `path-fixer.js` - Ensures CSS variables are properly set across all browsers
- `js/form-handler.js` - Modern form handling implementation
- `nginx.conf` - Configuration for setting up Nginx to serve the site (if needed)
- `deploy.sh` - Script to copy files from `/out` to the root directory after building

## Deployment Process

1. Build your site as usual (this will generate files in the `/out` directory)
2. Run the `deploy.sh` script to copy files to the root directory:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
3. Commit and push the changes to GitHub. GitHub Pages will serve the site from the root directory.

## Manual Deployment

If the deployment script doesn't work, follow these steps manually:

1. Copy all files from `/out` to the root:
   ```bash
   cp -r out/* .
   ```

2. Ensure the JS files are in the right place:
   ```bash
   cp -f out/js/form-handler.js js/
   cp -f out/form-fixer.js .
   cp -f out/path-fixer.js .
   ```

3. Create GitHub Pages required files:
   ```bash
   touch .nojekyll
   echo "backus.agency" > CNAME
   ```

## Important Notes

- All internal links should use absolute paths starting from the root (e.g., `/about/` not `/out/about/`)
- Always include the CSS variables fix script (`path-fixer.js`) in all HTML files
- Make sure the GitHub repository metadata is included in the main HTML files:
  ```html
  <meta name="github-repo-owner" content="TheBackusAgency"/>
  <meta name="github-repo-name" content="tba-static"/>
  ```