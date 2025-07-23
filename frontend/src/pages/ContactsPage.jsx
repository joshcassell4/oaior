import React, { useState, useEffect } from 'react'
import { Button, Modal, Input, Alert, Loading, Card } from '../components/UI'
import { contactsService } from '../services/contacts'

function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [alert, setAlert] = useState(null)
  
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  })
  
  // Form errors
  const [formErrors, setFormErrors] = useState({})

  // Load contacts on mount
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const response = await contactsService.getAll()
      if (response.status === 'success') {
        setContacts(response.contacts || [])
      } else {
        showAlert('Error loading contacts', 'error')
      }
    } catch (error) {
      showAlert('Network error. Please try again.', 'error')
      console.error('Error loading contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 5000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.first_name.trim()) errors.first_name = 'First name is required'
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required'
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      if (editingContact) {
        // Update existing contact
        const response = await contactsService.update(editingContact._id, formData)
        if (response.status === 'success') {
          showAlert('Contact updated successfully!', 'success')
          closeModal()
          loadContacts()
        } else {
          showAlert(response.message || 'Error updating contact', 'error')
        }
      } else {
        // Create new contact
        const response = await contactsService.create(formData)
        if (response.status === 'success') {
          showAlert('Contact added successfully!', 'success')
          closeModal()
          loadContacts()
        } else {
          showAlert(response.message || 'Error adding contact', 'error')
        }
      }
    } catch (error) {
      showAlert('Network error. Please try again.', 'error')
      console.error('Error saving contact:', error)
    }
  }

  const handleDelete = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return
    }

    try {
      const response = await contactsService.delete(contactId)
      if (response.status === 'success') {
        showAlert('Contact deleted successfully!', 'success')
        loadContacts()
      } else {
        showAlert(response.message || 'Error deleting contact', 'error')
      }
    } catch (error) {
      showAlert('Network error. Please try again.', 'error')
      console.error('Error deleting contact:', error)
    }
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setFormData({
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      notes: contact.notes || ''
    })
    setShowModal(true)
  }

  const openAddModal = () => {
    setEditingContact(null)
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      notes: ''
    })
    setFormErrors({})
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingContact(null)
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      notes: ''
    })
    setFormErrors({})
  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '80px', padding: '2rem 0' }}>
        <Loading message="Loading contacts..." />
      </div>
    )
  }

  return (
    <div className="container" style={{ marginTop: '80px', paddingBottom: '2rem' }}>
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onDismiss={() => setAlert(null)}
          autoHide
        />
      )}
      
      <div className="contacts-header">
        <h1>Contacts</h1>
        <Button onClick={openAddModal} variant="primary">
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <Card variant="bordered" className="no-contacts">
          <p style={{ textAlign: 'center', color: '#666', margin: '3rem 0' }}>
            No contacts found. Click "Add Contact" to create your first contact.
          </p>
        </Card>
      ) : (
        <div className="contacts-table-container">
          <table className="contacts-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Company</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact._id}>
                  <td>{contact.first_name} {contact.last_name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone || '-'}</td>
                  <td>{contact.company || '-'}</td>
                  <td className="actions">
                    <Button 
                      onClick={() => handleEdit(contact)} 
                      variant="secondary" 
                      className="btn-small btn-edit"
                    >
                      Edit
                    </Button>
                    <Button 
                      onClick={() => handleDelete(contact._id)} 
                      variant="danger" 
                      className="btn-small"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingContact ? 'Edit Contact' : 'Add New Contact'}
        footer={
          <>
            <Button onClick={closeModal} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="primary">
              {editingContact ? 'Update' : 'Save'} Contact
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            error={formErrors.first_name}
            required
          />
          
          <Input
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            error={formErrors.last_name}
            required
          />
          
          <Input
            type="email"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            error={formErrors.email}
            required
          />
          
          <Input
            type="tel"
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
          
          <Input
            label="Company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
          />
          
          <Input
            type="textarea"
            label="Notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
          />
        </form>
      </Modal>
    </div>
  )
}

export default ContactsPage