import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Bell, Heart, X } from 'lucide-react'
import { useDialogFocus } from '../../hooks/useDialogFocus'
import { SPEC_LABELS, getCarProfile } from '../../lib/carCatalog'
import { useAuthStore } from '../../stores/useAuthStore'
import { useGarageStore } from '../../stores/useGarageStore'
import { isCarAdminResponse } from '../../types'
import type { CarView } from '../../types'

interface CarDetailModalProps {
  car: CarView | null
  selectedVariantIndex: number
  onVariantSelect: (index: number) => void
  onClose: () => void
  onOpenAlert: (car: CarView) => void
}

const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
const dialogSpring = { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.7 }

export function CarDetailModal({ car, selectedVariantIndex, onVariantSelect, onClose, onOpenAlert }: CarDetailModalProps) {
  const { dialogRef, initialFocusRef } = useDialogFocus(car !== null, onClose)
  const reduceMotion = useReducedMotion()
  const user = useAuthStore((state) => state.user)
  const addFavorite = useGarageStore((state) => state.addFavorite)
  const favorites = useGarageStore((state) => state.favorites)
  const busy = useGarageStore((state) => state.busy)
  const garageError = useGarageStore((state) => state.error)
  const garageNotice = useGarageStore((state) => state.notice)
  const isAdmin = user?.role === 'ADMIN'
  const isFavorite = car ? favorites.some((favorite) => favorite.car.id === car.id) : false
  const profile = car ? getCarProfile(car) : null
  const variant = profile?.images[selectedVariantIndex] ?? profile?.images[0]

  function handleFavorite() {
    if (!car) return
    if (!user) {
      window.location.assign('/login?next=/catalogo')
      return
    }
    void addFavorite(car.id).catch(() => undefined)
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {car && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <motion.div
            ref={dialogRef}
            className="car-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="car-dialog-title"
            aria-describedby={car.descrizione ? 'car-dialog-description' : undefined}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
            transition={dialogSpring}
          >
            <button
              ref={initialFocusRef}
              className="car-dialog__close"
              type="button"
              onClick={onClose}
              aria-label="Chiudi dettagli auto"
            >
              <X size={21} aria-hidden="true" />
            </button>

            <div className="car-dialog__visual" data-mood={profile?.category}>
              <span className="eyebrow">Autodealer / Dettaglio</span>
              <span className="display-title car-dialog__watermark" aria-hidden="true">
                {car.modello}
              </span>
              <img
                className="car-dialog__image"
                src={variant?.src}
                alt={profile?.illustrative ? 'Auto raffigurata a scopo illustrativo' : `${car.marca} ${car.modello}, colore ${variant?.label}`}
              />
              <span className="car-dialog__image-note">{profile?.illustrative ? 'Immagine illustrativa' : 'Immagine di riferimento'}</span>
            </div>

            <div className="car-dialog__body">
              <p className="eyebrow car-dialog__brand">{car.marca}{profile ? ` · ${profile.anno}` : ''}</p>
              {profile?.specialEdition && <span className="car-dialog__edition">Special Edition · 1/1</span>}
              <h2 id="car-dialog-title" className="car-dialog__title">{car.modello}</h2>
              {profile && <p className="car-dialog__claim">{profile.claim}</p>}
              <p className="car-dialog__price">{euro.format(car.prezzoVendita)}</p>
              {profile && profile.images.length > 1 && (
                <div className="car-dialog__colors" role="group" aria-label="Colori nelle immagini">
                  <span>Colori in foto</span>
                  {profile.images.map((image, index) => (
                    <button
                      key={image.src}
                      className="car-color car-color--dark"
                      style={{ backgroundColor: image.color }}
                      type="button"
                      aria-label={`Mostra ${image.label}`}
                      aria-pressed={selectedVariantIndex === index}
                      title={image.label}
                      onClick={() => onVariantSelect(index)}
                    />
                  ))}
                </div>
              )}
              {car.descrizione ? (
                <p id="car-dialog-description" className="car-dialog__description">{car.descrizione}</p>
              ) : (
                <p className="car-dialog__description">Contattaci per scoprire tutti i dettagli di questa auto.</p>
              )}
              {profile && (
                <>
                  <p className="car-dialog__section-title">Scheda tecnica</p>
                  <dl className="car-dialog__specs">
                    {SPEC_LABELS.map(({ key, label }) => (
                      <div key={key}>
                        <dt>{label}</dt>
                        <dd>{profile.specs[key]}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}
              {profile && profile.strengths.length > 0 && (
                <>
                  <p className="car-dialog__section-title">Punti di forza</p>
                  <ul className="car-dialog__strengths">
                    {profile.strengths.map((strength) => <li key={strength}>{strength}</li>)}
                  </ul>
                </>
              )}
              {isAdmin && isCarAdminResponse(car) && (
                <div className="car-dialog__admin-data">
                  <span>Prezzo d’acquisto: {euro.format(car.prezzoAcquisto)}</span>
                  <span>{car.isBozza ? 'Bozza' : 'Pubblicata'}</span>
                </div>
              )}
              {garageError && <p className="car-dialog__feedback" role="alert">{garageError}</p>}
              {garageNotice && <p className="car-dialog__feedback" role="status">{garageNotice}</p>}
              <div className="car-dialog__actions">
                <button className="button button--dark" type="button" onClick={handleFavorite} disabled={busy || isFavorite}>
                  <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
                  {isFavorite ? 'Nei preferiti' : 'Salva auto'}
                </button>
                <button className="button button--outline" type="button" onClick={() => onOpenAlert(car)}>
                  <Bell size={16} aria-hidden="true" /> Avviso prezzo
                </button>
              </div>
              <button className="car-dialog__back" type="button" onClick={onClose}>
                <ArrowLeft size={16} aria-hidden="true" /> Torna al catalogo
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
