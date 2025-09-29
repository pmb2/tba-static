# SSL Certificate Setup Guide for n8n

This guide will help you set up a proper SSL certificate for your n8n instance using Let's Encrypt, which provides free, trusted certificates.

## Prerequisites

- A registered domain name pointing to your server (n8n.backus.agency)
- SSH access to your server
- Root/sudo privileges

## Option 1: Using Certbot (Recommended)

### 1. Install Certbot

**For Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install certbot
```

**For CentOS/RHEL:**
```bash
sudo yum install certbot
```

### 2. Obtain the Certificate

If you're using Nginx:
```bash
sudo apt install python3-certbot-nginx
sudo certbot --nginx -d n8n.backus.agency
```

If you're using Apache:
```bash
sudo apt install python3-certbot-apache
sudo certbot --apache -d n8n.backus.agency
```

If you're not using a supported web server:
```bash
sudo certbot certonly --standalone -d n8n.backus.agency
```

### 3. Configure Your Web Server

If you used the `--nginx` or `--apache` options, Certbot should have configured your web server automatically.

If you used the standalone option, you'll need to configure your web server manually to use the new certificates:

**For Nginx:**
```nginx
server {
    listen 443 ssl;
    server_name n8n.backus.agency;

    ssl_certificate /etc/letsencrypt/live/n8n.backus.agency/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/n8n.backus.agency/privkey.pem;

    # Other SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;

    # Proxy to your n8n instance
    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name n8n.backus.agency;
    return 301 https://$host$request_uri;
}
```

**For Apache:**
```apache
<VirtualHost *:443>
    ServerName n8n.backus.agency

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/n8n.backus.agency/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/n8n.backus.agency/privkey.pem

    ProxyPass / http://localhost:5678/
    ProxyPassReverse / http://localhost:5678/
</VirtualHost>

<VirtualHost *:80>
    ServerName n8n.backus.agency
    Redirect permanent / https://n8n.backus.agency/
</VirtualHost>
```

### 4. Test Your Configuration and Restart

**For Nginx:**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

**For Apache:**
```bash
sudo apachectl configtest
sudo systemctl restart apache2
```

### 5. Set Up Auto-Renewal

Let's Encrypt certificates expire after 90 days. Set up automatic renewal:

```bash
sudo certbot renew --dry-run
```

Then add a cron job to run renewal twice daily:

```bash
echo "0 0,12 * * * root certbot renew --quiet" | sudo tee -a /etc/crontab > /dev/null
```

## Option 2: Using Cloudflare (Alternative)

If your domain is using Cloudflare for DNS, you can use Cloudflare's SSL:

1. Sign up for Cloudflare and add your domain
2. In the Cloudflare dashboard, go to SSL/TLS and set the mode to "Full" or "Full (strict)"
3. Use Cloudflare's origin certificates or continue using your self-signed cert (Cloudflare will handle the SSL termination)

## Updating n8n Configuration

If you're running n8n with Docker, update your docker-compose.yml or docker run command to use the new certificates:

```yaml
version: '3'
services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_PROTOCOL=https
      - N8N_SSL_CERT=/data/certs/cert.pem
      - N8N_SSL_KEY=/data/certs/key.pem
    volumes:
      - ./n8n_data:/home/node/.n8n
      - /etc/letsencrypt/live/n8n.backus.agency:/data/certs:ro
```

If you're running n8n directly, update your startup command or configuration file to use the new certificates.

## Testing Your SSL Configuration

After setting up your certificates, test your SSL configuration with these tools:
- https://www.ssllabs.com/ssltest/
- https://www.digitalocean.com/community/tools/ssl

These will give you a detailed report of your SSL implementation and suggest improvements.