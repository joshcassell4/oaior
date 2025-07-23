import os
import logging
from flask import Flask
from flask_cors import CORS
from config import config


def create_app(config_name=None):
    """Application factory pattern."""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # Configure logging
    if not app.debug and not app.testing:
        if app.config.get('LOG_TO_STDOUT'):
            stream_handler = logging.StreamHandler()
            stream_handler.setLevel(logging.INFO)
            app.logger.addHandler(stream_handler)
        else:
            if not os.path.exists('logs'):
                os.mkdir('logs')
            file_handler = logging.FileHandler('logs/app.log')
            file_handler.setLevel(logging.INFO)
            app.logger.addHandler(file_handler)
        
        app.logger.setLevel(logging.INFO)
        app.logger.info('Application startup')
    
    # Configure CORS
    _configure_cors(app, config_name)
    
    # Register blueprints
    from blueprints.main import main
    from blueprints.static import static_bp
    from blueprints.api import api
    from blueprints.api_v1 import api_v1
    from blueprints.errors import errors
    from blueprints.contacts import contacts
    from blueprints.game import game
    from blueprints.affirmations import affirmations
    
    app.register_blueprint(main)
    app.register_blueprint(static_bp)
    app.register_blueprint(errors)
    app.register_blueprint(contacts)
    app.register_blueprint(game)
    app.register_blueprint(affirmations)
    
    # Only register API blueprints if enabled
    if app.config.get('ENABLE_API', True):
        app.register_blueprint(api)
        app.register_blueprint(api_v1)  # New consolidated API v1
    
    # Create necessary directories
    os.makedirs(app.config.get('UPLOAD_FOLDER', 'uploads'), exist_ok=True)
    
    # Add any additional initialization here
    # For example, database initialization, login manager, etc.
    
    # Initialize MongoDB
    import database
    database.init_app(app)
    
    return app


def _configure_cors(app, config_name):
    """Configure CORS based on environment."""
    if config_name == 'development':
        # Development: Allow React dev server
        CORS(app, 
             origins=["http://localhost:3000"],
             methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             allow_headers=["Content-Type", "Authorization"],
             supports_credentials=False)
        app.logger.info('CORS configured for development (localhost:3000)')
    
    elif config_name == 'production':
        # Production: Allow specific frontend domain
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost')
        CORS(app,
             origins=[frontend_url],
             methods=["GET", "POST", "PUT", "DELETE"],
             allow_headers=["Content-Type", "Authorization"],
             supports_credentials=False)
        app.logger.info(f'CORS configured for production ({frontend_url})')
    
    else:
        # Testing or other environments: More permissive for testing
        CORS(app,
             origins=["http://localhost:3000", "http://127.0.0.1:3000"],
             methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
             allow_headers=["Content-Type", "Authorization"],
             supports_credentials=False)
        app.logger.info('CORS configured for testing environment')