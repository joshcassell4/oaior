import api from './api'

export const healthService = {
  // Check API health
  checkHealth: async () => {
    const response = await api.get('/v1/health')
    return response.data
  },

  // Check API status
  checkStatus: async () => {
    const response = await api.get('/v1/system/status')
    return response.data
  },

  // Test MongoDB connection
  testMongoDB: async () => {
    const response = await api.get('/v1/system/mongodb-test')
    return response.data
  }
}