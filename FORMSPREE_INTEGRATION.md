# Formspree Integration Documentation

## Overview
The Backus Agency website now uses **two consolidated Formspree forms** to handle all form submissions, saving money by reducing the number of form slots required.

## Project Details
- **Project ID**: 2837001675602918616
- **Deploy Key**: 033c22f1a3ca4a5d990c60b88367cab4

## Form Configuration

### 1. Security Forms (`security`)
Handles all security-related assessments and templates:
- Security Assessment Portal
- Intelligent Security Assessment
- Discovery Questions Template
- Security Roadmap Template
- Executive Proposal Template
- Statement of Work Template
- OT/Energy Assessment Template
- Authorization Letter Template
- Engagement Checklist Template
- Testing Methodology Template
- Outreach Email Template

### 2. Contact Forms (`contact`)
Handles all general contact and marketing forms:
- Contact Form ("Send Us a Message")
- Newsletter Subscription
- Get Started Request
- General Inquiries
- Demo Requests

## Files Updated

### Core Files
1. **`formspree.json`** - Configuration file with two form definitions
2. **`js/formspree-dual-handler.js`** - Universal form handler that routes submissions to the correct Formspree endpoint

### HTML Files with Form Handler Added
- `backus_security_portal.html`
- `backus_security_portal_enhanced.html`
- `backus_security_portal_formspree.html`
- `backus_security_portal_intelligent.html`
- `contact/index.html`

## How It Works

1. **Form Detection**: The handler automatically detects form type based on:
   - `data-form-type` attribute
   - Form ID or class names
   - Form field analysis

2. **Routing**: Forms are automatically routed to:
   - Security endpoint for all security-related forms
   - Contact endpoint for all other forms

3. **Metadata**: Each submission includes:
   - Form type identification
   - Timestamp
   - Source URL
   - Custom subject line

## Form Endpoints

✅ **Forms are now configured with the correct project-based endpoints:**

```javascript
// In js/formspree-dual-handler.js
const FORMSPREE_ENDPOINTS = {
    security: 'https://formspree.io/p/2837001675602918616/f/security',  // The Backus Agency Security Forms
    contact: 'https://formspree.io/p/2837001675602918616/f/contact'     // The Backus Agency Contact Forms
};
```

### Form Details:
- **Security Form**: Uses key `security` in the project
- **Contact Form**: Uses key `contact` in the project
- **Project ID**: `2837001675602918616`

## Testing

After updating the form IDs, test each form type:
1. Security assessment form
2. Contact form
3. Newsletter subscription
4. Get Started form

## Deployment Commands

```bash
# Deploy forms to Formspree
cd /c/Users/TBA/Documents/github/tba-static
formspree deploy

# Update form IDs in handler after getting them from dashboard
# Then test all forms
```

## Benefits
- **Cost Savings**: Only 2 Formspree forms instead of 13+
- **Unified Handler**: Single script handles all form types
- **Smart Routing**: Automatic detection and routing
- **Better Organization**: Security forms separate from contact forms
- **Easy Maintenance**: Update endpoints in one place

## Support
For issues or questions, contact support@backus.agency