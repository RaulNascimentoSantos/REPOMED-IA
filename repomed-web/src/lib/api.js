import axios from 'axios'

// API instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8085',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API methods
export const documentsApi = {
  create: (data) => api.post('/api/documents', data),
  getById: (id) => api.get(`/api/documents/${id}`),
  list: (params) => api.get('/api/documents', { params }),
  sign: (id, data) => api.post(`/api/documents/${id}/sign`, data),
  generatePDF: (id) => api.get(`/api/documents/${id}/pdf`, { 
    responseType: 'blob' 
  }),
}

export const templatesApi = {
  list: () => api.get('/api/templates'),
  getById: (id) => api.get(`/api/templates/${id}`),
}

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
}

export default api