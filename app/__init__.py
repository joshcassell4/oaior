import os
import logging
from flask import Flask
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
    
    # Register blueprints
    from blueprints.main import main
    from blueprints.static import static_bp
    from blueprints.api import api
    from blueprints.errors import errors
    from blueprints.contacts import contacts
    from blueprints.game import game
    
    app.register_blueprint(main)
    app.register_blueprint(static_bp)
    app.register_blueprint(errors)
    app.register_blueprint(contacts)
    app.register_blueprint(game)
    
    # Only register API blueprint if enabled
    if app.config.get('ENABLE_API', True):
        app.register_blueprint(api)
    
    # Create necessary directories
    os.makedirs(app.config.get('UPLOAD_FOLDER', 'uploads'), exist_ok=True)
    
    # Add any additional initialization here
    # For example, database initialization, login manager, etc.
    
    # Initialize MongoDB
    import database
    database.init_app(app)
    
    return app