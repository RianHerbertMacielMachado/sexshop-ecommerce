import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '@/lib/api'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean

  login: (email: string, password: string) => Promise<void>
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  setUser: (user: User) => void
  setToken: (token: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          const { user, accessToken } = data.data
          localStorage.setItem('accessToken', accessToken)
          set({ user, accessToken, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (registerData) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', registerData)
          const { user, accessToken } = data.data
          localStorage.setItem('accessToken', accessToken)
          set({ user, accessToken, isAuthenticated: true, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch {
          // ignora erro no logout
        } finally {
          localStorage.removeItem('accessToken')
          set({ user: null, accessToken: null, isAuthenticated: false })
        }
      },

      refreshUser: async () => {
        const { accessToken } = get()
        if (!accessToken) return
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data.data.user, isAuthenticated: true })
        } catch {
          get().clearAuth()
        }
      },

      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => {
        localStorage.setItem('accessToken', token)
        set({ accessToken: token })
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken')
        set({ user: null, accessToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
