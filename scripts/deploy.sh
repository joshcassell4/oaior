#!/bin/bash

# Deploy script for Open AI Outreach application
# This script handles deployment on a VPS

set -e  # Exit on error

echo "=== Open AI Outreach Deployment Script ==="
echo

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Docker and Docker Compose are installed"

# Pull latest changes (if in git repository)
if [ -d .git ]; then
    print_status "Pulling latest changes from git..."
    git pull origin main || print_warning "Could not pull from git"
fi

# Build new images
print_status "Building Docker images..."
docker-compose build --no-cache

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down

# Start new containers
print_status "Starting new containers..."
docker-compose up -d

# Wait for containers to be healthy
print_status "Waiting for containers to be healthy..."
sleep 5

# Check container status
if docker-compose ps | grep -q "Up"; then
    print_status "Containers are running"
else
    print_error "Containers failed to start"
    docker-compose logs
    exit 1
fi

# Test the application
print_status "Testing application..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost/health | grep -q "200"; then
    print_status "Application is responding correctly"
else
    print_error "Application health check failed"
    docker-compose logs
    exit 1
fi

# Clean up old images
print_status "Cleaning up old Docker images..."
docker image prune -f

echo
print_status "Deployment completed successfully!"
echo
echo "Application is running at: http://localhost"
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"