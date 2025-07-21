#!/usr/bin/env python
"""
Development server runner
========================

This file provides a convenient way to run the Flask application
during development. It automatically loads environment variables
from a .env file if present.

Usage:
    python run.py
    
Or make it executable:
    chmod +x run.py
    ./run.py
"""

import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app'))

# Load environment variables from .env file
from dotenv import load_dotenv
env_path = Path('.') / '.env'
if env_path.exists():
    load_dotenv(env_path)

# Import and run the application
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Get configuration from environment variables
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    # Run the application
    print(f"Starting Flask application on {host}:{port}")
    print(f"Debug mode: {debug}")
    print(f"Environment: {os.environ.get('FLASK_ENV', 'production')}")
    
    app.run(host=host, port=port, debug=debug)