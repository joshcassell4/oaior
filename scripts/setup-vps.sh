#!/bin/bash

# VPS Setup Script for Open AI Outreach
# Run this on a fresh Ubuntu VPS to set up the environment

set -e

echo "=== VPS Setup Script for Open AI Outreach ==="
echo

# Update system
echo "Updating system packages..."
sudo apt update
sudo apt upgrade -y

# Install required packages
echo "Installing required packages..."
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw

# Install Docker
echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure firewall
echo "Configuring firewall..."
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw --force enable

# Create application directory
echo "Creating application directory..."
sudo mkdir -p /opt/openai-outreach
sudo chown $USER:$USER /opt/openai-outreach

# Clone repository (replace with your actual repo URL)
echo "Cloning repository..."
cd /opt/openai-outreach
# git clone https://github.com/yourusername/landingoaior.git .

echo
echo "=== Setup Complete ==="
echo
echo "Next steps:"
echo "1. Clone your repository to /opt/openai-outreach"
echo "2. Configure your .env file"
echo "3. Run the deploy.sh script"
echo "4. Configure your domain DNS to point to this server"
echo "5. Set up SSL with Let's Encrypt"
echo
echo "IMPORTANT: Log out and back in for Docker group changes to take effect"