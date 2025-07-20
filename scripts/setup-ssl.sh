#!/bin/bash

# SSL Setup Script using Let's Encrypt
# Run this after deploying the application

set -e

echo "=== SSL Setup Script ==="
echo

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Get domain name
read -p "Enter your domain name (e.g., example.com): " DOMAIN
read -p "Enter your email for Let's Encrypt notifications: " EMAIL

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Stop nginx container to free port 80
echo "Stopping Nginx container..."
docker-compose down nginx

# Obtain certificate
echo "Obtaining SSL certificate..."
certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive

# Update nginx configuration
echo "Updating Nginx configuration..."
sed -i "s/yourdomain.com/$DOMAIN/g" nginx/nginx.ssl.conf

# Copy SSL config to be used
cp nginx/nginx.ssl.conf nginx/nginx.conf

# Start containers with SSL
echo "Starting containers with SSL..."
docker-compose -f docker-compose.prod.yml up -d

# Set up auto-renewal
echo "Setting up auto-renewal..."
cat > /etc/cron.d/certbot-renewal << EOF
0 0,12 * * * root certbot renew --pre-hook "docker-compose -f /opt/openai-outreach/docker-compose.prod.yml down nginx" --post-hook "docker-compose -f /opt/openai-outreach/docker-compose.prod.yml up -d nginx" >> /var/log/letsencrypt/renewal.log 2>&1
EOF

echo
echo "=== SSL Setup Complete ==="
echo
echo "Your site is now available at:"
echo "https://$DOMAIN"
echo "https://www.$DOMAIN"
echo
echo "SSL certificates will auto-renew every 12 hours"