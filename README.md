# The Backus Agency - Static Website

This is the static website for The Backus Agency, built with Next.js and deployed to GitHub Pages.

## Important Files

- **Website Content**: HTML, CSS, and JavaScript for the website
- **Form Handling**: JavaScript for contact form and issue creation
- **Deployment**: GitHub Actions workflow for deployment to GitHub Pages

## Directory Structure

The website is transitioning from a structure where files are built into `/out/` to directly building to the root directory. See [TRANSITION.md](TRANSITION.md) for details.

## Key JavaScript Files

- `js/modal.js`: Handles popup modals for contact forms
- `js/form-handler.js`: Processes form submissions
- `form-fixer.js`: Ensures forms work across browsers
- `path-fixer.js`: Fixes CSS variables for compatibility
- `js/url-fixer.js`: Ensures URLs work during transition

## Deployment

This site is deployed using GitHub Pages. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed information on how deployment works.

## Quick Start

1. Clone this repository
2. Make your changes
3. Run `./deploy.sh` to prepare files for deployment
4. Commit and push your changes
5. GitHub Actions will automatically deploy the site

## Main Website Sections

- Home Page
- About
- Our Work
- Pricing
- Blog
- Contact

## Forms

The website uses GitHub Issues for form submissions. When users submit a contact form, a GitHub issue is created in this repository with the form data.

## Design

The website uses a modern dark theme with accent colors defined as CSS variables for consistency.

## Building Locally

If you have Next.js installed, you can build the site locally:

```bash
npm run build
```

Otherwise, you can simply edit the HTML, CSS, and JavaScript files directly.

## Support

For support or questions, please create an issue in this repository.
EOL < /dev/null
