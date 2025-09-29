# n8n Hosting Options

This document outlines various options for hosting your n8n instance securely with SSL.

## Option 1: VPS Hosting with Docker (Recommended)

This is the most flexible option and gives you full control over your n8n instance.

### Requirements:
- A VPS (Virtual Private Server) from providers like DigitalOcean, Linode, Vultr, AWS EC2, etc.
- A domain name with DNS configured to point to your server
- Basic Linux knowledge

### Setup Process:
1. Set up DNS:
   - Create an A record for `n8n.backus.agency` pointing to your server's IP
   
2. Deploy using our script:
   - Upload `deploy-n8n-with-ssl.sh` to your server
   - Make it executable: `chmod +x deploy-n8n-with-ssl.sh`
   - Run it: `sudo ./deploy-n8n-with-ssl.sh`

The script will:
- Install Docker and Docker Compose
- Set up Traefik as a reverse proxy
- Configure automatic SSL certificates using Let's Encrypt
- Deploy n8n with PostgreSQL and Redis
- Configure automatic startup

### Pros:
- Full control over your instance
- Best performance
- No third-party reliance
- Automatic SSL renewal
- Database persistence

### Cons:
- Requires server management knowledge
- You are responsible for backups and updates

## Option 2: Railway or Render.com

These platforms offer simple deployment with automatic HTTPS.

### Railway Setup:
1. Sign up at [Railway.app](https://railway.app/)
2. Click "New Project" > "Deploy from GitHub"
3. Import your n8n project (or use a template)
4. Add a PostgreSQL database from the "New" button
5. Configure environment variables:
   - `N8N_BASIC_AUTH_ACTIVE`: true
   - `N8N_BASIC_AUTH_USER`: your-username
   - `N8N_BASIC_AUTH_PASSWORD`: your-password
   - `N8N_HOST`: your-railway-domain.up.railway.app (provided by Railway)
   - `N8N_PORT`: 5678
   - `N8N_PROTOCOL`: https
   - `DATABASE_URL`: ${{POSTGRESQL_URL}} (from the Railway PostgreSQL service)
6. Configure a custom domain in Railway settings

### Render.com Setup:
1. Sign up at [Render.com](https://render.com/)
2. Create a new Web Service
3. Link to GitHub repository with n8n code
4. Set build and start commands according to documentation
5. Add environment variables similar to Railway
6. Set up a custom domain in Settings

### Pros:
- Easy deployment
- Built-in SSL
- Less management overhead

### Cons:
- May have cold starts
- Limited by platform constraints
- Higher cost for persistent services

## Option 3: Cloudflare Tunnel with Local n8n

If you want to run n8n locally but make it accessible securely over the internet:

### Setup Process:
1. Install n8n locally:
   ```bash
   npm install n8n -g
   ```

2. Set up Cloudflare Tunnel:
   - Create a free Cloudflare account
   - Add your domain to Cloudflare
   - Install `cloudflared` on your local machine
   - Create a tunnel with:
     ```bash
     cloudflared tunnel create n8n
     ```
   - Configure tunnel:
     ```yaml
     # config.yml
     tunnel: (your-tunnel-id)
     credentials-file: /path/to/credentials.json
     ingress:
       - hostname: n8n.backus.agency
         service: http://localhost:5678
       - service: http_status:404
     ```
   - Start tunnel:
     ```bash
     cloudflared tunnel run n8n
     ```
   - Create DNS record in Cloudflare:
     ```bash
     cloudflared tunnel route dns n8n n8n.backus.agency
     ```

3. Run n8n locally:
   ```bash
   n8n start
   ```

### Pros:
- Run n8n on your local machine
- Free SSL certificates from Cloudflare
- No need for public IP address

### Cons:
- Depends on your local machine being online
- Performance limited by your internet connection
- More complex setup

## Option 4: Managed n8n Service

Use n8n.cloud, the official hosted version of n8n.

### Setup Process:
1. Sign up at [n8n.cloud](https://www.n8n.cloud/)
2. Create a new workspace
3. Configure your custom domain in settings
4. Follow their documentation for setting up DNS and SSL

### Pros:
- Fully managed service
- Official support
- Simple setup
- Regular updates and backups

### Cons:
- Monthly subscription cost
- Less control over the environment

## Conclusion

For the best combination of control, security, and ease of deployment, we recommend **Option 1: VPS Hosting with Docker**. This will give you a fully functional n8n instance with proper SSL certificates that will automatically renew.

The provided deployment script handles all aspects of the installation, including setting up a reverse proxy with Let's Encrypt SSL certificates for your domain.