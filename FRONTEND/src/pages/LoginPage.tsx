import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { useAuthStore } from '../stores/useAuthStore'
import './AccountPages.css'

interface LoginPageProps {
  mode?: 'login' | 'register'
}

function safeDestination(): string {
  const requested = new URLSearchParams(window.location.search).get('next')
  return requested?.startsWith('/') && !requested.startsWith('//') && !requested.includes('\\')
    ? requested
    : '/profile'
}

export function LoginPage({ mode = 'login' }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const user = useAuthStore((state) => state.user)
  const busy = useAuthStore((state) => state.busy)
  const error = useAuthStore((state) => state.error)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const clearError = useAuthStore((state) => state.clearError)
  const reduceMotion = useReducedMotion()
  const isRegister = mode === 'register'
  const next = new URLSearchParams(window.location.search).get('next')
  const nextQuery = next ? `?next=${encodeURIComponent(safeDestination())}` : ''

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanUsername = username.trim()
    const cleanEmail = email.trim().toLowerCase()

    if (new TextEncoder().encode(password).length > 72) {
      setValidationError('La password non può superare 72 byte.')
      return
    }
    if (isRegister && !/^[a-zA-Z0-9._-]{3,50}$/.test(cleanUsername)) {
      setValidationError('Lo username deve contenere 3–50 caratteri: lettere, numeri, punto, trattino o underscore.')
      return
    }

    setValidationError(null)
    try {
      if (isRegister) {
        await register({ username: cleanUsername, email: cleanEmail, password })
      } else {
        await login({ username: cleanUsername, password })
      }
      window.location.assign(safeDestination())
    } catch {
      return
    }
  }

  return (
    <section className="account-page auth-page">
      <motion.div
        className="auth-card"
        initial={reduceMotion ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
      >
        <div className="auth-card__intro">
          <span className="auth-card__icon"><LockKeyhole size={25} strokeWidth={1.7} aria-hidden="true" /></span>
          <p className="eyebrow">Il tuo spazio Autodealer</p>
          <h1 className="display-title">{isRegister ? 'La strada comincia qui.' : 'Bentornato.'}</h1>
          <p>
            {isRegister
              ? 'Crea il tuo account per salvare le auto che ami e seguire i loro prezzi.'
              : 'Accedi per ritrovare le tue auto preferite e i tuoi avvisi prezzo.'}
          </p>
        </div>

        {user ? (
          <div className="auth-card__form-panel">
            <p className="eyebrow">Sessione attiva</p>
            <h2>Ciao, {user.username}</h2>
            <p>Hai già effettuato l’accesso.</p>
            <a className="button button--dark" href="/profile">Vai al profilo <ArrowRight size={17} aria-hidden="true" /></a>
          </div>
        ) : (
          <div className="auth-card__form-panel">
            <div className="auth-card__tabs" aria-label="Accesso e registrazione">
              <a href={`/login${nextQuery}`} aria-current={!isRegister ? 'page' : undefined}>Accedi</a>
              <a href={`/register${nextQuery}`} aria-current={isRegister ? 'page' : undefined}>Registrati</a>
            </div>
            <form className="auth-form" onSubmit={(event) => void submit(event)}>
              <label htmlFor="auth-username">Username</label>
              <input
                id="auth-username"
                name="username"
                autoComplete="username"
                required
                minLength={isRegister ? 3 : 1}
                maxLength={50}
                value={username}
                onChange={(event) => { setUsername(event.target.value); clearError() }}
                placeholder="Il tuo username"
              />

              {isRegister && (
                <>
                  <label htmlFor="auth-email">Email</label>
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); clearError() }}
                    placeholder="nome@esempio.it"
                  />
                </>
              )}

              <label htmlFor="auth-password">Password</label>
              <div className="auth-form__password">
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  required
                  minLength={isRegister ? 8 : 1}
                  maxLength={72}
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); clearError() }}
                  placeholder={isRegister ? 'Almeno 8 caratteri' : 'La tua password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
              {validationError && <p className="auth-form__error" role="alert">{validationError}</p>}
              {error && <p className="auth-form__error" role="alert">{error}</p>}
              <button className="button button--terracotta auth-form__submit" type="submit" disabled={busy}>
                {busy ? 'Attendi...' : isRegister ? 'Crea account' : 'Accedi'}
                {!busy && <ArrowRight size={17} aria-hidden="true" />}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </section>
  )
}

export default LoginPage
