# Deployment Guide

## Overview

This static site is designed to be deployed directly to GitHub Pages from the root directory. The deployment workflow has been optimized to eliminate the need for the `/out/` directory by building directly to the root.

## How Deployment Works

1. The site uses Next.js with the `next.config.js` configuration set to output to the root directory instead of `/out/`.
2. The GitHub Actions workflow in `.github/workflows/static.yml` handles the deployment process.
3. All assets are served from the root URL (https://backus.agency/) rather than from an `/out/` subdirectory.

## Key Files for Deployment

- `next.config.js`: Configures Next.js to build to the root directory
- `.github/workflows/static.yml`: Handles the CI/CD process for GitHub Pages
- `js/modal.js`: Provides popup functionality for contact forms
- `js/form-handler.js`: Handles form submissions by creating GitHub issues
- `form-fixer.js`: Provides cross-browser compatibility for forms
- `path-fixer.js`: Ensures CSS variables work correctly across browsers

## Manual Deployment (if needed)

If you need to deploy manually (without GitHub Actions):

1. Build the site:
   ```
   npm run build
   ```

2. Ensure all necessary files are in the correct location:
   ```
   cp -r js/*.js ./js/
   cp -f form-fixer.js .
   cp -f path-fixer.js .
   ```

3. Create necessary GitHub Pages files:
   ```
   touch .nojekyll
   echo "backus.agency" > CNAME
   ```

4. Commit and push your changes to the `main` branch.

## Important Notes

- The site is configured to use the domain `backus.agency`
- All scripts are now loaded from the root paths (e.g., `/js/modal.js` instead of `/out/js/modal.js`)
- Forms are submitted by creating GitHub issues in the repository

## Troubleshooting

If you encounter issues with the deployment:

1. Check that all script paths are absolute and start from the root (e.g., `/js/modal.js` not `js/modal.js`)
2. Verify that `next.config.js` is properly configured
3. Ensure the GitHub workflow has proper permissions to deploy to Pages
4. Check the GitHub Actions logs for any build or deployment errors
EOF < /dev/null
