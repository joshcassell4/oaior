# Production Deployment Guide

This guide covers deploying the OpenAI Outreach application to production using Docker Compose on a Linux server.

## Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Docker Engine 20.10+ and Docker Compose 2.0+
- Domain name pointed to your server's IP
- SSH access to the server with sudo privileges
- At least 2GB RAM and 20GB storage

## Initial Server Setup

### 1. Update System and Install Dependencies

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for docker group to take effect
exit
```

### 2. Configure Firewall

```bash
# Enable UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## Application Deployment

### 1. Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/openai-outreach
sudo chown $USER:$USER /opt/openai-outreach

# Clone repository
cd /opt/openai-outreach
git clone https://github.com/yourusername/landingoaior.git .
```

### 2. Create Production Configuration

Create `.env` file for production secrets:

```bash
# Create production environment file
cat > .env << 'EOF'
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=$(openssl rand -hex 32)
PORT=8000

# MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=$(openssl rand -base64 32)
MONGO_INITDB_DATABASE=openai_outreach
MONGODB_URI=mongodb://admin:$(openssl rand -base64 32)@mongodb:27017/openai_outreach?authSource=admin

# Application Settings
ENABLE_API=true
LOG_LEVEL=INFO

# Domain Configuration
DOMAIN_NAME=yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
EOF

# Secure the environment file
chmod 600 .env
```

### 3. Create Production Docker Compose File

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: openai_outreach_mongodb
    restart: always
    volumes:
      - mongodb_data:/data/db
      - ./backups:/backups
    env_file:
      - .env
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_INITDB_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_INITDB_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=${MONGO_INITDB_DATABASE}
    networks:
      - app-network
    command: mongod --auth
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet -u ${MONGO_INITDB_ROOT_USERNAME} -p ${MONGO_INITDB_ROOT_PASSWORD} --authenticationDatabase admin
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  backend:
    build: 
      context: .
      dockerfile: Dockerfile
    container_name: openai_outreach_backend
    restart: always
    env_file:
      - .env
    environment:
      - FLASK_ENV=production
      - PORT=8000
      - MONGODB_URI=${MONGODB_URI}
    networks:
      - app-network
    depends_on:
      mongodb:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: production
    container_name: openai_outreach_frontend
    restart: always
    networks:
      - app-network
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    container_name: openai_outreach_nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/www/certbot:/var/www/certbot:ro
    depends_on:
      frontend:
        condition: service_started
      backend:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  app-network:
    driver: bridge

volumes:
  mongodb_data:
    driver: local
```

### 4. Create Production Nginx Configuration

