import { create } from 'zustand'
import {
  api,
  clearStoredSession,
  getApiErrorMessage,
  readStoredSession,
  saveStoredSession,
  setUnauthorizedHandler,
} from '../lib/api'
import type { AuthResponse, LoginRequest, RegisterRequest, UserResponse } from '../types'
import { useCarStore } from './useCarStore'
import { useGarageStore } from './useGarageStore'

type AuthStatus = 'anonymous' | 'checking' | 'authenticated'

interface AuthState {
  token: string | null
  expiresAt: number | null
  user: UserResponse | null
  status: AuthStatus
  busy: boolean
  error: string | null
  login: (credentials: LoginRequest) => Promise<void>
  register: (details: RegisterRequest) => Promise<void>
  restoreSession: () => Promise<void>
  refreshUser: () => Promise<void>
  deleteAccount: () => Promise<void>
  logout: () => void
  clearError: () => void
}

const initialSession = readStoredSession()
let restorePromise: Promise<void> | null = null

function clearLocalAuth(): void {
  clearStoredSession()
  useCarStore.getState().reset()
  useGarageStore.getState().reset()
  useAuthStore.setState({
    token: null,
    expiresAt: null,
    user: null,
    status: 'anonymous',
    busy: false,
    error: null,
  })
}

function acceptAuth(response: AuthResponse): void {
  const session = saveStoredSession(response.accessToken, response.expiresInSeconds)
  useCarStore.getState().reset()
  useGarageStore.getState().reset()
  useAuthStore.setState({
    token: session.accessToken,
    expiresAt: session.expiresAt,
    user: response.user,
    status: 'authenticated',
    busy: false,
    error: null,
  })
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialSession?.accessToken ?? null,
  expiresAt: initialSession?.expiresAt ?? null,
  user: null,
  status: initialSession ? 'checking' : 'anonymous',
  busy: false,
  error: null,

  login: async (credentials) => {
    set({ busy: true, error: null })
    try {
      const { data } = await api.post<AuthResponse>('/api/auth/login', credentials)
      acceptAuth(data)
    } catch (error: unknown) {
      set({ busy: false, error: getApiErrorMessage(error, 'Accesso non riuscito.') })
      throw error
    }
  },

  register: async (details) => {
    set({ busy: true, error: null })
    try {
      const { data } = await api.post<AuthResponse>('/api/auth/register', details)
      acceptAuth(data)
    } catch (error: unknown) {
      set({ busy: false, error: getApiErrorMessage(error, 'Registrazione non riuscita.') })
      throw error
    }
  },

  restoreSession: () => {
    if (restorePromise) return restorePromise

    const session = readStoredSession()
    if (!session) {
      clearLocalAuth()
      return Promise.resolve()
    }

    set({ token: session.accessToken, expiresAt: session.expiresAt, status: 'checking' })
    restorePromise = get().refreshUser().finally(() => {
      restorePromise = null
    })
    return restorePromise
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get<UserResponse>('/api/users/me')
      set({ user: data, status: 'authenticated', error: null })
    } catch (error: unknown) {
      if (readStoredSession()) {
        set({ status: 'checking', error: getApiErrorMessage(error) })
      } else {
        clearLocalAuth()
      }
      throw error
    }
  },

  deleteAccount: async () => {
    set({ busy: true, error: null })
    try {
      await api.delete<void>('/api/users/me')
      clearLocalAuth()
    } catch (error: unknown) {
      set({ busy: false, error: getApiErrorMessage(error, 'Eliminazione non riuscita.') })
      throw error
    }
  },

  logout: clearLocalAuth,
  clearError: () => set({ error: null }),
}))

setUnauthorizedHandler(clearLocalAuth)
