# n8n SSL Installation Guide

This guide provides a step-by-step approach to setting up a secure SSL configuration for your n8n server using Let's Encrypt.

## Prerequisites

- A domain name pointing to your server (n8n.backus.agency)
- SSH access to your server with root/sudo privileges
- Basic understanding of Linux commands

## Option 1: Automatic Installation (Recommended)

We've created an automated script that handles the entire SSL certificate installation process.

### Step 1: Copy the Setup Script to Your Server

```bash
scp setup-letsencrypt.sh user@your-server:/tmp/
```

### Step 2: Run the Script as Root/Sudo

```bash
ssh user@your-server
cd /tmp
chmod +x setup-letsencrypt.sh
sudo ./setup-letsencrypt.sh
```

The script will:
1. Install Certbot
2. Obtain a Let's Encrypt SSL certificate
3. Configure auto-renewal
4. Provide guidance based on your server configuration
5. Optionally create a systemd service for n8n

## Option 2: Manual Installation

If you prefer to do the setup manually, follow these steps.

### Step 1: Install Certbot

```bash
sudo apt update
sudo apt install certbot
```

### Step 2: Obtain the SSL Certificate

#### Using Standalone Mode
If you don't have a web server running:

```bash
sudo certbot certonly --standalone -d n8n.backus.agency
```

#### Using Nginx
If you have Nginx running:

```bash
sudo apt install python3-certbot-nginx
sudo certbot --nginx -d n8n.backus.agency
```

#### Using Apache
If you have Apache running:

```bash
sudo apt install python3-certbot-apache
sudo certbot --apache -d n8n.backus.agency
```

### Step 3: Configure Your Web Server

#### For Nginx

Copy our optimized Nginx configuration:

```bash
sudo cp nginx-n8n-config.conf /etc/nginx/sites-available/n8n.conf
sudo ln -s /etc/nginx/sites-available/n8n.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### For Apache

Create a configuration file:

```bash
sudo nano /etc/apache2/sites-available/n8n.conf
```

Add this content:

```apache
<VirtualHost *:443>
    ServerName n8n.backus.agency

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/n8n.backus.agency/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/n8n.backus.agency/privkey.pem

    ProxyPass / http://localhost:5678/
    ProxyPassReverse / http://localhost:5678/
    
    # Add WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)  ws://localhost:5678/$1 [P,L]
</VirtualHost>

<VirtualHost *:80>
    ServerName n8n.backus.agency
    Redirect permanent / https://n8n.backus.agency/
</VirtualHost>
```

Enable the configuration:

```bash
sudo a2ensite n8n.conf
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite ssl
sudo systemctl restart apache2
```

### Step 4: Set Up Auto-Renewal

```bash
sudo certbot renew --dry-run
echo "0 3 * * * root certbot renew --quiet" | sudo tee -a /etc/crontab > /dev/null
```

## Option 3: Docker-Based Installation

If you prefer using Docker:

### Step 1: Obtain the SSL Certificate

First, stop any existing Docker containers using port 80:

```bash
sudo docker stop $(sudo docker ps -q -f "publish=80")
```

Then obtain the certificate:

```bash
sudo certbot certonly --standalone -d n8n.backus.agency
```

### Step 2: Create Docker Compose File

Copy our Docker Compose template:

```bash
sudo mkdir -p /opt/n8n
sudo cp docker-compose-n8n-ssl.yml /opt/n8n/docker-compose.yml
```

### Step 3: Edit Docker Compose Configuration

```bash
sudo nano /opt/n8n/docker-compose.yml
```

Change the following parameters:
- `N8N_BASIC_AUTH_PASSWORD`: Set a strong password
- `N8N_ENCRYPTION_KEY`: Set a random string
- `POSTGRES_PASSWORD`: Set a strong password for the database
- `redis.command`: Change the Redis password

### Step 4: Start the n8n Service

```bash
cd /opt/n8n
sudo docker-compose up -d
```

## Verification

After installation is complete, verify your configuration:

1. Visit your n8n instance at `https://n8n.backus.agency`
2. Check the certificate using your browser's security information
3. Verify the certificate details show "Let's Encrypt" as the issuer

## Testing Your Forms

After setting up the SSL certificate, test your forms with the new secure endpoint:

1. The webhook URL in your forms should be `https://n8n.backus.agency/webhook/form_filled`
2. Create a test submission and verify the data appears in NocoDB

## Troubleshooting

### Certificate Issues

If Certbot fails to obtain a certificate:
- Ensure your domain points to the correct server IP
- Check that port 80 is open in your firewall
- Verify DNS propagation with: `dig n8n.backus.agency`

### Connection Issues

If you get connection errors:
- Check the n8n logs: `sudo docker logs n8n` or `sudo journalctl -u n8n`
- Verify the SSL certificate paths are correct
- Ensure firewall settings allow connections on ports 80 and 443

### Form Submission Problems

If form submissions fail:
- Check browser console for errors
- Verify CORS headers are correctly set
- Ensure the webhook path matches exactly in both form and n8n

## Regular Maintenance

Let's Encrypt certificates expire after 90 days. The auto-renewal should handle this, but periodically check that:

1. Renewals are happening automatically
2. The renewed certificates are being used by n8n
3. The service restarts properly after certificate renewal

## Security Best Practices

For enhanced security:
- Enable rate limiting in your web server
- Consider adding IP restrictions for admin access
- Regularly update n8n and your operating system
- Use long, random passwords for all services