Create `nginx/nginx.prod.conf`:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=50r/s;

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/rss+xml application/atom+xml application/json image/svg+xml;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';" always;
    
    # Request size limits
    client_max_body_size 10M;
    client_body_buffer_size 128k;
    
    # API routes with rate limiting
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        limit_req_status 429;
        
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials true always;
        
        # Handle preflight
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin $http_origin always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
            add_header Access-Control-Allow-Credentials true always;
            add_header Access-Control-Max-Age 86400;
            add_header Content-Length 0;
            add_header Content-Type text/plain;
            return 204;
        }
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://backend:8000/health;
        access_log off;
    }

    # Legacy endpoints
    location ~ ^/(contacts|affirmations|game)/ {
        limit_req zone=general_limit burst=10 nodelay;
        
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static assets
    location /assets/ {
        proxy_pass http://frontend:80/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }

    # React application
    location / {
        limit_req zone=general_limit burst=20 nodelay;
        
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Handle client-side routing
        proxy_intercept_errors on;
        error_page 404 = @fallback;
    }

    # Fallback for React Router
    location @fallback {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### 5. Deploy Application

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## SSL Certificate Setup

### 1. Obtain Let's Encrypt Certificate

```bash
# Stop nginx to free port 80
docker-compose -f docker-compose.prod.yml stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com --email admin@yourdomain.com --agree-tos --no-eff-email

# Start nginx again
docker-compose -f docker-compose.prod.yml start nginx
```

### 2. Setup Automatic Renewal

```bash
# Create renewal script
sudo tee /etc/cron.daily/certbot-renew << 'EOF'
#!/bin/bash
certbot renew --quiet --pre-hook "docker-compose -f /opt/openai-outreach/docker-compose.prod.yml stop nginx" --post-hook "docker-compose -f /opt/openai-outreach/docker-compose.prod.yml start nginx"
EOF

# Make it executable
sudo chmod +x /etc/cron.daily/certbot-renew
```

## Database Backup

### 1. Create Backup Script

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash

# Load environment variables
source /opt/openai-outreach/.env

# Set backup directory
BACKUP_DIR="/opt/openai-outreach/backups"
mkdir -p $BACKUP_DIR

# Create backup with timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mongodb_backup_$TIMESTAMP.gz"

# Perform backup
docker exec openai_outreach_mongodb mongodump \
  --username=$MONGO_INITDB_ROOT_USERNAME \
  --password=$MONGO_INITDB_ROOT_PASSWORD \
  --authenticationDatabase=admin \
  --db=$MONGO_INITDB_DATABASE \
  --archive=/backups/mongodb_backup_$TIMESTAMP.gz \
  --gzip

# Keep only last 7 days of backups
find $BACKUP_DIR -name "mongodb_backup_*.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

# Make executable
chmod +x backup.sh
```

### 2. Schedule Automated Backups

```bash
# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/openai-outreach/backup.sh >> /opt/openai-outreach/backups/backup.log 2>&1") | crontab -
```

### 3. Restore from Backup

```bash
# To restore a backup
docker exec -i openai_outreach_mongodb mongorestore \
  --username=$MONGO_INITDB_ROOT_USERNAME \
  --password=$MONGO_INITDB_ROOT_PASSWORD \
  --authenticationDatabase=admin \
  --archive=/backups/mongodb_backup_20240101_020000.gz \
  --gzip \
  --drop
```

## Monitoring and Maintenance

### 1. Setup Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop

# Check Docker resource usage
docker stats

# Monitor application logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Check disk usage
df -h
du -sh /var/lib/docker/
```

### 2. Log Rotation

Docker Compose already configures log rotation, but for system logs:

```bash
# Create logrotate config
sudo tee /etc/logrotate.d/openai-outreach << 'EOF'
/opt/openai-outreach/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        docker-compose -f /opt/openai-outreach/docker-compose.prod.yml restart backend
    endscript
}
EOF
```

### 3. Health Monitoring Script

```bash
# Create health check script
cat > health-check.sh << 'EOF'
#!/bin/bash

# Check if all services are running
SERVICES=("mongodb" "backend" "frontend" "nginx")
for service in "${SERVICES[@]}"; do
    if ! docker-compose -f /opt/openai-outreach/docker-compose.prod.yml ps | grep -q "openai_outreach_$service.*Up"; then
        echo "Service $service is down! Attempting restart..."
        docker-compose -f /opt/openai-outreach/docker-compose.prod.yml restart $service
    fi
done

# Check application endpoint
if ! curl -sf http://localhost/health > /dev/null; then
    echo "Health check failed! Check application logs."
    exit 1
fi

echo "All services healthy"
EOF

chmod +x health-check.sh

# Add to crontab (every 5 minutes)
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/openai-outreach/health-check.sh >> /opt/openai-outreach/logs/health.log 2>&1") | crontab -
```

## Update Deployment

### 1. Update Application Code

```bash
cd /opt/openai-outreach

# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Remove old images
docker image prune -f
```

### 2. Zero-Downtime Updates

```bash
# Build new images without stopping services
docker-compose -f docker-compose.prod.yml build

# Update services one by one
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
sleep 30  # Wait for backend to be healthy
docker-compose -f docker-compose.prod.yml up -d --no-deps frontend
sleep 30
docker-compose -f docker-compose.prod.yml up -d --no-deps nginx
```

## Security Hardening

### 1. Additional Security Measures

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Configure fail2ban for Docker
sudo tee /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https"]
logpath = /var/lib/docker/containers/*/*-json.log
EOF

# Restart fail2ban
sudo systemctl restart fail2ban
```

### 2. Regular Security Updates

```bash
# Create update script
cat > security-updates.sh << 'EOF'
#!/bin/bash

# Update system packages
apt update && apt upgrade -y

# Update Docker images
docker-compose -f /opt/openai-outreach/docker-compose.prod.yml pull
docker-compose -f /opt/openai-outreach/docker-compose.prod.yml up -d

# Clean up
docker system prune -af
EOF

chmod +x security-updates.sh
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB logs
   docker-compose -f docker-compose.prod.yml logs mongodb
   
   # Verify credentials
   docker exec -it openai_outreach_mongodb mongosh -u admin -p
   ```

2. **502 Bad Gateway**
   ```bash
   # Check backend health
   docker-compose -f docker-compose.prod.yml ps backend
   docker-compose -f docker-compose.prod.yml logs backend
   ```

3. **SSL Certificate Issues**
   ```bash
   # Test certificate
   sudo certbot certificates
   
   # Force renewal
   sudo certbot renew --force-renewal
   ```

4. **High Memory Usage**
   ```bash
   # Check container resources
   docker stats
   
   # Restart services
   docker-compose -f docker-compose.prod.yml restart
   ```

### Disaster Recovery

1. **Full System Backup**
   ```bash
   # Backup all data and configuration
   tar -czf openai-outreach-backup-$(date +%Y%m%d).tar.gz \
     /opt/openai-outreach \
     --exclude=/opt/openai-outreach/backups
   ```

2. **Restore from Backup**
   ```bash
   # Extract backup
   tar -xzf openai-outreach-backup-20240101.tar.gz -C /
   
   # Restore database
   docker-compose -f docker-compose.prod.yml up -d mongodb
   docker exec -i openai_outreach_mongodb mongorestore \
     --username=admin \
     --password=$MONGO_PASSWORD \
     --authenticationDatabase=admin \
     --archive=/backups/latest.gz \
     --gzip \
     --drop
   
   # Start all services
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Performance Optimization

### 1. Enable Caching Headers

Already configured in nginx.prod.conf for static assets.

### 2. Database Indexing

```bash
# Connect to MongoDB
docker exec -it openai_outreach_mongodb mongosh -u admin -p

# Create indexes
use openai_outreach
db.contacts.createIndex({ email: 1 })
db.contacts.createIndex({ createdAt: -1 })
db.affirmations.createIndex({ category: 1 })
db.affirmations.createIndex({ createdAt: -1 })
```

### 3. Monitor Performance

```bash
# Install monitoring
docker run -d \
  --name=netdata \
  -p 19999:19999 \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --cap-add SYS_PTRACE \
  --security-opt apparmor=unconfined \
  netdata/netdata
```

Access monitoring at: http://yourdomain.com:19999

## Production Checklist

- [ ] Domain DNS configured
- [ ] SSL certificates installed
- [ ] Environment variables secured
- [ ] Firewall configured
- [ ] Automated backups scheduled
- [ ] Health monitoring active
- [ ] Log rotation configured
- [ ] Security updates scheduled
- [ ] Rate limiting enabled
- [ ] Error tracking setup
- [ ] Performance monitoring active
- [ ] Disaster recovery plan tested

## Support and Maintenance

For issues or questions:
1. Check application logs: `docker-compose -f docker-compose.prod.yml logs`
2. Review health status: `curl https://yourdomain.com/health`
3. Check system resources: `docker stats` and `df -h`
4. Review MongoDB logs: `docker-compose -f docker-compose.prod.yml logs mongodb`

Remember to regularly:
- Update system packages
- Renew SSL certificates
- Review security logs
- Test backup restoration
- Monitor disk usage
- Update Docker images