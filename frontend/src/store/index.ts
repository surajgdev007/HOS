import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'
import { authService } from '../services/services'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; username: string; displayName?: string }) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User) => void
  clearError: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const user = await authService.login({ email, password })
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Authentication failed.'
          set({ error: msg, isLoading: false })
          throw new Error(msg)
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const user = await authService.register(data)
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed.'
          set({ error: msg, isLoading: false })
          throw new Error(msg)
        }
      },

      logout: async () => {
        try {
          await authService.logout()
        } finally {
          set({ user: null, isAuthenticated: false })
        }
      },

      setUser: (user) => set({ user, isAuthenticated: true }),

      clearError: () => set({ error: null }),

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false })
          return
        }
        set({ isLoading: true })
        try {
          const user = await authService.getMe()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          localStorage.removeItem('accessToken')
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },
    }),
    {
      name: 'system-auth',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
)

// ============================
// UI STORE
// ============================
interface UIState {
  sidebarOpen: boolean
  showLevelUp: boolean
  levelUpData: { level: number; rank?: string } | null
  showNotification: { message: string; type: 'success' | 'warning' | 'error' | 'info' } | null
  
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  triggerLevelUp: (data: { level: number; rank?: string }) => void
  dismissLevelUp: () => void
  showSystemNotification: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  showLevelUp: false,
  levelUpData: null,
  showNotification: null,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  triggerLevelUp: (data) => {
    set({ showLevelUp: true, levelUpData: data })
    setTimeout(() => set({ showLevelUp: false, levelUpData: null }), 4000)
  },

  dismissLevelUp: () => set({ showLevelUp: false }),

  showSystemNotification: (message, type = 'info') => {
    set({ showNotification: { message, type } })
    setTimeout(() => set({ showNotification: null }), 4000)
  },
}))
