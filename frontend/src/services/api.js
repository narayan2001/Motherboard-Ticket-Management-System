import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const BASE_URL = API_URL.replace('/api', '') // Remove /api for static file access

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Helper function to get full image URL
export const getImageURL = (imagePath) => {
  if (!imagePath) return null
  if (imagePath.startsWith('http')) return imagePath // Already full URL
  return `${BASE_URL}${imagePath}` // Prepend base URL
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data)
}

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
}

export const ticketService = {
  getAll: (params) => api.get('/tickets', { params }),
  getOne: (id) => api.get(`/tickets/${id}`),
  create: (formData) => {
    return axios.post(`${API_URL}/tickets`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.data)
  },
  updateStatus: (id, status, notes) => api.put(`/tickets/${id}/status`, { status, notes }),
  submitDiagnosis: (id, data) => api.post(`/tickets/${id}/diagnosis`, data),
  submitPayment: (id, data) => api.post(`/tickets/${id}/payment`, data),
  addImages: (id, formData) => {
    return axios.post(`${API_URL}/tickets/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.data)
  },
  deleteImage: (id, imageIndex) => api.delete(`/tickets/${id}/images/${imageIndex}`)
}

export const dashboardService = {
  getStats: (params) => api.get('/dashboard/stats', { params }),
  getReports: (params) => api.get('/dashboard/reports', { params })
}

export const motherboardService = {
  getAll: (params) => api.get('/motherboards', { params }),
  create: (data) => api.post('/motherboards', data),
  update: (id, data) => api.put(`/motherboards/${id}`, data),
  delete: (id) => api.delete(`/motherboards/${id}`)
}

export default api
