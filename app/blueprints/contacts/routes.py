"""Contact management routes."""
from flask import render_template, jsonify, request
from datetime import datetime
from bson import ObjectId
from . import contacts
from database import get_db, insert_document, find_documents, update_document, delete_document


@contacts.route('/')
def index():
    """Display the contacts page."""
    return render_template('contacts.html')


@contacts.route('/api/list', methods=['GET'])
def list_contacts():
    """API endpoint to get all contacts."""
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


@contacts.route('/api/add', methods=['POST'])
def add_contact():
    """API endpoint to add a new contact."""
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


@contacts.route('/api/update/<contact_id>', methods=['PUT'])
def update_contact(contact_id):
    """API endpoint to update a contact."""
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


@contacts.route('/api/delete/<contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    """API endpoint to delete a contact."""
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