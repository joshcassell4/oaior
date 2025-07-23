"""Affirmation management routes."""
from flask import render_template, jsonify, request
from datetime import datetime
from bson import ObjectId
import random
from . import affirmations
from database import get_db, insert_document, find_documents, update_document, delete_document


@affirmations.route('/')
def index():
    """Display the affirmations management page."""
    return render_template('affirmations.html')


@affirmations.route('/api/list', methods=['GET'])
def list_affirmations():
    """API endpoint to get all affirmations."""
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


@affirmations.route('/api/add', methods=['POST'])
def add_affirmation():
    """API endpoint to add a new affirmation."""
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


@affirmations.route('/api/update/<affirmation_id>', methods=['PUT'])
def update_affirmation(affirmation_id):
    """API endpoint to update an affirmation."""
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


@affirmations.route('/api/delete/<affirmation_id>', methods=['DELETE'])
def delete_affirmation(affirmation_id):
    """API endpoint to delete an affirmation."""
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


@affirmations.route('/api/random', methods=['GET'])
def get_random_affirmation():
    """API endpoint to get a random affirmation."""
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