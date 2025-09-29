#!/bin/bash
# Let's Encrypt SSL Certificate Setup Script for n8n
# This script sets up a proper SSL certificate for your n8n instance
# Run with sudo bash setup-letsencrypt.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run as root (use sudo)${NC}"
  exit 1
fi

# Configuration
DOMAIN="n8n.backus.agency"
EMAIL="support@backus.agency"  # Change this to your email
N8N_PORT="5678"  # Default n8n port, change if needed

# Detect web server
echo -e "${YELLOW}Detecting installed web server...${NC}"
if command -v nginx &> /dev/null; then
  WEB_SERVER="nginx"
  echo -e "${GREEN}Nginx detected${NC}"
elif command -v apache2 &> /dev/null; then
  WEB_SERVER="apache"
  echo -e "${GREEN}Apache detected${NC}"
else
  WEB_SERVER="none"
  echo -e "${YELLOW}No web server detected, will use standalone mode${NC}"
fi

# Install Certbot and web server plugin if needed
echo -e "${YELLOW}Installing Certbot and dependencies...${NC}"
apt-get update
apt-get install -y certbot

# Install web server specific plugin
if [ "$WEB_SERVER" == "nginx" ]; then
  apt-get install -y python3-certbot-nginx
elif [ "$WEB_SERVER" == "apache" ]; then
  apt-get install -y python3-certbot-apache
fi

# Stop web server temporarily if using standalone mode
if [ "$WEB_SERVER" == "none" ]; then
  echo -e "${YELLOW}Using standalone mode, checking if port 80 is in use...${NC}"
  if lsof -i :80 > /dev/null; then
    echo -e "${YELLOW}Port 80 is in use. Please stop any service using port 80 before continuing.${NC}"
    read -p "Press Enter to continue once services are stopped, or Ctrl+C to exit..."
  fi
  
  # Run Certbot in standalone mode
  echo -e "${YELLOW}Obtaining certificate with standalone mode...${NC}"
  certbot certonly --standalone --non-interactive --agree-tos --email "$EMAIL" -d "$DOMAIN"
else
  # Run Certbot with web server plugin
  echo -e "${YELLOW}Obtaining certificate with $WEB_SERVER plugin...${NC}"
  if [ "$WEB_SERVER" == "nginx" ]; then
    certbot --nginx --non-interactive --agree-tos --email "$EMAIL" -d "$DOMAIN"
  elif [ "$WEB_SERVER" == "apache" ]; then
    certbot --apache --non-interactive --agree-tos --email "$EMAIL" -d "$DOMAIN"
  fi
fi

# Verify certificate was obtained
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
  echo -e "${GREEN}Certificate successfully obtained!${NC}"
else
  echo -e "${RED}Failed to obtain certificate. Check the output above for errors.${NC}"
  exit 1
fi

# If no web server, create a configuration file
if [ "$WEB_SERVER" == "none" ]; then
  echo -e "${YELLOW}No web server detected. If you need to configure a web server, use these certificate locations:${NC}"
  echo -e "Certificate: /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
  echo -e "Private key: /etc/letsencrypt/live/$DOMAIN/privkey.pem"
  
  # Instructions for setting up n8n with the certificates
  echo -e "\n${YELLOW}To configure n8n with these certificates:${NC}"
  
  # For Docker setup
  echo -e "\n${GREEN}If using Docker:${NC}"
  echo "Update your docker-compose.yml with these settings:"
  cat <<EOF
version: '3'
services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "443:5678"
    environment:
      - N8N_PROTOCOL=https
      - N8N_SSL_CERT=/data/certs/fullchain.pem
      - N8N_SSL_KEY=/data/certs/privkey.pem
    volumes:
      - ./n8n_data:/home/node/.n8n
      - /etc/letsencrypt/live/$DOMAIN:/data/certs:ro
EOF

  # For direct installation
  echo -e "\n${GREEN}If using direct installation:${NC}"
  echo "Start n8n with these parameters:"
  echo "n8n start --ssl-cert /etc/letsencrypt/live/$DOMAIN/fullchain.pem --ssl-key /etc/letsencrypt/live/$DOMAIN/privkey.pem"
fi

# Set up auto-renewal
echo -e "\n${YELLOW}Setting up automatic certificate renewal...${NC}"
certbot renew --dry-run

# Create a systemd service for n8n if it doesn't exist and not using Docker
if ! systemctl list-unit-files | grep -q n8n.service && [ "$WEB_SERVER" == "none" ]; then
  echo -e "${YELLOW}Would you like to create a systemd service for n8n? (y/n)${NC}"
  read -r CREATE_SERVICE
  
  if [[ "$CREATE_SERVICE" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Creating systemd service for n8n...${NC}"
    
    # Check if user n8n exists, if not create it
    if ! id "n8n" &>/dev/null; then
      echo -e "${YELLOW}Creating user n8n...${NC}"
      useradd -m -d /home/n8n -s /bin/bash n8n
    fi
    
    # Create a systemd service file
    cat > /etc/systemd/system/n8n.service <<EOF
[Unit]
Description=n8n workflow automation
After=network.target

[Service]
Type=simple
User=n8n
WorkingDirectory=/home/n8n
ExecStart=/usr/bin/env n8n start --ssl-cert /etc/letsencrypt/live/$DOMAIN/fullchain.pem --ssl-key /etc/letsencrypt/live/$DOMAIN/privkey.pem
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

    # Set proper permissions for certificates
    mkdir -p /etc/letsencrypt/renewal-hooks/deploy
    cat > /etc/letsencrypt/renewal-hooks/deploy/n8n-cert-permissions.sh <<EOF
#!/bin/bash
# Set proper permissions for n8n to read the certificates
chmod 755 /etc/letsencrypt/live
chmod 755 /etc/letsencrypt/archive
EOF
    chmod +x /etc/letsencrypt/renewal-hooks/deploy/n8n-cert-permissions.sh
    
    # Run the permission script
    bash /etc/letsencrypt/renewal-hooks/deploy/n8n-cert-permissions.sh
    
    # Enable and start the service
    systemctl daemon-reload
    systemctl enable n8n
    systemctl start n8n
    
    echo -e "${GREEN}n8n service created and started!${NC}"
  fi
fi

# Add a cron job for certificate renewal if not already exists
if ! crontab -l | grep -q "certbot renew"; then
  echo -e "${YELLOW}Adding a cron job for certificate renewal...${NC}"
  (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -
  echo -e "${GREEN}Cron job added to run daily at 3 AM${NC}"
fi

echo -e "\n${GREEN}SSL certificate setup complete!${NC}"
echo -e "${GREEN}Your domain $DOMAIN is now secured with a Let's Encrypt certificate.${NC}"
echo -e "${GREEN}The certificate will automatically renew before it expires.${NC}"