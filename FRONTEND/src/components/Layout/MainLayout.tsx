import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, LogOut, Menu, Search, UserRound, X } from 'lucide-react'
import { useAuthStore } from '../../stores/useAuthStore'

interface MainLayoutProps {
  children: ReactNode
}

interface NavigationLink {
  href: string
  label: string
}

const navigation: NavigationLink[] = [
  { href: '/', label: 'Home' },
  { href: '/catalogo', label: 'Catalogo' },
]

function isCurrentPage(href: string): boolean {
  return typeof window !== 'undefined' && window.location.pathname === href
}

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  const logout = useAuthStore((state) => state.logout)
  const restoreSession = useAuthStore((state) => state.restoreSession)

  useEffect(() => {
    void restoreSession().catch(() => undefined)
  }, [restoreSession])

  const links = user?.role === 'ADMIN'
    ? [...navigation, { href: '/admin', label: 'Gestione' }]
    : navigation

  function handleLogout() {
    logout()
    setMenuOpen(false)
    window.location.assign('/')
  }

  return (
    <header className="site-header">
      <div className="site-header__left">
        <a className="site-header__mobile-brand" href="/" aria-label="Autodealer, home">
          AUTODEALER
        </a>
        <nav className="site-header__nav" aria-label="Navigazione principale">
          {links.map(({ href, label }) => (
            <a
              key={href}
              className="site-header__link"
              href={href}
              aria-current={isCurrentPage(href) ? 'page' : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      <div className="site-header__right">
        <a className="site-header__icon-button" href="/catalogo" aria-label="Esplora il catalogo">
          <Search size={20} strokeWidth={1.8} aria-hidden="true" />
        </a>
        {user ? (
          <>
            <a className="site-header__action site-header__action--desktop" href="/profile">
              <UserRound size={18} strokeWidth={1.8} aria-hidden="true" />
              {user.username}
            </a>
            <button
              className="site-header__icon-button site-header__action--desktop"
              type="button"
              onClick={handleLogout}
              aria-label="Esci dall'account"
            >
              <LogOut size={18} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </>
        ) : status === 'anonymous' ? (
          <a className="site-header__action site-header__action--desktop" href="/login">
            Accedi <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
          </a>
        ) : null}
        <button
          className="site-header__icon-button site-header__menu-button"
          type="button"
          aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            className="site-header__mobile-nav"
            aria-label="Navigazione mobile"
            initial={reduceMotion ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
          >
            {links.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                aria-current={isCurrentPage(href) ? 'page' : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}
            {user ? (
              <>
                <a href="/profile" onClick={() => setMenuOpen(false)}>Profilo</a>
                <button type="button" onClick={handleLogout}>Esci</button>
              </>
            ) : status === 'anonymous' ? (
              <a href="/login" onClick={() => setMenuOpen(false)}>Accedi</a>
            ) : null}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__links">
        <a className="site-footer__link" href="/privacy-policy">Privacy Policy</a>
        <a className="site-footer__link" href="/cookie-policy">Cookie Policy</a>
      </div>
      <span className="site-footer__meta">© {new Date().getFullYear()} Autodealer · La strada ti aspetta</span>
    </footer>
  )
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="site-backdrop">
      <a className="skip-link" href="#main-content">Vai al contenuto</a>
      <div className="site-shell">
        <aside className="brand-panel" aria-label="Autodealer">
          <a className="brand-lockup" href="/" aria-label="Autodealer, home">
            <span className="brand-lockup__name">AUTODEALER</span>
            <span className="brand-lockup__tagline">Drive your story</span>
          </a>
          <div className="brand-panel__story">
            <span className="eyebrow">Una nuova prospettiva</span>
            <span className="brand-panel__rule" aria-hidden="true" />
            <p className="brand-panel__heading">La strada è tua.</p>
            <p className="brand-panel__copy">
              Auto da scoprire, dettagli da vivere. Il prossimo viaggio comincia qui.
            </p>
            <p className="brand-panel__signature">Find your drive.</p>
            <a className="button button--dark mt-8" href="/catalogo">
              Esplora le auto <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
          <div className="brand-panel__bottom">
            <span>Selezione auto</span>
            <span>01 / 26</span>
          </div>
        </aside>
        <div className="site-main">
          <Header />
          <main id="main-content" className="site-content" tabIndex={-1}>{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default MainLayout
