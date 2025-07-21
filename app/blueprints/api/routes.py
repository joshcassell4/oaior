from flask import jsonify, request
from . import api


@api.route('/status')
def api_status():
    """API status endpoint."""
    return jsonify({
        'status': 'active',
        'version': '1.0.0',
        'message': 'API is running'
    })


@api.route('/echo', methods=['POST'])
def echo():
    """Echo endpoint for testing - returns the posted JSON data."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No JSON data provided'}), 400
    
    return jsonify({
        'echo': data,
        'timestamp': request.headers.get('Date', 'Unknown')
    })


# Example endpoint structure for future development
@api.route('/users', methods=['GET'])
def get_users():
    """Example users endpoint - to be implemented."""
    # This is a placeholder for future implementation
    return jsonify({
        'users': [],
        'count': 0,
        'message': 'This endpoint is not yet implemented'
    }), 501  # 501 Not Implemented