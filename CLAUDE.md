# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

### Local Development
```bash
# Start all services (MongoDB, Flask app, Nginx)
docker-compose up -d

# Run Flask directly (requires local MongoDB)
python run.py

# View logs
docker-compose logs -f web

# Rebuild after code changes
docker-compose build web
docker-compose up -d

# Access services
# Main site (via Nginx): http://localhost
# Direct Flask app: http://localhost:8000
# MongoDB: mongodb://localhost:27017/openai_outreach
# Contacts page: http://localhost/contacts
```

### Production Deployment
```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# SSL setup with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Update application
git pull origin main
docker-compose build
docker-compose up -d
```

## Architecture Overview

This is a **Flask application** using the **Blueprint pattern** for modularity, with MongoDB for data persistence and Nginx as a reverse proxy.

### Core Architecture
1. **Application Factory Pattern**: The app is created via `create_app()` in `app/__init__.py`, allowing flexible configuration
2. **Blueprint System**: Modular components in `app/blueprints/[name]/` with self-contained routes
3. **MongoDB Integration**: Connection pooling via Flask's `g` object, utilities in `app/database.py`
4. **Docker Containerization**: Three services - MongoDB (port 27017), Flask app (internal 8000), Nginx (port 80)
5. **WSGI Entry**: `app/wsgi.py` serves as the Gunicorn entry point

### Import Structure (Critical for Docker)
In the Docker container, the app directory contents are copied to `/app`, so imports must be absolute:
- Use `from config import config` NOT `from .config import config`
- Use `from blueprints.main import main` NOT `from app.blueprints.main import main`
- Use `from database import get_db` NOT `from app.database import get_db`

### Blueprint Architecture
Current blueprints:
- **main**: Core landing page, health checks (`/`)
- **api**: RESTful API endpoints (`/api/v1/`)
- **static**: Static file serving with caching
- **errors**: Centralized error handling (404, 500, etc.)
- **contacts**: Contact management system (`/contacts/`)

## MongoDB Integration

Database utilities in `app/database.py`:
- `get_db()`: Get database connection from Flask g object
- `insert_document(collection, document)`: Insert a document
- `find_documents(collection, query, limit)`: Find documents
- `update_document(collection, query, update_data)`: Update a document
- `delete_document(collection, query)`: Delete a document

Test endpoint: `/mongodb-test`

## Adding New Features

### Create a New Blueprint
1. Create directory structure:
   ```
   app/blueprints/your_feature/
   ├── __init__.py
   ├── routes.py
   └── templates/ (optional)
   ```

2. Blueprint initialization (`__init__.py`):
   ```python
   from flask import Blueprint
   your_feature = Blueprint('your_feature', __name__, url_prefix='/your-feature')
   from . import routes
   ```

3. Register in `app/__init__.py`:
   ```python
   from blueprints.your_feature import your_feature
   app.register_blueprint(your_feature)
   ```

### Configuration
Environment-based configs in `app/config.py`:
- `DevelopmentConfig`: Debug enabled, logs to stdout
- `ProductionConfig`: Debug disabled, rotating log files, secure cookies
- `TestingConfig`: In-memory database, CSRF disabled

Key environment variables:
- `FLASK_ENV`: development/production
- `MONGODB_URI`: MongoDB connection string
- `SECRET_KEY`: Flask secret key (change in production!)
- `PORT`: Flask port (default: 8000)
- `ENABLE_API`: Enable/disable API blueprint
- `ENABLE_ADMIN`: Enable/disable admin features

## Common Issues and Solutions

### Docker Import Errors
If you see "ImportError: attempted relative import with no known parent package":
- Check that all imports in `app/__init__.py` and blueprint files use absolute imports
- The Docker container copies app contents to `/app`, changing the module structure

### Port Conflicts
- MongoDB runs on port 27017 (configurable in docker-compose.yml)
- If port is already in use, either stop the conflicting service or change the port mapping

### Container Health Checks
All services have health checks configured:
- MongoDB: `db.runCommand("ping")`
- Flask: `/health` endpoint
- Nginx: `/health` proxy check