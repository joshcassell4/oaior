import api from './api'

export const contactsService = {
  // Get all contacts
  getAll: async () => {
    const response = await api.get('/v1/contacts')
    return response.data
  },

  // Create new contact
  create: async (contactData) => {
    const response = await api.post('/v1/contacts', contactData)
    return response.data
  },

  // Update contact
  update: async (id, contactData) => {
    const response = await api.put(`/v1/contacts/${id}`, contactData)
    return response.data
  },

  // Delete contact
  delete: async (id) => {
    const response = await api.delete(`/v1/contacts/${id}`)
    return response.data
  }
}