# The Backus Agency Website

Static site with form handling via GitHub Issues and SQLite database.

## Setup

This site is set up to be deployed on GitHub Pages and uses GitHub Issues for form handling. When a form is submitted, it creates a GitHub issue that triggers a GitHub Actions workflow, which adds the submission to a SQLite database in the repository.

### Repository Structure

- `db/` - Contains the SQLite database and schema
- `out/` - The static site content
- `.github/workflows/` - GitHub Actions workflows:
  - `static.yml` - Deploys the static site to GitHub Pages
  - `form-handler.yml` - Processes form submissions

### Form Handling Setup

Forms are set up to submit to GitHub Issues, which are then processed by GitHub Actions to store the data in a SQLite database. The form handling is done using JavaScript that intercepts the form submissions.

Requirements:
1. Add the repository metadata in the HTML:
   ```html
   <meta name="github-repo-owner" content="TheBackusAgency">
   <meta name="github-repo-name" content="tba-static">
   ```

2. Include the form-handler.js script:
   ```html
   <script src="/js/form-handler.js"></script>
   ```

3. Add the `data-form-type` attribute to your forms:
   ```html
   <form data-form-type="contact">
     <!-- form fields -->
   </form>
   ```

### Database Schema

The database has two tables:
- `contact_form` - For contact form submissions
- `newsletter_form` - For newsletter subscriptions

## Development

To develop locally, you'll need to:

1. Clone the repository
2. Navigate to the repository folder
3. Open the HTML files in your browser

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch. The GitHub Actions workflow in `.github/workflows/static.yml` handles the deployment.

## Form Submission Process

1. User fills out a form on the website
2. JavaScript intercepts the form submission
3. A new GitHub issue is created with the form data
4. GitHub Actions workflow is triggered by the new issue
5. Workflow processes the form data and stores it in the SQLite database
6. The issue is closed automatically

## License

© 2025 The Backus Agency. All rights reserved.