import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Bell, Heart, ShieldCheck, Trash2, X } from 'lucide-react'
import { useDialogFocus } from '../hooks/useDialogFocus'
import { getCarProfile } from '../lib/carCatalog'
import { useAuthStore } from '../stores/useAuthStore'
import { useGarageStore } from '../stores/useGarageStore'
import './AccountPages.css'

const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
const date = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
const dialogSpring = { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.7 }

interface DeleteAccountDialogProps {
  open: boolean
  busy: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}

function DeleteAccountDialog({ open, busy, error, onClose, onConfirm }: DeleteAccountDialogProps) {
  const reduceMotion = useReducedMotion()
  const closeIfIdle = useCallback(() => { if (!busy) onClose() }, [busy, onClose])
  const { dialogRef, initialFocusRef } = useDialogFocus(open, closeIfIdle)

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeIfIdle()
          }}
        >
          <motion.div
            ref={dialogRef}
            className="delete-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            aria-describedby="delete-account-description"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
            transition={dialogSpring}
          >
            <button className="delete-dialog__close" type="button" onClick={closeIfIdle} disabled={busy} aria-label="Chiudi">
              <X size={20} aria-hidden="true" />
            </button>
            <span className="delete-dialog__icon"><Trash2 size={25} aria-hidden="true" /></span>
            <p className="eyebrow">Conferma richiesta</p>
            <h2 id="delete-account-title">Eliminare il tuo account?</h2>
            <p id="delete-account-description">
              Questa azione è permanente. Il tuo account, i preferiti e gli avvisi prezzo verranno eliminati.
            </p>
            {error && <p className="delete-dialog__error" role="alert">{error}</p>}
            <div className="delete-dialog__actions">
              <button ref={initialFocusRef} className="button button--outline" type="button" onClick={closeIfIdle} disabled={busy}>
                Annulla
              </button>
              <button className="button button--terracotta" type="button" onClick={onConfirm} disabled={busy}>
                {busy ? 'Eliminazione...' : 'Elimina account'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function ProfilePage() {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const skipRedirect = useRef(false)
  const closeDelete = useCallback(() => setDeleteOpen(false), [])
  const reduceMotion = useReducedMotion()
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  const authError = useAuthStore((state) => state.error)
  const authBusy = useAuthStore((state) => state.busy)
  const restoreSession = useAuthStore((state) => state.restoreSession)
  const deleteAccount = useAuthStore((state) => state.deleteAccount)
  const favorites = useGarageStore((state) => state.favorites)
  const alerts = useGarageStore((state) => state.alerts)
  const favoritesLoaded = useGarageStore((state) => state.favoritesLoaded)
  const alertsLoaded = useGarageStore((state) => state.alertsLoaded)
  const loading = useGarageStore((state) => state.loading)
  const busy = useGarageStore((state) => state.busy)
  const garageError = useGarageStore((state) => state.error)
  const notice = useGarageStore((state) => state.notice)
  const loadGarage = useGarageStore((state) => state.loadGarage)
  const removeFavorite = useGarageStore((state) => state.removeFavorite)
  const removeAlert = useGarageStore((state) => state.removeAlert)

  useEffect(() => {
    if (status === 'anonymous' && !skipRedirect.current) {
      window.location.replace('/login?next=/profile')
    }
  }, [status])

  useEffect(() => {
    if (user?.id) void loadGarage()
  }, [user?.id, loadGarage])

  async function confirmDelete() {
    skipRedirect.current = true
    try {
      await deleteAccount()
      window.location.assign('/')
    } catch {
      skipRedirect.current = false
      return
    }
  }

  if (!user) {
    return (
      <section className="account-page profile-loading" role="status">
        <p className="eyebrow">Area personale</p>
        <h1 className="display-title">Prepariamo il tuo garage.</h1>
        {authError && (
          <>
            <p>{authError}</p>
            <button className="button button--light" type="button" onClick={() => void restoreSession().catch(() => undefined)}>
              Riprova <ArrowRight size={16} aria-hidden="true" />
            </button>
          </>
        )}
      </section>
    )
  }

  return (
    <section className="account-page profile-page">
      <motion.div
        className="profile-heading"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={dialogSpring}
      >
        <span className="eyebrow">Area personale / {user.role === 'ADMIN' ? 'Amministratore' : 'Utente'}</span>
        <h1 className="display-title">Il tuo garage.</h1>
        <p>Ciao, {user.username}. Qui ritrovi le auto che segui e i tuoi avvisi prezzo.</p>
      </motion.div>

      <div className="profile-overview">
        <div className="profile-overview__identity">
          <span className="profile-overview__avatar" aria-hidden="true">{user.username.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{user.username}</strong>
            <span>{user.email}</span>
          </div>
        </div>
        <div className="profile-overview__since">
          <ShieldCheck size={20} aria-hidden="true" />
          <span>Con noi dal {date.format(new Date(user.createdAt))}</span>
        </div>
      </div>

      {(garageError || notice) && (
        <p className="profile-feedback" role={garageError ? 'alert' : 'status'}>{garageError || notice}</p>
      )}

      <div className="profile-sections">
        <section className="profile-section" aria-labelledby="favorites-title">
          <div className="profile-section__heading">
            <div>
              <span className="eyebrow">La tua selezione</span>
              <h2 id="favorites-title"><Heart size={23} aria-hidden="true" /> Preferiti</h2>
            </div>
            <span className="profile-section__count">{favorites.length}</span>
          </div>
          {!favoritesLoaded && favorites.length === 0 && (
            <p className="profile-section__empty">
              {loading || !garageError ? 'Caricamento preferiti...' : 'Preferiti non disponibili al momento.'}
            </p>
          )}
          {favoritesLoaded && favorites.length === 0 && (
            <div className="profile-section__empty">
              <p>Non hai ancora salvato nessuna auto.</p>
              <a href="/catalogo">Esplora il catalogo <ArrowRight size={16} aria-hidden="true" /></a>
            </div>
          )}
          <div className="profile-list">
            {favorites.map((favorite) => (
              <article className="profile-item" key={favorite.id}>
                <img
                  className="profile-item__image"
                  src={getCarProfile(favorite.car).images[0].src}
                  alt=""
                  loading="lazy"
                />
                <div>
                  <span className="eyebrow">{favorite.car.marca}</span>
                  <h3>{favorite.car.modello}</h3>
                  <p>{euro.format(favorite.car.prezzoVendita)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void removeFavorite(favorite.id).catch(() => undefined)}
                  disabled={busy}
                  aria-label={`Rimuovi ${favorite.car.marca} ${favorite.car.modello} dai preferiti`}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="profile-section" aria-labelledby="alerts-title">
          <div className="profile-section__heading">
            <div>
              <span className="eyebrow">Tieni d’occhio il prezzo</span>
              <h2 id="alerts-title"><Bell size={23} aria-hidden="true" /> Avvisi</h2>
            </div>
            <span className="profile-section__count">{alerts.length}</span>
          </div>
          {!alertsLoaded && alerts.length === 0 && (
            <p className="profile-section__empty">
              {loading || !garageError ? 'Caricamento avvisi...' : 'Avvisi non disponibili al momento.'}
            </p>
          )}
          {alertsLoaded && alerts.length === 0 && (
            <div className="profile-section__empty">
              <p>Non hai ancora impostato avvisi prezzo.</p>
              <a href="/catalogo">Scopri le auto <ArrowRight size={16} aria-hidden="true" /></a>
            </div>
          )}
          <div className="profile-list">
            {alerts.map((alert) => (
              <article className="profile-item profile-item--alert" key={alert.id}>
                <div>
                  <span className="eyebrow">{alert.marca}</span>
                  <h3>{alert.modello}</h3>
                  <p>Soglia {euro.format(alert.sogliaPrezzo)} · Attuale {euro.format(alert.prezzoVenditaAttuale)}</p>
                  <span className={alert.inviato ? 'profile-item__status profile-item__status--sent' : 'profile-item__status'}>
                    {alert.inviato ? 'Già inviato' : 'In attesa'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void removeAlert(alert.id).catch(() => undefined)}
                  disabled={busy}
                  aria-label={`Rimuovi avviso per ${alert.marca} ${alert.modello}`}
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="profile-danger" aria-labelledby="delete-heading">
        <div>
          <p className="eyebrow">Gestione account</p>
          <h2 id="delete-heading">Eliminazione account</h2>
          <p>Eliminando l’account perderai anche i preferiti e gli avvisi prezzo.</p>
        </div>
        <button className="button button--outline" type="button" onClick={() => setDeleteOpen(true)}>
          <Trash2 size={16} aria-hidden="true" /> Elimina account
        </button>
      </section>

      <DeleteAccountDialog
        open={deleteOpen}
        busy={authBusy}
        error={authError}
        onClose={closeDelete}
        onConfirm={() => void confirmDelete()}
      />
    </section>
  )
}

export default ProfilePage
