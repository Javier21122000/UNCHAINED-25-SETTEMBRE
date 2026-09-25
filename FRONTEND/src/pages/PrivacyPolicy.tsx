import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import './LegalPages.css'

export function PrivacyPolicy() {
  const reduceMotion = useReducedMotion()

  return (
    <article className="legal-page" aria-labelledby="privacy-title">
      <motion.header
        className="legal-hero"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.7 }}
      >
        <span className="eyebrow">Unchained / Informativa privacy</span>
        <h1 id="privacy-title" className="display-title">I tuoi dati.<br /><em>Con chiarezza.</em></h1>
        <p>Questa informativa descrive i dati usati per gestire il tuo account, i preferiti e gli avvisi prezzo.</p>
      </motion.header>

      <div className="legal-content">
        <aside className="legal-aside" aria-label="Riepilogo privacy">
          <span className="legal-aside__icon"><ShieldCheck size={25} aria-hidden="true" /></span>
          <p className="eyebrow">Il titolare</p>
          <strong>Javier Torres</strong>
          <a href="mailto:torresprivato@gmail.com">torresprivato@gmail.com <ArrowUpRight size={15} aria-hidden="true" /></a>
          <span className="legal-aside__rule" />
          <p>Puoi scrivere a questo indirizzo per richieste relative ai tuoi dati personali.</p>
        </aside>

        <div className="legal-sections">
          <section className="legal-section" aria-labelledby="privacy-data">
            <span className="legal-section__number">01 / Dati</span>
            <h2 id="privacy-data">Quali dati trattiamo</h2>
            <p>Per l’account il backend conserva <strong>username, email e password hash</strong> (BCrypt), oltre al ruolo e alla data di creazione. La password non viene conservata in chiaro.</p>
            <p>Se utilizzi il salone, conserva le <strong>auto aggiunte ai preferiti</strong> e le <strong>soglie prezzo</strong> che imposti per gli avvisi. Per ogni avviso registra anche l’auto, la data di creazione e lo stato di invio della notifica.</p>
          </section>

          <section className="legal-section" aria-labelledby="privacy-purpose">
            <span className="legal-section__number">02 / Utilizzo</span>
            <h2 id="privacy-purpose">Perché li usiamo</h2>
            <p>Username e password servono per autenticarti; l’email identifica l’account e permette di ricevere gli avvisi sui ribassi quando il servizio di posta è attivo. Preferiti e soglie prezzo servono a offrirti le funzioni che scegli di utilizzare.</p>
            <p>La base giuridica di questi trattamenti è l’esecuzione del servizio richiesto con la creazione e l’uso dell’account. L’invio delle email di avviso può coinvolgere il fornitore tecnico del servizio di posta configurato per il backend.</p>
          </section>

          <section className="legal-section" aria-labelledby="privacy-retention">
            <span className="legal-section__number">03 / Controllo</span>
            <h2 id="privacy-retention">Conservazione e cancellazione</h2>
            <p>I dati dell’account, i preferiti e gli avvisi restano nel database applicativo mentre utilizzi il servizio, salvo la rimozione dei singoli preferiti o avvisi da parte tua. Puoi eliminare l’account dal <a href="/profile">tuo profilo</a>: questa operazione rimuove anche preferiti e avvisi dal database applicativo.</p>
            <p>Per conoscere i tempi applicati a eventuali copie di backup o log tecnici dell’ambiente in cui il servizio viene ospitato, contatta il titolare.</p>
          </section>

          <section className="legal-section" aria-labelledby="privacy-rights">
            <span className="legal-section__number">04 / Diritti</span>
            <h2 id="privacy-rights">Le tue richieste</h2>
            <p>Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità o opporti al trattamento nei casi previsti dalla legge scrivendo a <a href="mailto:torresprivato@gmail.com">torresprivato@gmail.com</a>. Puoi inoltre proporre reclamo al <a href="https://www.garanteprivacy.it/" target="_blank" rel="noopener noreferrer">Garante per la protezione dei dati personali <ArrowUpRight size={14} aria-hidden="true" /></a>.</p>
          </section>

          <div className="legal-next">
            <span className="legal-next__icon"><LockKeyhole size={20} aria-hidden="true" /></span>
            <div><p className="eyebrow">Continua a leggere</p><strong>Cookie e accesso</strong></div>
            <a href="/cookie-policy" aria-label="Vai alla Cookie Policy"><ArrowUpRight size={22} aria-hidden="true" /></a>
          </div>
        </div>
      </div>
      <div className="legal-contact"><Mail size={17} aria-hidden="true" /> Contatto privacy: <a href="mailto:torresprivato@gmail.com">torresprivato@gmail.com</a></div>
    </article>
  )
}

export default PrivacyPolicy
