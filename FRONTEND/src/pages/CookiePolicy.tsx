import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Database, ShieldCheck } from 'lucide-react'
import './LegalPages.css'

export function CookiePolicy() {
  const reduceMotion = useReducedMotion()

  return (
    <article className="legal-page" aria-labelledby="cookie-title">
      <motion.header
        className="legal-hero"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
      >
        <span className="eyebrow">Autodealer / Cookie Policy</span>
        <h1 id="cookie-title" className="display-title">Un accesso.<br /><em>Trasparente.</em></h1>
        <p>Ti spieghiamo quali informazioni vengono salvate nel browser per mantenere attiva la sessione.</p>
      </motion.header>

      <div className="legal-content">
        <aside className="legal-aside" aria-label="Riepilogo archiviazione">
          <span className="legal-aside__icon"><Database size={25} aria-hidden="true" /></span>
          <p className="eyebrow">Nel browser</p>
          <strong>JWT nel localStorage</strong>
          <span className="legal-aside__rule" />
          <p>Il token di accesso è usato per le richieste autenticate. La sua validità è di un’ora.</p>
        </aside>

        <div className="legal-sections">
          <section className="legal-section" aria-labelledby="cookie-auth">
            <span className="legal-section__number">01 / Sessione</span>
            <h2 id="cookie-auth">Come funziona l’accesso</h2>
            <p>L’applicazione non usa un cookie di sessione per autenticarti. Dopo il login, conserva il <strong>JWT nel localStorage</strong> del browser e lo invia al backend nell’header <code>Authorization: Bearer</code> delle richieste protette.</p>
            <p>Il localStorage è uno spazio di archiviazione del browser distinto dai cookie. Queste informazioni sono necessarie per mantenere l’accesso alle funzioni riservate.</p>
          </section>

          <section className="legal-section" aria-labelledby="cookie-items">
            <span className="legal-section__number">02 / Elementi salvati</span>
            <h2 id="cookie-items">Cosa viene memorizzato</h2>
            <div className="legal-storage" role="table" aria-label="Dati di sessione nel localStorage">
              <div role="row"><strong role="cell">saloneAuto.accessToken</strong><span role="cell">JWT usato per autenticare le richieste al backend.</span></div>
              <div role="row"><strong role="cell">saloneAuto.expiresAt</strong><span role="cell">Scadenza del token, calcolata dal frontend.</span></div>
            </div>
            <p>Il token è valido per un’ora. Le voci vengono rimosse quando esci, elimini l’account, ricevi una risposta 401 o il frontend rileva che la sessione è scaduta.</p>
          </section>

          <section className="legal-section" aria-labelledby="cookie-control">
            <span className="legal-section__number">03 / Controllo</span>
            <h2 id="cookie-control">Come cancellare i dati locali</h2>
            <p>Puoi usare il comando “Esci” dell’applicazione oppure cancellare i dati del sito dalle impostazioni del browser. In entrambi i casi dovrai effettuare nuovamente l’accesso per utilizzare preferiti e avvisi.</p>
            <p>Nel frontend attuale non sono presenti strumenti di analisi o profilazione che impostano cookie. Eventuali servizi aggiunti in futuro richiederanno un aggiornamento di questa pagina.</p>
          </section>

          <div className="legal-next">
            <span className="legal-next__icon"><ShieldCheck size={20} aria-hidden="true" /></span>
            <div><p className="eyebrow">Continua a leggere</p><strong>Privacy Policy</strong></div>
            <a href="/privacy-policy" aria-label="Vai alla Privacy Policy"><ArrowUpRight size={22} aria-hidden="true" /></a>
          </div>
        </div>
      </div>
    </article>
  )
}

export default CookiePolicy
