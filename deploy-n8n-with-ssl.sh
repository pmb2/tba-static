#!/bin/bash
# Comprehensive n8n deployment script with SSL
# Run on a fresh Ubuntu server with root access
# Usage: bash deploy-n8n-with-ssl.sh

set -e

# Colored output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration - CHANGE THESE VALUES
DOMAIN="n8n.backus.agency"
EMAIL="support@backus.agency"
USERNAME="n8n"
PASSWORD="change-this-to-a-secure-password"  # Change this!
N8N_PORT=5678

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root (use sudo)${NC}"
  exit 1
fi

echo -e "${YELLOW}Starting n8n deployment with SSL for $DOMAIN${NC}"

# Update system
echo -e "${YELLOW}Updating system packages...${NC}"
apt update
apt upgrade -y

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
apt install -y curl wget git software-properties-common apt-transport-https ca-certificates gnupg lsb-release unzip nginx certbot python3-certbot-nginx

# Install Docker
echo -e "${YELLOW}Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o get-docker.sh
  sh get-docker.sh
  usermod -aG docker $USER
else
  echo "Docker already installed"
fi

# Install Docker Compose
echo -e "${YELLOW}Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
  curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
  ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
else
  echo "Docker Compose already installed"
fi

# Configure firewall
echo -e "${YELLOW}Configuring firewall...${NC}"
apt install -y ufw
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Set up n8n directory
echo -e "${YELLOW}Setting up n8n directory...${NC}"
mkdir -p /opt/n8n
cd /opt/n8n

# Create strong encryption key
ENCRYPTION_KEY=$(openssl rand -hex 24)

# Create docker-compose.yml
echo -e "${YELLOW}Creating docker-compose.yml...${NC}"
cat > /opt/n8n/docker-compose.yml <<EOL
version: '3'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    command:
      - "--api.dashboard=true"
      - "--api.insecure=false"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.email=${EMAIL}"
      - "--certificatesresolvers.letsencrypt.acme.storage=/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-data:/acme.json
    networks:
      - n8n-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(\`traefik.${DOMAIN}\`)"
      - "traefik.http.routers.dashboard.service=api@internal"
      - "traefik.http.routers.dashboard.entrypoints=websecure"
      - "traefik.http.routers.dashboard.middlewares=auth"
      - "traefik.http.middlewares.auth.basicauth.users=${USERNAME}:$(htpasswd -nb $USERNAME $PASSWORD | sed -e s/\\$/\\$\\$/g)"
      - "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${USERNAME}
      - N8N_BASIC_AUTH_PASSWORD=${PASSWORD}
      - N8N_HOST=${DOMAIN}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - N8N_ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - NODE_ENV=production
      - N8N_EMAIL_MODE=smtp
      - N8N_SMTP_HOST=smtp.gmail.com
      - N8N_SMTP_PORT=465
      - N8N_SMTP_USER=support@backus.agency
      - N8N_SMTP_PASS=your-app-password  # Change this to your actual SMTP password
      - N8N_SMTP_SENDER=support@backus.agency
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${PASSWORD}
      - WEBHOOK_TUNNEL_URL=https://${DOMAIN}/
      - EXECUTIONS_PROCESS=main
      - GENERIC_TIMEZONE=America/New_York  # Change to your timezone
    volumes:
      - n8n-data:/home/node/.n8n
    networks:
      - n8n-network
    depends_on:
      - postgres
      - redis
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(\`${DOMAIN}\`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"

  postgres:
    image: postgres:15-alpine
    container_name: n8n-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=${PASSWORD}
      - POSTGRES_DB=n8n
      - POSTGRES_NON_ROOT_USER=n8n_user
      - POSTGRES_NON_ROOT_PASSWORD=${PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: n8n-redis
    restart: unless-stopped
    command: --requirepass ${PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - n8n-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

networks:
  n8n-network:
    driver: bridge

volumes:
  traefik-data:
    driver: local
  n8n-data:
    driver: local
  postgres-data:
    driver: local
  redis-data:
    driver: local
EOL

# Create .env file for storing sensitive information
cat > /opt/n8n/.env <<EOL
N8N_ENCRYPTION_KEY=${ENCRYPTION_KEY}
N8N_USER=${USERNAME}
N8N_PASS=${PASSWORD}
EOL
chmod 600 /opt/n8n/.env

# Start the containers
echo -e "${YELLOW}Starting n8n with Docker Compose...${NC}"
cd /opt/n8n
docker-compose up -d

# Wait for services to start
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 30

# Create a systemd service for automatic startup
echo -e "${YELLOW}Creating systemd service...${NC}"
cat > /etc/systemd/system/n8n.service <<EOL
[Unit]
Description=n8n Docker Service
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/n8n
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOL

# Enable and start the service
systemctl daemon-reload
systemctl enable n8n
systemctl start n8n

# Final message
echo -e "${GREEN}n8n has been deployed successfully with SSL!${NC}"
echo -e "${GREEN}You can access it at https://${DOMAIN}${NC}"
echo -e "${YELLOW}Username: ${USERNAME}${NC}"
echo -e "${YELLOW}Password: ${PASSWORD}${NC}"
echo -e "${RED}IMPORTANT: Please change the default password in docker-compose.yml and restart the service.${NC}"
echo -e "${GREEN}The SSL certificate has been obtained automatically through Let's Encrypt.${NC}"
echo -e "${GREEN}It will automatically renew when needed.${NC}"

# Display information for next steps
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Visit https://${DOMAIN} to access your n8n instance"
echo -e "2. Update your forms to submit to https://${DOMAIN}/webhook/form_filled"
echo -e "3. Import your workflow by uploading the n8n-workflow.json file"

echo -e "\n${YELLOW}Backup Commands:${NC}"
echo -e "To backup n8n: docker-compose exec -T n8n n8n export:workflow --all > n8n-backup-\$(date +%F).json"
echo -e "To restart n8n: cd /opt/n8n && docker-compose restart"
echo -e "To view logs: cd /opt/n8n && docker-compose logs -f n8n"