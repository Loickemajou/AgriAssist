import { create } from 'zustand'

interface AuthState {
  token: string | null
  user: any | null
  isAuthenticated: boolean
  login: (token: string, user: any) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
  user: null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false,
  login: (token: string, user: any) => {
    localStorage.setItem('access_token', token)
    set({ token, user, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('access_token')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))

interface DiagnosisState {
  currentDiagnosis: any | null
  diagnoses: any[]
  setCurrentDiagnosis: (diagnosis: any) => void
  setDiagnoses: (diagnoses: any[]) => void
}

export const useDiagnosisStore = create<DiagnosisState>((set) => ({
  currentDiagnosis: null,
  diagnoses: [],
  setCurrentDiagnosis: (diagnosis) => set({ currentDiagnosis: diagnosis }),
  setDiagnoses: (diagnoses) => set({ diagnoses }),
}))
