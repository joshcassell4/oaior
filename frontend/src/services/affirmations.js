import api from './api'

export const affirmationsService = {
  // Get all affirmations
  getAll: async () => {
    const response = await api.get('/v1/affirmations')
    return response.data
  },

  // Get random affirmation
  getRandom: async () => {
    const response = await api.get('/v1/affirmations/random')
    return response.data
  },

  // Create new affirmation
  create: async (affirmationData) => {
    const response = await api.post('/v1/affirmations', affirmationData)
    return response.data
  },

  // Update affirmation
  update: async (id, affirmationData) => {
    const response = await api.put(`/v1/affirmations/${id}`, affirmationData)
    return response.data
  },

  // Delete affirmation
  delete: async (id) => {
    const response = await api.delete(`/v1/affirmations/${id}`)
    return response.data
  }
}