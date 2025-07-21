# Flask Blueprint Architecture Guide

This application has been refactored to use Flask blueprints for better organization and scalability.

## New Structure

```
app/
├── __init__.py          # Application factory
├── app.py               # Application entry point
├── config.py            # Configuration classes
├── blueprints/          # All blueprints
│   ├── main/           # Main pages
│   ├── api/            # API endpoints
│   ├── static/         # Static file serving
│   └── errors/         # Error handlers
├── static/             # Static assets
└── templates/          # Jinja2 templates
    ├── base.html       # Base template
    ├── index.html      # Homepage
    └── errors/         # Error pages
```

## Running with Docker

The application works seamlessly with Docker:

```bash
# Development mode
docker-compose up

# Production mode
docker-compose -f docker-compose.prod.yml up

# Rebuild after changes
docker-compose build
docker-compose up
```

## Adding New Features

### 1. Create a New Blueprint

Create a new directory under `app/blueprints/`:

```
app/blueprints/blog/
├── __init__.py
├── routes.py
├── models.py (optional)
└── forms.py (optional)
```

Example `__init__.py`:
```python
from flask import Blueprint

blog = Blueprint('blog', __name__, url_prefix='/blog')

from . import routes
```

Example `routes.py`:
```python
from flask import render_template
from . import blog

@blog.route('/')
def index():
    return render_template('blog/index.html')
```

### 2. Register the Blueprint

Add to `app/__init__.py`:
```python
from app.blueprints.blog import blog
app.register_blueprint(blog)
```

### 3. Create Templates

Create templates under `app/templates/blog/`:
```
app/templates/blog/
├── index.html
└── post.html
```

## Configuration

The application now uses a configuration system that supports different environments:

- **Development**: Debug mode enabled, detailed error pages
- **Production**: Optimized for performance, secure settings
- **Testing**: In-memory database, CSRF disabled

Set the environment using the `FLASK_ENV` variable:
```bash
# In docker-compose.yml
environment:
  - FLASK_ENV=development

# Or in .env file
FLASK_ENV=production
```

## API Development

The API blueprint is ready at `/api/v1/`. Example endpoints:

- `GET /api/v1/status` - API status
- `POST /api/v1/echo` - Echo test endpoint

Add new API endpoints in `app/blueprints/api/routes.py`.

## Frontend Development

The base template (`base.html`) provides:
- Common HTML structure
- Meta tags management
- CSS/JS inclusion
- Flash message handling
- Navigation and footer placeholders

All pages should extend the base template:
```html
{% extends "base.html" %}

{% block title %}Page Title{% endblock %}

{% block content %}
    <!-- Your content here -->
{% endblock %}
```

## Benefits of This Structure

1. **Modularity**: Each feature is isolated in its own blueprint
2. **Scalability**: Easy to add new features without touching core code
3. **Maintainability**: Clear separation of concerns
4. **Team Development**: Multiple developers can work on different blueprints
5. **Testing**: Blueprints can be tested independently
6. **Configuration**: Environment-specific settings
7. **Future-Ready**: Prepared for database, authentication, and more

## Next Steps

1. **Database Integration**: Uncomment Flask-SQLAlchemy in requirements.txt
2. **User Authentication**: Create an auth blueprint with Flask-Login
3. **Forms**: Use Flask-WTF for secure form handling
4. **API Documentation**: Consider Flask-RESTX for automatic API docs
5. **Caching**: Enable Flask-Caching for performance
6. **Email**: Configure Flask-Mail for notifications

The application is now ready for expansion with any new features you need!