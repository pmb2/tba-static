# Form Webhook Integration Documentation

This document explains the integration between The Backus Agency website forms and the n8n webhook endpoint, which connects to NocoDB for data storage.

## Overview

All website forms (contact and newsletter) now submit data directly to an n8n webhook endpoint instead of creating GitHub issues. The webhook can process this data and save it to a NocoDB database.

## Implementation Details

### Form Handler Updates

The `js/form-handler.js` file has been modified to:

1. Collect form data from all forms with the `data-form-type` attribute
2. Validate form fields (required fields and email format)
3. Add metadata:
   - `submitted_at`: Timestamp of submission
   - `form_type`: Type of form (contact or newsletter)
4. Submit data to the n8n webhook endpoint: `https://n8n.backus.agency/webhook/form_filled`
5. Show success or error messages to the user

### Affected Forms

1. **Contact Form**: Located on the contact page
   - Form ID: `contact-form`
   - Form Type: `contact`
   - Fields: firstName, lastName, email, phone, subject, message

2. **Newsletter Form**: Located in the footer of all pages
   - Form Type: `newsletter`
   - Fields: email

## Data Format

### Example Contact Form Submission

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "subject": "general",
  "message": "I'd like to learn more about your services.",
  "submitted_at": "2025-05-02T14:30:45.123Z",
  "form_type": "contact"
}
```

### Example Newsletter Form Submission

```json
{
  "email": "jane@example.com",
  "submitted_at": "2025-05-02T12:15:30.789Z",
  "form_type": "newsletter"
}
```

## n8n and NocoDB Integration

### Webhook Configuration

1. The n8n webhook endpoint is: `https://n8n.backus.agency/webhook/form_filled`
2. Method: POST
3. Content-Type: application/json

### NocoDB Node Configuration

A sample NocoDB node configuration is provided in `noco-node.json`:

```json
{
  "parameters": {
    "operation": "create",
    "projectId": {
      "__rl": true,
      "value": "YOUR_PROJECT_ID",
      "mode": "list",
      "cachedResultName": "YOUR_PROJECT_NAME"
    },
    "table": {
      "__rl": true,
      "value": "YOUR_TABLE_ID",
      "mode": "list",
      "cachedResultName": "form_submissions"
    },
    "options": {}
  },
  "name": "NocoDB",
  "type": "n8n-nodes-base.nocoDb",
  "typeVersion": 1,
  "position": [
    980,
    300
  ],
  "credentials": {
    "nocoDbApi": {
      "id": "YOUR_CREDENTIALS_ID",
      "name": "NocoDB API"
    }
  }
}
```

### Recommended NocoDB Table Structure

Create a table named `form_submissions` with the following fields:

| Field Name | Type | Description |
|------------|------|-------------|
| id | Auto-increment | Primary key |
| firstName | Text | First name of the person (contact form) |
| lastName | Text | Last name of the person (contact form) |
| email | Text | Email address |
| phone | Text | Phone number (contact form) |
| subject | Text | Subject (contact form) |
| message | Text | Message body (contact form) |
| submitted_at | DateTime | When the form was submitted |
| form_type | Text | "contact" or "newsletter" |

## n8n Workflow Setup

To complete the integration:

1. Create a new n8n workflow
2. Add a Webhook node as the trigger:
   - Method: POST
   - Path: `/form_filled`
   - Authentication: None (or add if needed)
   - Response Mode: Last Node

3. Add a NocoDB node:
   - Operation: Create
   - Connection: Your NocoDB API connection
   - Project: Your project
   - Table: `form_submissions`
   - Fields mapping:
     - Map all incoming fields from the webhook to the corresponding table fields

4. (Optional) Add a Respond to Webhook node:
   - Response Code: 200
   - Response Body: `{ "success": true, "message": "Form submission received" }`

## Testing

To test the integration:

1. Fill out the contact form on the website
2. Fill out the newsletter form
3. Check if data appears in the NocoDB table
4. Verify all fields are correctly mapped and stored

## Troubleshooting

If form submissions are not reaching the database:

1. Check browser console for JavaScript errors
2. Verify the webhook URL is correct and accessible
3. Check n8n execution logs for any errors
4. Verify NocoDB API credentials are valid
5. Check field mappings between form data and NocoDB table

For JavaScript errors on the form, see `js/form-handler.js` for the error handling implementation.