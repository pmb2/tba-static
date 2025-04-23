# Google Form Setup Guide for TBA Website

This guide explains how to set up Google Forms to work with the contact forms on the TBA website.

## Step 1: Create Google Forms

Create separate Google Forms for:
1. Main Contact Form (contact page)
2. Contact Modal Form
3. Newsletter Subscription Form

## Step 2: Create Form Fields

### Main Contact Form
Create these fields in your Google Form:
- Full Name (Short answer)
- Email (Short answer)
- Phone Number (Short answer)
- Subject (Dropdown)
- Message (Paragraph)

### Contact Modal Form
Create these fields in your Google Form:
- Full Name (Short answer)
- Email (Short answer)
- Company (Short answer)
- Phone Number (Short answer)
- Project Details (Paragraph)
- Budget Range (Dropdown)
- Preferred Plan (Multiple choice)
- How did you hear about us? (Short answer)

### Newsletter Form
Create this field in your Google Form:
- Email (Short answer)

## Step 3: Find Form IDs

1. Create your form in Google Forms
2. Click "Send" button at the top right
3. Click the `<>` link icon to get the HTML embed code
4. Look for the form action URL which will look like:
   ```
   https://docs.google.com/forms/d/e/1FAIpQLSe*********/formResponse
   ```
5. Find the entry IDs for each field. View the source of the embedded form or use Chrome DevTools to inspect the form. Look for input elements with names like `entry.123456789`.

## Step 4: Update the Website Code

Replace the placeholders in these files:

### `/app/contact/page.tsx`
```javascript
// Replace this:
const googleFormUrl = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse"

// With your actual URL:
const googleFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSe*********/formResponse"

// Replace these entry IDs with your actual entry IDs:
const googleFormData: Record<string, string> = {
  "entry.123456789": formValues.name?.toString() || "",
  "entry.234567890": formValues.email?.toString() || "",
  "entry.345678901": formValues.phone?.toString() || "",
  "entry.456789012": formValues.subject?.toString() || "",
  "entry.567890123": formValues.message?.toString() || ""
}
```

### `/components/contact-form-modal.tsx`
Update the Google Form URL and entry IDs similar to the contact page.

### `/components/footer.tsx`
Update the newsletter subscription form:
```javascript
// Replace with your actual form URL
const googleFormUrl = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse"

// Replace with your actual entry ID for the email field
input.name = "entry.123456789"
```

## Testing

1. Fill out a form on your website
2. Submit the form
3. Check your Google Form responses to ensure the data was received
4. Test all forms to ensure they're working correctly

## Troubleshooting

- If the form isn't submitting, check the browser console for errors
- Ensure your Google Form is set to "Anyone can respond"
- Make sure the field IDs exactly match those in your Google Form
- Test with the website deployed as a static site to confirm it works in production