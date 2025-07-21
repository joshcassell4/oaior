import os
from datetime import timedelta


class Config:
    """Base configuration class."""
    # Basic Flask configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Session configuration
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    
    # Static files
    STATIC_FOLDER = 'static'
    TEMPLATES_FOLDER = 'templates'
    
    # Upload configuration (for future use)
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    
    # Database configuration (for future use)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app.db')
    
    # MongoDB configuration
    MONGODB_URI = os.environ.get('MONGODB_URI') or 'mongodb://localhost:27017/openai_outreach'
    MONGODB_DATABASE = os.environ.get('MONGODB_DATABASE') or 'openai_outreach'
    
    # API configuration (for future use)
    API_TITLE = 'Landing OAI OR API'
    API_VERSION = 'v1'
    OPENAPI_VERSION = '3.0.2'
    
    # CORS configuration (for future API use)
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
    
    # Feature flags
    ENABLE_API = os.environ.get('ENABLE_API', 'true').lower() == 'true'
    ENABLE_ADMIN = os.environ.get('ENABLE_ADMIN', 'false').lower() == 'true'
    
    @staticmethod
    def init_app(app):
        """Initialize application with this config."""
        pass


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    TESTING = False
    
    @staticmethod
    def init_app(app):
        Config.init_app(app)
        # Log to stdout in development
        import logging
        from logging import StreamHandler
        if not app.logger.handlers:
            handler = StreamHandler()
            handler.setLevel(logging.INFO)
            app.logger.addHandler(handler)


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True
    
    @staticmethod
    def init_app(app):
        Config.init_app(app)
        # Production-specific initialization
        import logging
        from logging.handlers import RotatingFileHandler
        if not app.logger.handlers:
            if not os.path.exists('logs'):
                os.mkdir('logs')
            file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240000, backupCount=10)
            file_handler.setFormatter(logging.Formatter(
                '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
            ))
            file_handler.setLevel(logging.INFO)
            app.logger.addHandler(file_handler)


class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False


# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}