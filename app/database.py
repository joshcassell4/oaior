"""MongoDB database connection and utilities."""
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from flask import current_app, g


def get_db():
    """Get MongoDB database connection from Flask g object or create new one."""
    if 'mongodb' not in g:
        g.mongodb = MongoClient(current_app.config['MONGODB_URI'])
    
    if 'db' not in g:
        g.db = g.mongodb[current_app.config['MONGODB_DATABASE']]
    
    return g.db


def close_db(error=None):
    """Close MongoDB connection."""
    mongodb = g.pop('mongodb', None)
    if mongodb is not None:
        mongodb.close()


def init_app(app):
    """Initialize MongoDB with Flask app."""
    app.teardown_appcontext(close_db)
    
    # Test connection on startup
    with app.app_context():
        try:
            client = MongoClient(app.config['MONGODB_URI'], serverSelectionTimeoutMS=5000)
            # The ismaster command is cheap and does not require auth.
            client.admin.command('ismaster')
            app.logger.info(f"Successfully connected to MongoDB at {app.config['MONGODB_URI']}")
        except ConnectionFailure as e:
            app.logger.warning(f"MongoDB connection failed: {e}")
            app.logger.warning("Application will start without MongoDB. Some features may be unavailable.")
        except Exception as e:
            app.logger.error(f"Unexpected error connecting to MongoDB: {e}")


def test_connection():
    """Test MongoDB connection."""
    try:
        db = get_db()
        # Perform a simple operation to test the connection
        db.list_collection_names()
        return True, "MongoDB connection successful"
    except Exception as e:
        return False, f"MongoDB connection failed: {str(e)}"


# Example utility functions for common operations
def insert_document(collection_name, document):
    """Insert a document into a collection."""
    db = get_db()
    collection = db[collection_name]
    result = collection.insert_one(document)
    return result.inserted_id


def find_documents(collection_name, query=None, limit=None):
    """Find documents in a collection."""
    db = get_db()
    collection = db[collection_name]
    
    if query is None:
        query = {}
    
    cursor = collection.find(query)
    
    if limit:
        cursor = cursor.limit(limit)
    
    return list(cursor)


def update_document(collection_name, query, update_data):
    """Update a document in a collection."""
    db = get_db()
    collection = db[collection_name]
    result = collection.update_one(query, {'$set': update_data})
    return result.modified_count


def delete_document(collection_name, query):
    """Delete a document from a collection."""
    db = get_db()
    collection = db[collection_name]
    result = collection.delete_one(query)
    return result.deleted_count