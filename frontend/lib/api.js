import axios from 'axios'

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Auto add token
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mediverify_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  walletLogin: (data) => API.post('/auth/wallet-login', data),
  getMe: () => API.get('/auth/me'),
}

// Verify APIs
export const verifyAPI = {
  scan: (data) => API.post('/verify/scan', data),
  getStats: () => API.get('/verify/stats'),
}

// Medicine APIs
export const medicineAPI = {
  register: (data) => API.post('/medicines/register', data),
  getAll: (params) => API.get('/medicines', { params }),
  getOne: (id) => API.get(`/medicines/${id}`),
}

// Batch APIs
export const batchAPI = {
  create: (data) => API.post('/batches', data),
  getAll: () => API.get('/batches'),
  getDashboard: () => API.get('/batches/dashboard'),
}

export default API