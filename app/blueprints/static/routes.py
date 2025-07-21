from flask import send_from_directory, current_app
from . import static_bp


@static_bp.route('/static/<path:filename>')
def static_files(filename):
    """Serve static files."""
    return send_from_directory(current_app.config['STATIC_FOLDER'], filename)


@static_bp.route('/favicon.ico')
def favicon():
    """Serve favicon."""
    return send_from_directory(
        current_app.config['STATIC_FOLDER'], 
        'favicon.ico', 
        mimetype='image/vnd.microsoft.icon'
    )


@static_bp.route('/apple-touch-icon.png')
def apple_touch_icon():
    """Serve Apple touch icon."""
    return send_from_directory(
        current_app.config['STATIC_FOLDER'], 
        'apple-touch-icon.png', 
        mimetype='image/png'
    )


@static_bp.route('/android-chrome-192x192.png')
def android_chrome_192():
    """Serve Android Chrome icon 192x192."""
    return send_from_directory(
        current_app.config['STATIC_FOLDER'], 
        'android-chrome-192x192.png', 
        mimetype='image/png'
    )


@static_bp.route('/android-chrome-512x512.png')
def android_chrome_512():
    """Serve Android Chrome icon 512x512."""
    return send_from_directory(
        current_app.config['STATIC_FOLDER'], 
        'android-chrome-512x512.png', 
        mimetype='image/png'
    )


@static_bp.route('/site.webmanifest')
def webmanifest():
    """Serve web manifest."""
    return send_from_directory(
        current_app.config['STATIC_FOLDER'], 
        'site.webmanifest', 
        mimetype='application/manifest+json'
    )