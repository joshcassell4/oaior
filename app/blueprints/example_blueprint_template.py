"""
Example Blueprint Template
=========================

This is a template for creating new blueprints in the future.
Copy this file and modify it to create your own blueprint.

To use this template:
1. Copy this file to a new directory under blueprints/
2. Rename it appropriately (e.g., blueprints/blog/__init__.py)
3. Create a routes.py file in the same directory
4. Register the blueprint in app/__init__.py

Example directory structure:
blueprints/
  blog/
    __init__.py
    routes.py
    models.py (optional)
    forms.py (optional)
"""

from flask import Blueprint

# Create blueprint instance
# Parameters:
# - name: blueprint name (used internally)
# - import_name: usually __name__
# - url_prefix: URL prefix for all routes in this blueprint (optional)
# - template_folder: custom template folder (optional)
# - static_folder: custom static folder (optional)
example = Blueprint(
    'example',
    __name__,
    url_prefix='/example',  # All routes will be prefixed with /example
    template_folder='templates',  # Optional: blueprint-specific templates
    static_folder='static'  # Optional: blueprint-specific static files
)

# Import routes after blueprint creation to avoid circular imports
from . import routes

# Example of blueprint-specific error handler
@example.errorhandler(404)
def example_not_found(error):
    return {'error': 'Example resource not found'}, 404

# Example of blueprint-specific before_request handler
@example.before_request
def before_example_request():
    # Code to run before each request to this blueprint
    pass

# Example of blueprint-specific after_request handler
@example.after_request
def after_example_request(response):
    # Code to run after each request to this blueprint
    return response