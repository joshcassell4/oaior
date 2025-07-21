from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory('static', filename)

# Favicon routes
@app.route('/favicon.ico')
def favicon():
    return send_from_directory('static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/apple-touch-icon.png')
def apple_touch_icon():
    return send_from_directory('static', 'apple-touch-icon.png', mimetype='image/png')

@app.route('/android-chrome-192x192.png')
def android_chrome_192():
    return send_from_directory('static', 'android-chrome-192x192.png', mimetype='image/png')

@app.route('/android-chrome-512x512.png')
def android_chrome_512():
    return send_from_directory('static', 'android-chrome-512x512.png', mimetype='image/png')

@app.route('/site.webmanifest')
def webmanifest():
    return send_from_directory('static', 'site.webmanifest', mimetype='application/manifest+json')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)