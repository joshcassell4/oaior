"""
Affirmations Blueprint
=====================

This blueprint handles affirmation management functionality including:
- Listing affirmations
- Adding new affirmations
- Updating affirmations
- Deleting affirmations
- Getting random affirmation for display
"""

from flask import Blueprint

# Create blueprint instance
affirmations = Blueprint(
    'affirmations',
    __name__,
    url_prefix='/affirmations',
    template_folder='templates',
    static_folder='static'
)

# Import routes after blueprint creation to avoid circular imports
from . import routes