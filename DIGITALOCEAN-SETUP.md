# Quick n8n Setup on DigitalOcean with SSL

This guide provides step-by-step instructions to set up n8n with SSL on a DigitalOcean Droplet.

## Step 1: Create a DigitalOcean Droplet

1. Sign up for DigitalOcean at https://www.digitalocean.com/
2. Create a new Droplet with these specifications:
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Basic Plan ($12/month, 2GB RAM / 1 CPU)
   - **Region**: Choose one close to your target audience
   - **Authentication**: SSH keys (recommended) or Password
   - **Hostname**: n8n-server

## Step 2: Set Up DNS

1. Go to your domain registrar (where backus.agency is registered)
2. Add an A record:
   - **Type**: A
   - **Host**: n8n
   - **Value**: Your DigitalOcean Droplet IP address
   - **TTL**: 3600 (or default)

3. Wait for DNS propagation (can take up to 24 hours, but often just minutes)

## Step 3: Connect to Your Droplet

Using SSH (replace `your-ip` with your actual Droplet IP):

```bash
ssh root@your-ip
```

## Step 4: Deploy n8n with SSL

1. Update your system:

```bash
apt update && apt upgrade -y
```

2. Create deployment script:

```bash
nano deploy.sh
```

3. Paste the contents of `deploy-n8n-with-ssl.sh` into the editor

4. Edit the configuration section at the top:
   - Ensure `DOMAIN="n8n.backus.agency"`
   - Change `EMAIL` to your email
   - Set a strong `PASSWORD`

5. Save the file (Ctrl+O, then Enter, then Ctrl+X)

6. Make it executable and run it:

```bash
chmod +x deploy.sh
./deploy.sh
```

7. The script will install and configure:
   - Docker and Docker Compose
   - Traefik as a reverse proxy
   - Let's Encrypt SSL certificates
   - n8n with PostgreSQL and Redis
   - All necessary security settings

## Step 5: Access Your n8n Instance

1. After the script completes (about 5-10 minutes), open your browser and go to:
   ```
   https://n8n.backus.agency
   ```

2. Log in with the credentials you set in the script:
   - Username: n8n (or what you specified)
   - Password: (what you specified in the script)

## Step 6: Set Up Your n8n Workflow

1. In n8n, go to "Workflows" and click "Import from File"
2. Upload the `n8n-workflow.json` file from this repository
3. After importing, activate the workflow by toggling the "Active" switch

## Step 7: Update Your Website Forms

1. Ensure all forms on your website use this webhook URL:
   ```
   https://n8n.backus.agency/webhook/form_filled
   ```

2. Test the form submission to verify everything works

## Step 8: Regular Maintenance

The setup includes:
- Automatic SSL certificate renewal
- Automatic container restarts on server reboot
- Persistent database storage

For backup and monitoring:

```bash
# Backup your workflows
cd /opt/n8n
docker-compose exec -T n8n n8n export:workflow --all > n8n-backup-$(date +%F).json

# View logs
docker-compose logs -f n8n
```

## Troubleshooting

### SSL Certificate Issues

If you have problems with the SSL certificate:

```bash
# Check Traefik logs
docker logs traefik
```

### Connection Problems

If you can't connect to your n8n instance:

```bash
# Check if containers are running
docker ps

# Restart if needed
cd /opt/n8n
docker-compose restart
```

### Firewall Issues

Ensure ports 80 and 443 are open:

```bash
ufw status
ufw allow 80/tcp
ufw allow 443/tcp
```

## Cost Estimate

- DigitalOcean Droplet: $12/month (2GB RAM)
- Domain name: Already owned
- SSL Certificate: Free with Let's Encrypt

This solution provides a professional, secure, and reliable n8n instance with proper SSL certificates.