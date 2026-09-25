import { MainLayout } from './components/Layout/MainLayout'
import { AdminDashboard } from './pages/AdminDashboard'
import { CatalogPage } from './pages/CatalogPage'
import { CookiePolicy } from './pages/CookiePolicy'
import { LoginPage } from './pages/LoginPage'
import { PrivacyPolicy } from './pages/PrivacyPolicy'
import { ProfilePage } from './pages/ProfilePage'

function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  return (
    <MainLayout>
      {path === '/' || path === '/catalogo' ? (
        <CatalogPage />
      ) : path === '/login' ? (
        <LoginPage />
      ) : path === '/register' ? (
        <LoginPage mode="register" />
      ) : path === '/profile' ? (
        <ProfilePage />
      ) : path === '/admin' ? (
        <AdminDashboard />
      ) : path === '/privacy-policy' ? (
        <PrivacyPolicy />
      ) : path === '/cookie-policy' ? (
        <CookiePolicy />
      ) : (
        <section className="catalog-empty" aria-labelledby="not-found-title">
          <span className="eyebrow">404 / Pagina non trovata</span>
          <h1 id="not-found-title" className="display-title">Strada sconosciuta.</h1>
          <p>La pagina richiesta non è disponibile.</p>
          <a className="button button--light" href="/catalogo">Torna al catalogo</a>
        </section>
      )}
    </MainLayout>
  )
}

export default App
