# Open AI Outreach Landing Page

A modern, responsive landing page for Open AI Outreach, containerized with Docker and ready for VPS deployment.

## Project Structure

```
landingoaior/
├── app/                    # Flask application
│   ├── app.py             # Main application file
│   ├── requirements.txt   # Python dependencies
│   ├── static/           # Static assets (CSS, JS, images)
│   └── templates/        # HTML templates
├── nginx/                 # Nginx configuration
│   └── nginx.conf        # Nginx server configuration
├── docker-compose.yml     # Docker Compose configuration
├── Dockerfile            # Docker image definition
├── .env                  # Environment variables
└── scripts/              # Deployment scripts
```

## Local Development

### Prerequisites
- Docker Desktop installed and running
- Git (for version control)

### Running Locally

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd landingoaior
   ```

2. Start the application:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Landing page: http://localhost
   - Health check: http://localhost/health

4. View logs:
   ```bash
   docker-compose logs -f
   ```

5. Stop the application:
   ```bash
   docker-compose down
   ```

## VPS Deployment

### Prerequisites on VPS
- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- Domain name pointed to your VPS IP
- SSL certificate (recommended: Let's Encrypt)

### Deployment Steps

1. **Connect to your VPS**:
   ```bash
   ssh user@your-vps-ip
   ```

2. **Install Docker** (if not already installed):
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```

3. **Install Docker Compose**:
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Clone your repository**:
   ```bash
   git clone <your-repo-url>
   cd landingoaior
   ```

5. **Configure environment**:
   ```bash
   # Edit .env file with production settings
   nano .env
   ```

6. **Deploy the application**:
   ```bash
   # Use the deployment script
   chmod +x scripts/deploy.sh
   ./scripts/deploy.sh
   ```

### SSL Configuration with Let's Encrypt

1. **Install Certbot**:
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtain SSL certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Update nginx configuration** for SSL (see nginx/nginx.ssl.conf)

### Production Considerations

1. **Security**:
   - Use strong passwords
   - Configure firewall (UFW recommended)
   - Keep Docker and dependencies updated
   - Use environment variables for sensitive data

2. **Performance**:
   - Enable gzip compression (already configured)
   - Set up CDN for static assets
   - Configure proper caching headers

3. **Monitoring**:
   - Set up health check monitoring
   - Configure log rotation
   - Use monitoring tools (Prometheus, Grafana)

4. **Backup**:
   - Regular backups of data
   - Version control for code
   - Database backups if applicable

## Maintenance

### Update Application
```bash
git pull origin main
docker-compose build
docker-compose up -d
```

### View Logs
```bash
# All logs
docker-compose logs

# Specific service
docker-compose logs web
docker-compose logs nginx

# Follow logs
docker-compose logs -f
```

### Restart Services
```bash
docker-compose restart
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove unused images
docker image prune -a
```

## Troubleshooting

### Common Issues

1. **Port 80 already in use**:
   ```bash
   sudo lsof -i :80
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Permission denied**:
   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   # Log out and back in
   ```

3. **Container not starting**:
   ```bash
   # Check logs
   docker-compose logs web
   # Check container status
   docker ps -a
   ```

## Support

For issues or questions, please create an issue in the repository.