import { create } from 'zustand'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// API Response interfaces
export interface DiagnosisResponse {
  id: number
  crop_name: string
  description: string
  image_url?: string
  audio_url?: string
  result: string
  created_at: string
  status: string
}

export interface ChatMessage {
  id: number
  diagnosis_id: number
  user_message: string
  ai_response: string
  created_at: string
}

export interface CommunityPost {
  id: number
  author_name: string
  content: string
  likes: number
  comments: number
  created_at: string
}

export interface MarketplaceListing {
  id: number
  title: string
  description: string
  price: number
  category: string
  seller_name: string
  rating: number
  created_at: string
}

// Type-safe API client
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)
