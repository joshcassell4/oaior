# Flask Blueprints Structure

This directory contains all the Flask blueprints for the application. Blueprints help organize the application into logical components and make it easy to scale.

## Current Blueprints

### 1. Main (`/main`)
- **Purpose**: Core application pages and general routes
- **Routes**:
  - `/` - Homepage
  - `/health` - Health check endpoint

### 2. Static (`/static`)
- **Purpose**: Serve static files and assets
- **Routes**:
  - `/static/<path:filename>` - General static files
  - `/favicon.ico` - Favicon
  - Various icon and manifest routes

### 3. API (`/api`)
- **Purpose**: RESTful API endpoints
- **URL Prefix**: `/api/v1`
- **Routes**:
  - `/api/v1/status` - API status
  - `/api/v1/echo` - Echo endpoint for testing

### 4. Errors (`/errors`)
- **Purpose**: Error handling and custom error pages
- **Handles**: 404, 500, 403 errors

## Adding a New Blueprint

1. **Create a new directory** under `blueprints/`:
   ```
   blueprints/
     your_feature/
       __init__.py
       routes.py
       models.py (optional)
       forms.py (optional)
   ```

2. **Create the blueprint** in `__init__.py`:
   ```python
   from flask import Blueprint
   
   your_feature = Blueprint('your_feature', __name__, url_prefix='/your-feature')
   
   from . import routes
   ```

3. **Define routes** in `routes.py`:
   ```python
   from flask import render_template
   from . import your_feature
   
   @your_feature.route('/')
   def index():
       return render_template('your_feature/index.html')
   ```

4. **Register the blueprint** in `app/__init__.py`:
   ```python
   from app.blueprints.your_feature import your_feature
   app.register_blueprint(your_feature)
   ```

## Blueprint Best Practices

1. **Keep blueprints focused**: Each blueprint should handle a specific feature or domain
2. **Use URL prefixes**: Help organize routes logically
3. **Separate concerns**: Keep models, forms, and routes in separate files
4. **Use blueprint-specific templates**: Create a templates folder within the blueprint if needed
5. **Handle errors**: Add blueprint-specific error handlers when appropriate

## Example Use Cases for Future Blueprints

- **Blog**: `/blog` - Blog posts, categories, comments
- **Auth**: `/auth` - User authentication, registration, login
- **Admin**: `/admin` - Administrative interface
- **Dashboard**: `/dashboard` - User dashboards and analytics
- **Shop**: `/shop` - E-commerce functionality
- **Forum**: `/forum` - Discussion boards

## Configuration

Blueprints can be conditionally registered based on configuration:

```python
if app.config.get('ENABLE_BLOG'):
    from app.blueprints.blog import blog
    app.register_blueprint(blog)
```

This allows features to be enabled/disabled via environment variables.