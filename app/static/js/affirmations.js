/**
 * Affirmations Management JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // Load affirmations on page load
    loadAffirmations();
    
    // Setup form event listeners
    setupFormListeners();
    
    // Setup modal event listeners
    setupModalListeners();
});

/**
 * Load all affirmations from the API
 */
function loadAffirmations() {
    const affirmationsList = document.getElementById('affirmationsList');
    const affirmationsCount = document.getElementById('affirmationsCount');
    
    // Show loading state
    affirmationsList.innerHTML = '<div class="loading">Loading affirmations...</div>';
    
    fetch('/affirmations/api/list')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displayAffirmations(data.affirmations);
                affirmationsCount.textContent = `Total: ${data.count} affirmation${data.count !== 1 ? 's' : ''}`;
            } else {
                showError('Failed to load affirmations: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error loading affirmations:', error);
            showError('Failed to load affirmations. Please try again.');
        });
}

/**
 * Display affirmations in the list
 */
function displayAffirmations(affirmations) {
    const affirmationsList = document.getElementById('affirmationsList');
    
    if (affirmations.length === 0) {
        affirmationsList.innerHTML = `
            <div class="empty-state">
                <p>No affirmations found.</p>
                <p>Add your first affirmation using the form above!</p>
            </div>
        `;
        return;
    }
    
    affirmationsList.innerHTML = affirmations.map(affirmation => `
        <div class="affirmation-card" data-id="${affirmation._id}">
            <div class="affirmation-text">"${escapeHtml(affirmation.text)}"</div>
            <div class="affirmation-meta">
                <div class="affirmation-info">
                    ${affirmation.author ? `<span class="affirmation-author">${escapeHtml(affirmation.author)}</span>` : ''}
                    ${affirmation.category ? `<span class="affirmation-category">[${escapeHtml(affirmation.category)}]</span>` : ''}
                </div>
                <div class="affirmation-actions">
                    <button class="btn-edit" onclick="editAffirmation('${affirmation._id}')">Edit</button>
                    <button class="btn-delete" onclick="deleteAffirmation('${affirmation._id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Setup form event listeners
 */
function setupFormListeners() {
    // Add affirmation form
    const addForm = document.getElementById('addAffirmationForm');
    addForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addAffirmation();
    });
    
    // Edit affirmation form
    const editForm = document.getElementById('editAffirmationForm');
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        updateAffirmation();
    });
}

/**
 * Setup modal event listeners
 */
function setupModalListeners() {
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.close');
    
    // Close modal when clicking the X
    closeBtn.addEventListener('click', closeEditModal);
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeEditModal();
        }
    });
}

/**
 * Add a new affirmation
 */
function addAffirmation() {
    const form = document.getElementById('addAffirmationForm');
    const formData = new FormData(form);
    
    const data = {
        text: formData.get('text'),
        author: formData.get('author'),
        category: formData.get('category')
    };
    
    fetch('/affirmations/api/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showSuccess('Affirmation added successfully!');
            form.reset();
            loadAffirmations(); // Reload the list
        } else {
            showError('Failed to add affirmation: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error adding affirmation:', error);
        showError('Failed to add affirmation. Please try again.');
    });
}

/**
 * Edit an affirmation
 */
function editAffirmation(id) {
    // Find the affirmation data from the DOM
    const card = document.querySelector(`[data-id="${id}"]`);
    const text = card.querySelector('.affirmation-text').textContent.slice(1, -1); // Remove quotes
    const authorElement = card.querySelector('.affirmation-author');
    const categoryElement = card.querySelector('.affirmation-category');
    
    const author = authorElement ? authorElement.textContent.substring(2) : ''; // Remove "— "
    const category = categoryElement ? categoryElement.textContent.slice(1, -1) : ''; // Remove brackets
    
    // Populate the edit form
    document.getElementById('editAffirmationId').value = id;
    document.getElementById('editAffirmationText').value = text;
    document.getElementById('editAffirmationAuthor').value = author;
    document.getElementById('editAffirmationCategory').value = category;
    
    // Show the modal
    document.getElementById('editModal').style.display = 'block';
}

/**
 * Update an affirmation
 */
function updateAffirmation() {
    const form = document.getElementById('editAffirmationForm');
    const formData = new FormData(form);
    const id = document.getElementById('editAffirmationId').value;
    
    const data = {
        text: formData.get('text'),
        author: formData.get('author'),
        category: formData.get('category')
    };
    
    fetch(`/affirmations/api/update/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showSuccess('Affirmation updated successfully!');
            closeEditModal();
            loadAffirmations(); // Reload the list
        } else {
            showError('Failed to update affirmation: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error updating affirmation:', error);
        showError('Failed to update affirmation. Please try again.');
    });
}

/**
 * Delete an affirmation
 */
function deleteAffirmation(id) {
    if (!confirm('Are you sure you want to delete this affirmation?')) {
        return;
    }
    
    fetch(`/affirmations/api/delete/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showSuccess('Affirmation deleted successfully!');
            loadAffirmations(); // Reload the list
        } else {
            showError('Failed to delete affirmation: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting affirmation:', error);
        showError('Failed to delete affirmation. Please try again.');
    });
}

/**
 * Close the edit modal
 */
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

/**
 * Show success message
 */
function showSuccess(message) {
    // Create a temporary success message element
    const successDiv = document.createElement('div');
    successDiv.className = 'alert alert-success';
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 1001;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    `;
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        document.body.removeChild(successDiv);
    }, 3000);
}

/**
 * Show error message
 */
function showError(message) {
    // Create a temporary error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-error';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 1001;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        document.body.removeChild(errorDiv);
    }, 5000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}