# Static Site Form Submission Guide

This document explains how form submissions work on our static site hosted on GitHub Pages.

## Overview

Since GitHub Pages only hosts static content, traditional server-side form processing isn't available. We've implemented a client-side solution that submits form data directly to Google Forms.

## How It Works

1. `form-fixer.js` is loaded on all pages that contain forms
2. When a user submits a form, the script:
   - Captures the form submission event
   - Maps form fields to the corresponding Google Form fields
   - Submits the data to Google Form via a hidden iframe (bypassing CORS restrictions)
   - Shows a success message to the user
   - Resets the form

## Form Configuration

All form configuration is stored in the `GOOGLE_FORMS` object within `form-fixer.js`:

```javascript
const GOOGLE_FORMS = {
  // Main contact form
  contact: {
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSf9FbCGxDu8BegwDLa9qiLu4mFm4MSilBkoTEo5qWVH-EpS-g/formResponse',
    fields: {
      'name': 'entry.166753821',
      'email': 'entry.954130076',
      'phone': 'entry.1263452350',
      'subject': 'entry.1134801428',
      'message': 'entry.1503383050'
    }
  },
  // Newsletter form
  newsletter: {
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSe5jZ0lDVHf0o5-1T7eJt9vkRk-sYvwNjbcGkBuqP5I09H7ig/formResponse',
    fields: {
      'email': 'entry.456327236'
    }
  }
}
```

## Adding a New Form Type

If you need to add a new form:

1. Create the Google Form with the necessary fields
2. Get the form URL and entry IDs for each field
3. Add a new entry to the `GOOGLE_FORMS` object in `form-fixer.js`
4. Add a new condition to the `identifyFormType` function to recognize your form type

## Debugging

The script includes console logs to help with debugging:
- Form detection on page load
- Form type identification
- Form submission with data
- Success or error messages

If forms aren't being submitted correctly:
1. Open the browser developer console (F12 or Ctrl+Shift+I)
2. Look for any error messages when submitting the form
3. Check that the form fields have the correct `name` attributes
4. Verify that the Google Form is still active and configured correctly

## Testing

To test a form:
1. Fill out the form on your site
2. Submit the form
3. Check the console for any errors
4. A green success message should appear 
5. Verify in Google Forms that the data was received

## Benefits of This Approach

- Works on static sites (no server-side code needed)
- No CORS issues due to iframe submission
- No external dependencies
- User-friendly success/error messages
- Configurable for any number of forms

## Limitations

- Requires JavaScript to be enabled in the browser
- Cannot handle file uploads (Google Forms limitation)
- Limited form validation (only what's provided by HTML5)