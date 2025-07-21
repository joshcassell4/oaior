// Contacts management JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const addContactBtn = document.getElementById('addContactBtn');
    const modal = document.getElementById('addContactModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const addContactForm = document.getElementById('addContactForm');
    const contactsTableBody = document.getElementById('contactsTableBody');
    const noContactsMessage = document.getElementById('noContactsMessage');
    const messageContainer = document.getElementById('messageContainer');

    // Load contacts on page load
    loadContacts();

    // Modal event listeners
    addContactBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        addContactForm.reset();
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        addContactForm.reset();
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            addContactForm.reset();
        }
    });

    // Handle form submission
    addContactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(addContactForm);
        const contactData = {};
        
        for (let [key, value] of formData.entries()) {
            contactData[key] = value;
        }

        try {
            // Send POST request to add contact
            const response = await fetch('/contacts/api/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contactData)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Contact added successfully!', 'success');
                modal.style.display = 'none';
                addContactForm.reset();
                loadContacts(); // Reload contacts
            } else {
                showMessage(result.message || 'Error adding contact', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
            console.error('Error:', error);
        }
    });

    // Load contacts from the server
    async function loadContacts() {
        try {
            const response = await fetch('/contacts/api/list');
            const result = await response.json();

            if (response.ok) {
                displayContacts(result.contacts);
            } else {
                showMessage('Error loading contacts', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
            console.error('Error:', error);
        }
    }

    // Display contacts in the table
    function displayContacts(contacts) {
        contactsTableBody.innerHTML = '';
        
        if (contacts.length === 0) {
            document.querySelector('.contacts-table').style.display = 'none';
            noContactsMessage.style.display = 'block';
            return;
        }

        document.querySelector('.contacts-table').style.display = 'table';
        noContactsMessage.style.display = 'none';

        contacts.forEach(contact => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${contact.first_name} ${contact.last_name}</td>
                <td>${contact.email}</td>
                <td>${contact.phone || '-'}</td>
                <td>${contact.company || '-'}</td>
                <td class="actions">
                    <button class="btn-small btn-edit" onclick="editContact('${contact._id}')">Edit</button>
                    <button class="btn-small btn-delete" onclick="deleteContact('${contact._id}')">Delete</button>
                </td>
            `;
            contactsTableBody.appendChild(row);
        });
    }

    // Show success/error messages
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        messageContainer.innerHTML = '';
        messageContainer.appendChild(messageDiv);
        
        // Auto-hide message after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    // Make functions available globally for onclick handlers
    window.editContact = function(contactId) {
        // TODO: Implement edit functionality
        showMessage('Edit functionality coming soon!', 'info');
    };

    window.deleteContact = async function(contactId) {
        if (!confirm('Are you sure you want to delete this contact?')) {
            return;
        }

        try {
            const response = await fetch(`/contacts/api/delete/${contactId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Contact deleted successfully!', 'success');
                loadContacts(); // Reload contacts
            } else {
                showMessage(result.message || 'Error deleting contact', 'error');
            }
        } catch (error) {
            showMessage('Network error. Please try again.', 'error');
            console.error('Error:', error);
        }
    };
});