# n8n SSL Implementation Guide

This repository contains all the necessary files and instructions to set up a secure n8n instance with SSL for your form handling needs.

## Overview

The Backus Agency website forms need to submit data to an n8n webhook which then integrates with NocoDB. This setup requires a proper SSL configuration to avoid the `DEPTH_ZERO_SELF_SIGNED_CERT` error.

## Quick Start

For the fastest path to a working solution:

1. **Set up a DigitalOcean Droplet** following the [DigitalOcean Setup Guide](DIGITALOCEAN-SETUP.md)
2. **Configure DNS** to point n8n.backus.agency to your server
3. **Run the deployment script** to install n8n with Let's Encrypt SSL
4. **Update your forms** to use the new webhook URL
5. **Test your setup** using the [Testing Guide](TESTING-GUIDE.md)

## Files Included

| File | Description |
|------|-------------|
| `deploy-n8n-with-ssl.sh` | Main deployment script for setting up n8n with SSL |
| `DIGITALOCEAN-SETUP.md` | Step-by-step guide for DigitalOcean deployment |
| `N8N-HOSTING-OPTIONS.md` | Overview of various hosting options for n8n |
| `nginx-n8n-config.conf` | Nginx configuration if you prefer Nginx over Traefik |
| `docker-compose-n8n-ssl.yml` | Docker Compose configuration for n8n |
| `n8n-workflow.json` | The workflow configuration for form handling |
| `webhook-node.json` | Configuration for the webhook node in n8n |
| `noco-node.json` | Configuration for the NocoDB integration node |
| `TESTING-GUIDE.md` | Guide for testing your deployment |
| `dns-setup-guide.md` | Instructions for setting up DNS records |

## Implementation Steps

### 1. Choose Your Hosting Option

Review the [N8N Hosting Options](N8N-HOSTING-OPTIONS.md) document to choose the best approach for your needs. We recommend:

- **DigitalOcean Droplet** for the best balance of cost, control, and simplicity
- **Railway/Render** if you prefer a managed platform
- **Cloudflare Tunnel** if you want to run n8n locally

### 2. Set Up DNS

Configure your DNS settings according to the [DNS Setup Guide](dns-setup-guide.md):

```
Type: A
Host: n8n
Value: [YOUR_SERVER_IP]
```

### 3. Deploy n8n with SSL

Follow the instructions in either:
- [DigitalOcean Setup Guide](DIGITALOCEAN-SETUP.md) for DigitalOcean deployment
- Or use the `deploy-n8n-with-ssl.sh` script on your own server

### 4. Import Workflow

After deploying n8n:
1. Log in to your n8n instance
2. Go to "Workflows" and click "Import from File"
3. Upload the `n8n-workflow.json` file
4. Update the NocoDB node with your credentials

### 5. Update Forms

Update all your website forms to submit to:
```
https://n8n.backus.agency/webhook/form_filled
```

### 6. Test Your Implementation

Follow the [Testing Guide](TESTING-GUIDE.md) to verify:
- SSL certificate is valid
- Forms can submit data
- NocoDB integration works

## SSL Certificate Details

The deployment uses Let's Encrypt for free, trusted SSL certificates that:
- Are valid for 90 days with automatic renewal
- Are trusted by all major browsers
- Provide full encryption for form submissions
- Resolve the `DEPTH_ZERO_SELF_SIGNED_CERT` error

## Maintenance

### Backups

Regularly backup your n8n data:

```bash
# SSH into your server
cd /opt/n8n
docker-compose exec -T n8n n8n export:workflow --all > n8n-backup-$(date +%F).json
```

### Updates

Update your n8n installation:

```bash
# SSH into your server
cd /opt/n8n
docker-compose pull
docker-compose up -d
```

### SSL Certificate Renewal

Let's Encrypt certificates will automatically renew as long as your server is running. To check status:

```bash
# SSH into your server
sudo certbot certificates
```

## Troubleshooting

See the [Testing Guide](TESTING-GUIDE.md) for detailed troubleshooting steps.

Common issues:
- DNS configuration problems
- Firewall blocking ports 80/443
- Incorrect webhook URL in forms
- CORS issues

## Security Considerations

This setup includes:
- HTTPS encryption for all traffic
- Automatic HTTP to HTTPS redirection
- Basic authentication for n8n access
- Database password protection
- Firewall configuration

For enhanced security:
- Change default passwords
- Limit SSH access
- Enable backups
- Keep your server updated

## Support

If you encounter any issues with this implementation, please:
1. Check the troubleshooting section in the Testing Guide
2. Review logs on your n8n server
3. Check for any browser console errors
4. Contact support@backus.agency for assistance