"""
Consolidated API v1 routes.
This blueprint unifies all API endpoints under /api/v1/ structure.
"""
from flask import jsonify, request
from datetime import datetime
from bson import ObjectId
import random
from . import api_v1
from database import test_connection, get_db, insert_document, find_documents, update_document, delete_document


# ============================================================================
# HEALTH & SYSTEM ENDPOINTS
# ============================================================================

@api_v1.route('/health')
def health():
    """System health check endpoint."""
    # Test MongoDB connection
    mongo_connected, mongo_message = test_connection()
    
    return {
        'status': 'healthy',
        'mongodb': {
            'connected': mongo_connected,
            'message': mongo_message
        },
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    }, 200


@api_v1.route('/system/status')
def system_status():
    """API system status endpoint."""
    return jsonify({
        'status': 'active',
        'version': '1.0.0',
        'message': 'API v1 is running',
        'timestamp': datetime.utcnow().isoformat()
    })


@api_v1.route('/system/mongodb-test')
def mongodb_test():
    """Test MongoDB connection and demonstrate basic operations."""
    try:
        # Test connection
        connected, message = test_connection()
        
        if connected:
            # Insert a test document
            test_doc = {
                'type': 'test',
                'timestamp': datetime.utcnow(),
                'message': 'MongoDB integration test - API v1'
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


# ============================================================================
# CONTACTS ENDPOINTS
# ============================================================================

@api_v1.route('/contacts', methods=['GET'])
def list_contacts():
    """Get all contacts."""
    try:
        # Get all contacts from database
        contacts_list = find_documents('contacts')
        
        # Convert ObjectId to string for JSON serialization
        for contact in contacts_list:
            contact['_id'] = str(contact['_id'])
            # Convert datetime objects to ISO format strings
            if 'created_at' in contact and contact['created_at']:
                contact['created_at'] = contact['created_at'].isoformat()
            if 'updated_at' in contact and contact['updated_at']:
                contact['updated_at'] = contact['updated_at'].isoformat()
        
        return jsonify({
            'status': 'success',
            'contacts': contacts_list,
            'count': len(contacts_list)
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@api_v1.route('/contacts', methods=['POST'])
def create_contact():
    """Create a new contact."""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'status': 'error',
                    'message': f'{field} is required'
                }), 400
        
        # Create contact document
        contact = {
            'first_name': data.get('first_name', '').strip(),
            'last_name': data.get('last_name', '').strip(),
            'email': data.get('email', '').strip().lower(),
            'phone': data.get('phone', '').strip(),
            'company': data.get('company', '').strip(),
            'notes': data.get('notes', '').strip(),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Insert into database
        contact_id = insert_document('contacts', contact)
        
        return jsonify({
            'status': 'success',
            'message': 'Contact added successfully',
            'contact_id': str(contact_id)
        }), 201
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@api_v1.route('/contacts/<contact_id>', methods=['PUT'])
def update_contact(contact_id):
    """Update a contact."""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Prepare update data
        update_data = {}
        
        # Only update fields that are provided
        fields = ['first_name', 'last_name', 'email', 'phone', 'company', 'notes']
        for field in fields:
            if field in data:
                update_data[field] = data[field].strip() if isinstance(data[field], str) else data[field]
        
        # Add updated timestamp
        update_data['updated_at'] = datetime.utcnow()
        
        # Update the document
        modified_count = update_document(
            'contacts',
            {'_id': ObjectId(contact_id)},
            update_data
        )
        
        if modified_count > 0:
            return jsonify({
                'status': 'success',
                'message': 'Contact updated successfully'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Contact not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@api_v1.route('/contacts/<contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    """Delete a contact."""
    try:
        # Delete the document
        deleted_count = delete_document(
            'contacts',
            {'_id': ObjectId(contact_id)}
        )
        
        if deleted_count > 0:
            return jsonify({
                'status': 'success',
                'message': 'Contact deleted successfully'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Contact not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


# ============================================================================
# AFFIRMATIONS ENDPOINTS
# ============================================================================

@api_v1.route('/affirmations', methods=['GET'])
def list_affirmations():
    """Get all affirmations."""
    try:
        # Get all affirmations from database
        affirmations_list = find_documents('affirmations')
        
        # Convert ObjectId to string for JSON serialization
        for affirmation in affirmations_list:
            affirmation['_id'] = str(affirmation['_id'])
            # Convert datetime objects to ISO format strings
            if 'created_at' in affirmation and affirmation['created_at']:
                affirmation['created_at'] = affirmation['created_at'].isoformat()
            if 'updated_at' in affirmation and affirmation['updated_at']:
                affirmation['updated_at'] = affirmation['updated_at'].isoformat()
        
        return jsonify({
            'status': 'success',
            'affirmations': affirmations_list,
            'count': len(affirmations_list)
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@api_v1.route('/affirmations', methods=['POST'])
def create_affirmation():
    """Create a new affirmation."""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate required fields
        if not data or 'text' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Text field is required'
            }), 400
        
        # Create affirmation document
        affirmation = {
            'text': data['text'].strip(),
            'author': data.get('author', '').strip(),
            'category': data.get('category', '').strip(),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Insert into database
        doc_id = insert_document('affirmations', affirmation)
        
        return jsonify({
            'status': 'success',
            'message': 'Affirmation added successfully',
            'id': str(doc_id)
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@api_v1.route('/affirmations/random', methods=['GET'])
def get_random_affirmation():
    """Get a random affirmation."""
    try:
        # Get all affirmations from database
        affirmations_list = find_documents('affirmations')
        
        if not affirmations_list:
            return jsonify({
                'status': 'success',
                'affirmation': None,
                'message': 'No affirmations found'
            })
        
        # Select a random affirmation
        random_affirmation = random.choice(affirmations_list)
        
        # Convert ObjectId to string
        random_affirmation['_id'] = str(random_affirmation['_id'])
        if 'created_at' in random_affirmation and random_affirmation['created_at']:
            random_affirmation['created_at'] = random_affirmation['created_at'].isoformat()
        if 'updated_at' in random_affirmation and random_affirmation['updated_at']:
            random_affirmation['updated_at'] = random_affirmation['updated_at'].isoformat()
        
        return jsonify({
            'status': 'success',
            'affirmation': random_affirmation
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@api_v1.route('/affirmations/<affirmation_id>', methods=['PUT'])
def update_affirmation(affirmation_id):
    """Update an affirmation."""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate affirmation_id
        try:
            obj_id = ObjectId(affirmation_id)
        except:
            return jsonify({
                'status': 'error',
                'message': 'Invalid affirmation ID'
            }), 400
        
        # Prepare update data
        update_data = {}
        if 'text' in data:
            update_data['text'] = data['text'].strip()
        if 'author' in data:
            update_data['author'] = data['author'].strip()
        if 'category' in data:
            update_data['category'] = data['category'].strip()
        
        if not update_data:
            return jsonify({
                'status': 'error',
                'message': 'No valid fields to update'
            }), 400
        
        update_data['updated_at'] = datetime.utcnow()
        
        # Update in database
        modified_count = update_document('affirmations', {'_id': obj_id}, update_data)
        
        if modified_count > 0:
            return jsonify({
                'status': 'success',
                'message': 'Affirmation updated successfully'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Affirmation not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@api_v1.route('/affirmations/<affirmation_id>', methods=['DELETE'])
def delete_affirmation(affirmation_id):
    """Delete an affirmation."""
    try:
        # Validate affirmation_id
        try:
            obj_id = ObjectId(affirmation_id)
        except:
            return jsonify({
                'status': 'error',
                'message': 'Invalid affirmation ID'
            }), 400
        
        # Delete from database
        deleted_count = delete_document('affirmations', {'_id': obj_id})
        
        if deleted_count > 0:
            return jsonify({
                'status': 'success',
                'message': 'Affirmation deleted successfully'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Affirmation not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500