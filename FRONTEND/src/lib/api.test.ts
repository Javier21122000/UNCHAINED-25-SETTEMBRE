import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearStoredSession, readStoredSession, saveStoredSession } from './api'

describe('persistenza della sessione', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('salva e rilegge un token non scaduto', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_000)

    const saved = saveStoredSession('token-di-test', 60)

    expect(saved).toEqual({ accessToken: 'token-di-test', expiresAt: 61_000 })
    expect(readStoredSession()).toEqual(saved)
  })

  it('elimina automaticamente una sessione scaduta', () => {
    window.localStorage.setItem('saloneAuto.accessToken', 'token-scaduto')
    window.localStorage.setItem('saloneAuto.expiresAt', '999')
    vi.spyOn(Date, 'now').mockReturnValue(1_000)

    expect(readStoredSession()).toBeNull()
    expect(window.localStorage.getItem('saloneAuto.accessToken')).toBeNull()
    expect(window.localStorage.getItem('saloneAuto.expiresAt')).toBeNull()
  })

  it('rimuove esplicitamente tutti i dati di autenticazione', () => {
    saveStoredSession('token-di-test', 60)

    clearStoredSession()

    expect(window.localStorage.length).toBe(0)
  })
})
