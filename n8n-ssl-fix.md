# Quick SSL Fix for n8n

If you need a quick fix while setting up proper SSL certificates, you can configure n8n to accept self-signed certificates:

## Option 1: Allow Insecure Certificates in Webhook Node

In each of your n8n webhook nodes, you can allow insecure certificates:

1. Edit the Webhook node that's connecting to your site
2. In the "Options" section, enable "Allow Self-Signed Certificates"

For programmatic setup, edit your `webhook-node.json` to include:

```json
{
  "parameters": {
    "options": {
      "allowUnauthorizedCerts": true,
      ...
    },
    ...
  },
  ...
}
```

## Option 2: Set Environment Variables for n8n

If you're running n8n with Docker, add this environment variable to your docker-compose.yml:

```yaml
environment:
  - NODE_TLS_REJECT_UNAUTHORIZED=0
```

If running directly:

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

## Option 3: Use HTTP Instead of HTTPS for Testing

While not recommended for production, you can temporarily use HTTP for testing:

1. Change all your website forms to submit to `http://n8n.backus.agency/webhook/form_filled` (remove 's' from https)
2. Ensure your n8n server is accessible via HTTP

## Important Security Note

Options 1 and 2 above disable SSL verification, which is NOT recommended for production use. These are temporary solutions while you set up proper SSL certificates following the main SSL setup guide.

For a permanent solution, please follow the steps in the main SSL setup guide to install a proper certificate from Let's Encrypt.