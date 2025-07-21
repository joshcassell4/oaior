# MongoDB Integration Guide

This document describes the MongoDB integration for the OpenAI Outreach application.

## Overview

MongoDB has been integrated into the application stack as a containerized service with persistent storage on the host filesystem. The integration ensures data persistence, security, and easy management across development and production environments.

## Architecture

### Data Storage Strategy

MongoDB data is stored outside of Docker containers to ensure:
- **Data Persistence**: Database files persist even when containers are destroyed
- **Security**: Database files never become part of Docker images
- **Flexibility**: Easy backup and migration of data

**Data Location**: `./data/mongodb/` (on the host filesystem)

### Container Configuration

The MongoDB service runs as a Docker container with the following configuration:
- **Image**: `mongo:latest` (official MongoDB image)
- **Container Name**: `openai_outreach_mongodb`
- **Network**: Shares the `app-network` with other services
- **Volume Mount**: `./data/mongodb:/data/db` (host:container)

## Development Setup

### Docker Compose Configuration

```yaml
mongodb:
  image: mongo:latest
  container_name: openai_outreach_mongodb
  restart: unless-stopped
  volumes:
    - ./data/mongodb:/data/db
  ports:
    - "27017:27017"  # Exposed for development tools
  environment:
    - MONGO_INITDB_DATABASE=openai_outreach
  networks:
    - app-network
```

### Starting the Development Stack

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs mongodb

# Stop all services
docker-compose down
```

### Development Connection String

```
mongodb://mongodb:27017/openai_outreach
```

## Production Setup

### Enhanced Security Configuration

Production configuration includes:
- **Authentication**: Root username/password required
- **No Port Exposure**: MongoDB port not exposed to host
- **Environment Variables**: Credentials from `.env` file

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
# MongoDB Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-strong-password-here
MONGODB_DATABASE=openai_outreach
```

### Production Connection String

```
mongodb://admin:password@mongodb:27017/openai_outreach?authSource=admin
```

### Starting the Production Stack

```bash
# Start with production config
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs mongodb
```

## Application Integration

### Configuration (config.py)

```python
# MongoDB configuration
MONGODB_URI = os.environ.get('MONGODB_URI') or 'mongodb://localhost:27017/openai_outreach'
MONGODB_DATABASE = os.environ.get('MONGODB_DATABASE') or 'openai_outreach'
```

### Database Module (database.py)

The application includes a database module that provides:
- **Connection Management**: Automatic connection pooling via PyMongo
- **Flask Integration**: Proper teardown handling
- **Utility Functions**: Common database operations
- **Error Handling**: Graceful failure if MongoDB is unavailable

### Available Functions

```python
# Get database connection
db = get_db()

# Insert a document
doc_id = insert_document('collection_name', {'key': 'value'})

# Find documents
docs = find_documents('collection_name', {'type': 'example'}, limit=10)

# Update a document
count = update_document('collection_name', {'_id': doc_id}, {'status': 'updated'})

# Delete a document
count = delete_document('collection_name', {'_id': doc_id})
```

## API Endpoints

### Health Check (/health)

Returns application health status including MongoDB connection state:

```json
{
  "status": "healthy",
  "mongodb": {
    "connected": true,
    "message": "MongoDB connection successful"
  }
}
```

### MongoDB Test (/mongodb-test)

Test endpoint that demonstrates basic MongoDB operations:
- Inserts a test document
- Retrieves recent test documents
- Returns connection status and results

## Directory Structure

```
landingoaior/
├── data/                    # Excluded from Git and Docker
│   ├── README.md           # Explains data directory purpose
│   └── mongodb/            # MongoDB data files (auto-created)
│       ├── WiredTiger
│       ├── collection-*.wt
│       ├── index-*.wt
│       └── ...
├── app/
│   ├── database.py         # MongoDB utilities
│   └── config.py          # MongoDB configuration
└── docker-compose.yml     # MongoDB service definition
```

## Security Considerations

### Development
- **No Authentication**: Simplified for local development
- **Port Exposed**: Allows connection from host tools (MongoDB Compass, etc.)
- **Local Access Only**: Bound to localhost

### Production
- **Authentication Required**: Root username/password via environment
- **Port Not Exposed**: Only accessible within Docker network
- **Encrypted Variables**: Use secrets management for credentials
- **Network Isolation**: MongoDB only accessible by app container

### Best Practices
1. **Never commit `.env` files** containing real credentials
2. **Use strong passwords** in production
3. **Regular backups** of the `./data/mongodb` directory
4. **Monitor disk space** where data directory resides
5. **Set proper file permissions** (only Docker daemon should access)

## Backup and Recovery

### Manual Backup

```bash
# Create backup directory
mkdir -p backups

# Stop MongoDB to ensure consistency
docker-compose stop mongodb

# Copy data directory
cp -r ./data/mongodb ./backups/mongodb-$(date +%Y%m%d-%H%M%S)

# Restart MongoDB
docker-compose start mongodb
```

### Using MongoDB Tools

```bash
# Backup with mongodump
docker-compose exec mongodb mongodump --out /backup --db openai_outreach

# Restore with mongorestore
docker-compose exec mongodb mongorestore --db openai_outreach /backup/openai_outreach
```

## Troubleshooting

### Connection Issues

1. **Check container status**:
   ```bash
   docker-compose ps mongodb
   ```

2. **View MongoDB logs**:
   ```bash
   docker-compose logs mongodb
   ```

3. **Test connection from app container**:
   ```bash
   docker-compose exec web python -c "from app.database import test_connection; print(test_connection())"
   ```

### Common Problems

**Problem**: "MongoDB connection failed"
- **Solution**: Ensure MongoDB container is running and healthy

**Problem**: "Authentication failed"
- **Solution**: Check `.env` file has correct credentials

**Problem**: "Disk space error"
- **Solution**: Check available space in `./data` directory location

**Problem**: "Permission denied"
- **Solution**: Ensure Docker has write permissions to `./data/mongodb`

## Performance Optimization

### Connection Pooling
PyMongo automatically manages connection pooling. Default settings:
- **Max Pool Size**: 100 connections
- **Min Pool Size**: 0 connections
- **Connection Timeout**: 30 seconds

### Indexing
Create indexes for frequently queried fields:

```python
db = get_db()
db.collection_name.create_index([('field_name', 1)])  # 1 for ascending
```

### Resource Limits
Add to docker-compose for production:

```yaml
mongodb:
  deploy:
    resources:
      limits:
        memory: 2G
      reservations:
        memory: 512M
```

## Monitoring

### Basic Metrics

```bash
# Database statistics
docker-compose exec mongodb mongosh openai_outreach --eval "db.stats()"

# Collection statistics
docker-compose exec mongodb mongosh openai_outreach --eval "db.collection_name.stats()"

# Current operations
docker-compose exec mongodb mongosh admin --eval "db.currentOp()"
```

### Logs
MongoDB logs are available via Docker:
```bash
docker-compose logs -f mongodb
```

## Migration Guide

### From SQLite to MongoDB

If migrating from SQLite:

1. Export data from SQLite
2. Transform to MongoDB document format
3. Import using `insert_many()`
4. Update application queries

### Version Upgrades

To upgrade MongoDB version:

1. Backup data directory
2. Stop containers
3. Update image version in docker-compose
4. Start containers
5. Monitor logs for migration messages

## Additional Resources

- [MongoDB Official Documentation](https://docs.mongodb.com/)
- [PyMongo Documentation](https://pymongo.readthedocs.io/)
- [MongoDB Docker Image](https://hub.docker.com/_/mongo)
- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI for MongoDB