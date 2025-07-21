from flask import Blueprint

static_bp = Blueprint('static_bp', __name__)

from . import routes