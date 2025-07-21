"""
Contacts Blueprint
==================

This blueprint handles contact management functionality including:
- Listing contacts
- Adding new contacts
- Updating contacts
- Deleting contacts
"""

from flask import Blueprint

# Create blueprint instance
contacts = Blueprint(
    'contacts',
    __name__,
    url_prefix='/contacts',
    template_folder='templates',
    static_folder='static'
)

# Import routes after blueprint creation to avoid circular imports
from . import routes