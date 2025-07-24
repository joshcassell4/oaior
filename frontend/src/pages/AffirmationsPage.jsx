import React, { useState, useEffect } from 'react'
import { Button, Modal, Input, Alert, Loading, Card } from '../components/UI'
import { affirmationsService } from '../services/affirmations'

function AffirmationsPage() {
  const [affirmations, setAffirmations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAffirmation, setEditingAffirmation] = useState(null)
  const [alert, setAlert] = useState(null)
  
  // Form state for adding affirmations
  const [addFormData, setAddFormData] = useState({
    text: '',
    author: '',
    category: ''
  })
  
  // Form state for editing affirmations
  const [editFormData, setEditFormData] = useState({
    text: '',
    author: '',
    category: ''
  })
  
  // Form errors
  const [formErrors, setFormErrors] = useState({})

  // Load affirmations on mount
  useEffect(() => {
    loadAffirmations()
  }, [])

  const loadAffirmations = async () => {
    try {
      setLoading(true)
      const response = await affirmationsService.getAll()
      if (response.status === 'success') {
        setAffirmations(response.affirmations || [])
      } else {
        showAlert('Error loading affirmations', 'error')
      }
    } catch (error) {
      showAlert('Network error. Please try again.', 'error')
      console.error('Error loading affirmations:', error)
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 5000)
  }

  const handleAddInputChange = (e) => {
    const { name, value } = e.target
    setAddFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (formData) => {
    const errors = {}
    if (!formData.text.trim()) {
      errors.text = 'Affirmation text is required'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm(addFormData)) return

    try {
      const response = await affirmationsService.create(addFormData)
      if (response.status === 'success') {
        showAlert('Affirmation added successfully!', 'success')
        setAddFormData({ text: '', author: '', category: '' })
        loadAffirmations()
      } else {
        showAlert(response.message || 'Error adding affirmation', 'error')
      }
    } catch (error) {
      showAlert('Network error. Please try again.', 'error')
      console.error('Error adding affirmation:', error)
    }
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm(editFormData)) return

    try {
      const response = await affirmationsService.update(editingAffirmation._id, editFormData)
      if (response.status === 'success') {
        showAlert('Affirmation updated successfully!', 'success')
        closeModal()
        loadAffirmations()
      } else {
        showAlert(response.message || 'Error updating affirmation', 'error')
      }
    } catch (error) {
      showAlert('Network error. Please try again.', 'error')
      console.error('Error updating affirmation:', error)
    }
  }

  const handleDelete = async (affirmationId) => {
    if (!window.confirm('Are you sure you want to delete this affirmation?')) {
      return
    }

    try {
      const response = await affirmationsService.delete(affirmationId)
      if (response.status === 'success') {
        showAlert('Affirmation deleted successfully!', 'success')
        loadAffirmations()
      } else {
        showAlert(response.message || 'Error deleting affirmation', 'error')
      }
    } catch (error) {
      showAlert('Network error. Please try again.', 'error')
      console.error('Error deleting affirmation:', error)
    }
  }

  const handleEdit = (affirmation) => {
    setEditingAffirmation(affirmation)
    setEditFormData({
      text: affirmation.text || '',
      author: affirmation.author || '',
      category: affirmation.category || ''
    })
    setFormErrors({})
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingAffirmation(null)
    setEditFormData({ text: '', author: '', category: '' })
    setFormErrors({})
  }

  if (loading) {
    return (
      <div className="container" style={{ marginTop: '80px', padding: '2rem 0' }}>
        <Loading message="Loading affirmations..." />
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
      
      <div className="header-section">
        <h1>Affirmations Manager</h1>
        <p>Manage positive affirmations that appear on the landing page</p>
      </div>

      {/* Add Affirmation Form */}
      <Card variant="elevated" className="add-affirmation-section">
        <h2>Add New Affirmation</h2>
        <form onSubmit={handleAddSubmit}>
          <Input
            type="textarea"
            label="Affirmation Text"
            name="text"
            value={addFormData.text}
            onChange={handleAddInputChange}
            error={formErrors.text}
            rows={3}
            required
          />
          
          <div className="form-row">
            <Input
              label="Author"
              name="author"
              value={addFormData.author}
              onChange={handleAddInputChange}
              placeholder="Optional"
            />
            
            <Input
              label="Category"
              name="category"
              value={addFormData.category}
              onChange={handleAddInputChange}
              placeholder="Optional"
            />
          </div>
          
          <Button type="submit" variant="primary">
            Add Affirmation
          </Button>
        </form>
      </Card>

      {/* Affirmations List */}
      <div className="affirmations-list-section">
        <h2>Current Affirmations</h2>
        <div className="count-info">
          Total: {affirmations.length} affirmation{affirmations.length !== 1 ? 's' : ''}
        </div>
        
        {affirmations.length === 0 ? (
          <Card variant="bordered" className="empty-state">
            <p>No affirmations found.</p>
            <p>Add your first affirmation using the form above!</p>
          </Card>
        ) : (
          <div className="affirmations-list">
            {affirmations.map(affirmation => (
              <Card key={affirmation._id} variant="bordered" hoverable>
                <div className="affirmation-text">
                  "{affirmation.text}"
                </div>
                <div className="affirmation-meta">
                  <div className="affirmation-info">
                    {affirmation.author && (
                      <span className="affirmation-author">— {affirmation.author}</span>
                    )}
                    {affirmation.category && (
                      <span className="affirmation-category">[{affirmation.category}]</span>
                    )}
                  </div>
                  <div className="affirmation-actions">
                    <Button 
                      onClick={() => handleEdit(affirmation)} 
                      variant="secondary"
                      className="btn-small btn-edit"
                    >
                      Edit
                    </Button>
                    <Button 
                      onClick={() => handleDelete(affirmation._id)} 
                      variant="danger"
                      className="btn-small"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title="Edit Affirmation"
        footer={
          <>
            <Button onClick={closeModal} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleUpdateSubmit} variant="primary">
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateSubmit}>
          <Input
            type="textarea"
            label="Affirmation Text"
            name="text"
            value={editFormData.text}
            onChange={handleEditInputChange}
            error={formErrors.text}
            rows={3}
            required
          />
          
          <div className="form-row">
            <Input
              label="Author"
              name="author"
              value={editFormData.author}
              onChange={handleEditInputChange}
            />
            
            <Input
              label="Category"
              name="category"
              value={editFormData.category}
              onChange={handleEditInputChange}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AffirmationsPage