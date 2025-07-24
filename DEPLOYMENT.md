# Deployment and Troubleshooting Guide

This guide provides step-by-step instructions for deploying and troubleshooting the OpenAI Outreach React/Flask application.

## 🚀 Quick Start Deployment

### Prerequisites

- Docker and Docker Compose installed
- Git for version control
- Basic understanding of Docker concepts

### Production Deployment

```bash
# 1. Clone the repository
git clone <repository-url>
cd landingoaior

# 2. Build and start production environment
make prod
# OR
docker-compose up --build -d

# 3. Verify deployment
make health
# OR
docker-compose ps
```

**Access URLs:**
- **Main Application**: http://localhost
- **API Endpoints**: http://localhost/api/v1/
- **Direct Backend**: http://localhost:8000 (for debugging)

### Development Deployment

```bash
# 1. Start development environment with hot reloading
make dev
# OR
docker-compose -f docker-compose.dev.yml up --build

# 2. Access development services
# Frontend (Vite): http://localhost:3000
# Backend (Flask): http://localhost:8000
# MongoDB: mongodb://localhost:27017
```

## 📊 Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │────│ React Frontend   │    │  Flask Backend  │
│   Port 80/443   │    │   Container      │────│   Container     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                          │
                                               ┌─────────────────┐
                                               │   MongoDB       │
                                               │   Container     │
                                               └─────────────────┘
```

**Container Services:**
- **MongoDB**: Database storage with health checks
- **Backend**: Flask API with Gunicorn WSGI server
- **Frontend**: React SPA served via Nginx (production) or Vite dev server (development)
- **Nginx**: Reverse proxy handling routing and SSL termination

## 🔧 Configuration Management

### Environment Variables

**Production (`docker-compose.yml`):**
```yaml
backend:
  environment:
    - FLASK_ENV=production
    - PORT=8000
    - MONGODB_URI=mongodb://mongodb:27017/openai_outreach
```

**Development (`docker-compose.dev.yml`):**
```yaml
backend:
  environment:
    - FLASK_ENV=development
    - PORT=8000
    - MONGODB_URI=mongodb://mongodb:27017/openai_outreach
frontend:
  environment:
    - NODE_ENV=development
```

### Docker Configuration Files

- `docker-compose.yml` - Production configuration
- `docker-compose.dev.yml` - Development configuration with hot reloading
- `frontend/Dockerfile` - Multi-stage build (development + production targets)
- `Dockerfile` - Backend Flask application container

## 🛠️ Management Commands

### Makefile Commands

```bash
# Production Environment
make prod              # Start production environment
make prod-build        # Build production containers
make prod-logs         # View production logs
make prod-restart      # Restart production services

# Development Environment  
make dev               # Start development with hot reloading
make dev-build         # Build development containers
make dev-logs          # View development logs
make dev-restart       # Restart development services

# Monitoring & Debugging
make health            # Check service health status
make status            # Show container status
make test              # Test API endpoints
make frontend-logs     # Frontend container logs only
make backend-logs      # Backend container logs only
make mongodb-logs      # MongoDB container logs only

# Maintenance
make clean             # Clean production (remove volumes)
make dev-clean         # Clean development (remove volumes)
```

### Direct Docker Commands

```bash
# View all services
docker-compose ps

# View logs for specific service
docker-compose logs -f [service-name]

# Execute commands in running container
docker-compose exec [service-name] [command]

# Rebuild specific service
docker-compose build [service-name]

# Scale services (if needed)
docker-compose up -d --scale [service-name]=2
```

## 🩺 Health Checks and Monitoring

### Service Health Checks

All services implement comprehensive health checks:

**MongoDB:**
```bash
echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
```

**Backend (Flask):**
```bash
python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"
```

**Frontend (Production):**
```bash
wget --no-verbose --tries=1 --spider http://127.0.0.1:80/health
```

**Nginx:**
```bash  
wget -q --spider http://localhost/health
```

### Monitoring Commands

```bash
# Check all service health
make health

# Monitor logs in real-time
make logs

# Check resource usage
docker stats

# Inspect specific container
docker-compose exec [service] sh
```

## 🚨 Troubleshooting Guide

### Common Issues and Solutions

#### 1. Container Startup Failures

**Symptoms:**
- Containers exit immediately or restart continuously
- Health checks failing
- Port binding errors

**Diagnosis:**
```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs [service-name]

# Check Docker daemon status
docker info
```

**Solutions:**
```bash
# Remove orphaned containers
docker-compose down --remove-orphans

# Clean and rebuild
make clean && make prod-build

# Check port conflicts
netstat -tulpn | grep :80
lsof -i :80
```

#### 2. Frontend Build Issues

**Symptoms:**
- White screen or React errors
- 404 errors for static assets
- Build failures in container

**Diagnosis:**
```bash
# Check frontend container logs
make frontend-logs

# Verify build artifacts
docker-compose exec frontend ls -la /usr/share/nginx/html/

# Test frontend container directly
curl -I http://localhost/
```

**Solutions:**
```bash
# Rebuild frontend container
docker-compose build frontend

# Clear Docker build cache
docker system prune -f

# Verify package.json and dependencies
docker-compose exec frontend npm list
```

#### 3. Backend API Issues

**Symptoms:**
- API endpoints returning 500 errors
- Database connection failures
- CORS errors in browser

**Diagnosis:**
```bash
# Check backend logs
make backend-logs

