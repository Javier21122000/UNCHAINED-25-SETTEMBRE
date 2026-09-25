import axios from 'axios'
import type { ApiErrorResponse } from '../types'

const TOKEN_KEY = 'saloneAuto.accessToken'
const EXPIRY_KEY = 'saloneAuto.expiresAt'

type UnauthorizedHandler = () => void

let onUnauthorized: UnauthorizedHandler | null = null

export interface StoredSession {
  accessToken: string
  expiresAt: number
}

export function clearStoredSession(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
  window.localStorage.removeItem(EXPIRY_KEY)
}

export function readStoredSession(): StoredSession | null {
  if (typeof window === 'undefined') return null

  const accessToken = window.localStorage.getItem(TOKEN_KEY)
  const expiresAt = Number(window.localStorage.getItem(EXPIRY_KEY))

  if (!accessToken || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    clearStoredSession()
    return null
  }

  return { accessToken, expiresAt }
}

export function saveStoredSession(accessToken: string, expiresInSeconds: number): StoredSession {
  const session = {
    accessToken,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  }

  window.localStorage.setItem(TOKEN_KEY, session.accessToken)
  window.localStorage.setItem(EXPIRY_KEY, String(session.expiresAt))
  return session
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler
}

/** Su /api/auth/login un 401 significa credenziali sbagliate, non una sessione scaduta. */
const AUTH_ENDPOINTS = ['/api/auth/login', '/api/auth/register']

function isAuthRequest(url: string | undefined): boolean {
  return url !== undefined && AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint))
}

export function getApiErrorMessage(error: unknown, fallback = 'Si è verificato un errore. Riprova.'): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return fallback

  const status = error.response?.status
  const message = error.response?.data?.message

  if (status === 404) return 'Non trovato o non tuo.'
  if (status === 409) return message || 'Già esistente.'
  if (status === 401) {
    return isAuthRequest(error.config?.url)
      ? 'Username o password non corretti.'
      : 'Sessione scaduta. Accedi di nuovo.'
  }
  if (status === 403) return 'Non hai i permessi per questa operazione.'
  if (!error.response) return 'Impossibile contattare il server. Riprova.'
  return message || fallback
}

const baseURL = import.meta.env.VITE_API_URL?.trim()

export const api = axios.create({
  baseURL: baseURL || 'http://localhost:8080',
  headers: { Accept: 'application/json' },
  timeout: 15_000,
})

api.interceptors.request.use((config) => {
  const hadToken = typeof window !== 'undefined' && window.localStorage.getItem(TOKEN_KEY) !== null
  const session = readStoredSession()
  if (session) {
    config.headers.set('Authorization', `Bearer ${session.accessToken}`)
  } else if (hadToken) {
    onUnauthorized?.()
    if (window.location.pathname !== '/login') window.location.assign('/login')
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && !isAuthRequest(error.config?.url)) {
      clearStoredSession()
      onUnauthorized?.()

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  },
)
