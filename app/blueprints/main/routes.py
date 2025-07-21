from flask import render_template, jsonify
from . import main
from database import test_connection


@main.route('/')
def index():
    """Main landing page."""
    return render_template('index.html')


@main.route('/health')
def health():
    """Health check endpoint."""
    # Test MongoDB connection
    mongo_connected, mongo_message = test_connection()
    
    return {
        'status': 'healthy',
        'mongodb': {
            'connected': mongo_connected,
            'message': mongo_message
        }
    }, 200


@main.route('/mongodb-test')
def mongodb_test():
    """Test MongoDB connection and demonstrate basic operations."""
    from database import get_db, insert_document, find_documents
    import datetime
    
    try:
        # Test connection
        connected, message = test_connection()
        
        if connected:
            # Insert a test document
            test_doc = {
                'type': 'test',
                'timestamp': datetime.datetime.utcnow(),
                'message': 'MongoDB integration test'
            }
            doc_id = insert_document('test_collection', test_doc)
            
            # Retrieve recent test documents
            recent_tests = find_documents('test_collection', {'type': 'test'}, limit=5)
            
            return jsonify({
                'status': 'success',
                'connection': message,
                'inserted_id': str(doc_id),
                'recent_tests': [
                    {
                        'id': str(doc.get('_id')),
                        'timestamp': doc.get('timestamp').isoformat() if doc.get('timestamp') else None,
                        'message': doc.get('message')
                    }
                    for doc in recent_tests
                ]
            })
        else:
            return jsonify({
                'status': 'error',
                'connection': message
            }), 503
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500