# Test database connection
docker-compose exec backend python -c "from app.database import get_db; print('DB OK' if get_db() else 'DB Error')"

# Test API endpoints directly
curl -v http://localhost:8000/health
```

**Solutions:**
```bash
# Restart backend service
docker-compose restart backend

# Check MongoDB connection
make mongodb-logs

# Verify environment variables
docker-compose exec backend env | grep -E "(FLASK|MONGO)"
```

#### 4. Database Connection Issues

**Symptoms:**
- Backend can't connect to MongoDB
- Data persistence issues
- Database initialization errors

**Diagnosis:**
```bash
# Check MongoDB status
make mongodb-logs

# Test MongoDB connection
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"

# Check database volumes
docker volume ls | grep mongodb
```

**Solutions:**
```bash
# Restart MongoDB service
docker-compose restart mongodb

# Recreate database volume (WARNING: Data loss)
docker-compose down -v
docker-compose up -d

# Check MongoDB configuration
docker-compose exec mongodb cat /etc/mongod.conf
```

#### 5. Nginx Routing Issues

**Symptoms:**
- 502 Bad Gateway errors
- Static files not loading
- API requests not reaching backend

**Diagnosis:**
```bash
# Check nginx logs
docker-compose logs nginx

# Verify nginx configuration
docker-compose exec nginx nginx -t

# Test backend connectivity from nginx
docker-compose exec nginx wget -O- http://backend:8000/health
```

**Solutions:**
```bash
# Reload nginx configuration
docker-compose exec nginx nginx -s reload

# Restart nginx service
docker-compose restart nginx

# Verify nginx configuration file
docker-compose exec nginx cat /etc/nginx/conf.d/default.conf
```

### Performance Issues

#### 6. Slow Response Times

**Diagnosis:**
```bash
# Monitor resource usage
docker stats

# Profile API response times
time curl -s http://localhost/api/v1/health

# Check container resource limits
docker-compose exec backend cat /proc/meminfo
```

**Solutions:**
```bash
# Increase container resource limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

# Optimize MongoDB performance
docker-compose exec mongodb mongosh --eval "db.stats()"

# Scale backend workers (if needed)
docker-compose up -d --scale backend=2
```

### Security Issues

#### 7. SSL/TLS Configuration

**Production SSL Setup:**
```bash
# Install Certbot for Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew setup
sudo crontab -e
# Add: 0 2 * * * /usr/bin/certbot renew --quiet
```

#### 8. Network Security

**Firewall Configuration:**
```bash
# Allow only necessary ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 27017/tcp  # Block direct MongoDB access
sudo ufw deny 8000/tcp   # Block direct backend access

# Enable firewall
sudo ufw enable
```

## 📈 Performance Optimization

### Bundle Size Analysis

Current bundle sizes:
- **JavaScript**: ~227KB (minified + gzipped ~75KB)
- **CSS**: ~14KB (minified + gzipped ~3.5KB)
- **Total**: ~324KB

**Optimization Strategies:**
```bash
# Analyze bundle composition
npm run build -- --analyze

# Enable compression in nginx
# (Already configured in nginx.conf)

# Implement code splitting
# Configure in vite.config.js
```

### Database Optimization

```bash
# Create indexes for frequently queried fields
docker-compose exec mongodb mongosh openai_outreach
db.contacts.createIndex({ "email": 1 })
db.affirmations.createIndex({ "category": 1 })

# Monitor database performance
db.currentOp()
db.serverStatus()
```

## 🔄 Backup and Recovery

### Database Backup

```bash
# Create backup
docker-compose exec mongodb mongodump --db openai_outreach --out /backup
docker cp $(docker-compose ps -q mongodb):/backup ./backup

# Restore backup
docker cp ./backup $(docker-compose ps -q mongodb):/backup
docker-compose exec mongodb mongorestore --db openai_outreach /backup/openai_outreach
```

### Application State Backup

```bash
# Backup Docker volumes
docker run --rm -v landingoaior_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz -C /data .

# Restore Docker volumes
docker run --rm -v landingoaior_mongodb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb_backup.tar.gz -C /data
```

## 🔍 Debugging Tips

### Development Debugging

```bash
# Enable verbose logging
FLASK_ENV=development docker-compose up

# Access container shell for debugging
docker-compose exec backend bash
docker-compose exec frontend sh

# Monitor file changes (development)
docker-compose -f docker-compose.dev.yml logs -f frontend
```

### Production Debugging

```bash
# Check application logs
make logs

# Monitor resource usage
watch docker stats

# Network debugging
docker-compose exec nginx netstat -tulpn
docker-compose exec backend netstat -tulpn
```

## 📞 Support and Additional Resources

### Log Locations

- **Application Logs**: `docker-compose logs [service]`
- **Nginx Access Logs**: Inside nginx container at `/var/log/nginx/`
- **Flask Application Logs**: Stdout/stderr captured by Docker

### Useful Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [MongoDB Operations Manual](https://docs.mongodb.com/manual/)

### Getting Help

1. Check this troubleshooting guide first
2. Review application logs using `make logs`
3. Check Docker and system resources
4. Search for similar issues in project documentation
5. Contact the development team with specific error messages and logs

---

**Last Updated**: 2025-07-23  
**Version**: 1.0.0  
**Migration Phase**: 6 Complete ✅