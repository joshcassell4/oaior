from flask import Blueprint

# Create the consolidated API v1 blueprint
api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')

# Import routes to register them with the blueprint
from . import routes