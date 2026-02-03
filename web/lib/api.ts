import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authAPI = {
  login: (username: string, password: string) =>
    apiClient.post('/auth/token', {username, password }),
  register: (first_name: string, last_name: string, username: string, role: string, email: string, password: string, language: string) =>
    apiClient.post('/auth/register', {first_name, last_name, username, role, email, password, language }),
  logout: () => {
    localStorage.removeItem('access_token')
  },
}

export const diagnosisAPI = {
  getDiagnoses: () => apiClient.get('/diagnosis/'),
  getDiagnosis: (id: number) => apiClient.get(`/diagnosis/${id}`),
  createDiagnosis: (data: FormData) =>
    apiClient.post('/diagnosis/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  transcribeAudio: (audioFile: File, language: string = "English") => {
    const formData = new FormData()
    formData.append('file', audioFile)
    return apiClient.post(`/diagnosis/transcribe?language=${language}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const chatAPI = {
  getChats: (diagnosisId: number) =>
    apiClient.get(`/chat/diagnosis/${diagnosisId}`),
  sendMessage: (diagnosisId: number, message: string) =>
    apiClient.post('/chat/private', {
      diagnosis_id: diagnosisId,
      message,
    }),
}



export default apiClient
