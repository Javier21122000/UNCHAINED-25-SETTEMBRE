import { useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { useDialogFocus } from '../../hooks/useDialogFocus'
import { useGarageStore } from '../../stores/useGarageStore'
import type { CarView } from '../../types'

interface PriceAlertModalProps {
  car: CarView | null
  onClose: () => void
}

const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
const dialogSpring = { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.7 }

function PriceAlertDialog({ car, onClose }: { car: CarView; onClose: () => void }) {
  const [threshold, setThreshold] = useState(() => Math.max(0.01, Math.round(car.prezzoVendita * 0.9)).toFixed(2))
  const [validationError, setValidationError] = useState<string | null>(null)
  const { dialogRef, initialFocusRef } = useDialogFocus(true, onClose)
  const reduceMotion = useReducedMotion()
  const alerts = useGarageStore((state) => state.alerts)
  const busy = useGarageStore((state) => state.busy)
  const error = useGarageStore((state) => state.error)
  const createAlert = useGarageStore((state) => state.createAlert)
  const existing = alerts.find((alert) => alert.carId === car.id)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = threshold.trim().replace(',', '.')
    const amount = Number(normalized)

    if (!/^\d{1,10}(\.\d{1,2})?$/.test(normalized) || !Number.isFinite(amount) || amount < 0.01) {
      setValidationError('Inserisci una soglia valida, con al massimo due decimali.')
      return
    }

    setValidationError(null)
    try {
      await createAlert({ carId: car.id, sogliaPrezzo: amount })
      onClose()
    } catch {
      return
    }
  }

  return (
    <motion.div
      className="modal-backdrop price-alert-backdrop"
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
        className="price-alert-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="price-alert-title"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.97 }}
        transition={dialogSpring}
      >
        <button
          ref={initialFocusRef}
          className="price-alert-dialog__close"
          type="button"
          onClick={onClose}
          aria-label="Chiudi avviso prezzo"
        >
          <X size={21} aria-hidden="true" />
        </button>
        <span className="price-alert-dialog__icon"><Bell size={25} aria-hidden="true" /></span>
        <p className="eyebrow price-alert-dialog__eyebrow">Avviso prezzo</p>
        <h2 id="price-alert-title">Segui {car.marca} {car.modello}</h2>
        <p className="price-alert-dialog__copy">
          Riceverai un avviso quando il prezzo dell’auto scenderà alla soglia impostata.
        </p>
        <p className="price-alert-dialog__current">Prezzo attuale <strong>{euro.format(car.prezzoVendita)}</strong></p>

        {existing ? (
          <div className="price-alert-dialog__existing" role="status">
            <strong>{existing.inviato ? 'Avviso già inviato' : 'Avviso attivo'}</strong>
            <span>Soglia: {euro.format(existing.sogliaPrezzo)}</span>
            <span>Puoi rimuoverlo dal tuo profilo per impostarne uno nuovo.</span>
            <a href="/profile">Vai al profilo</a>
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)}>
            <label className="price-alert-dialog__label" htmlFor="alert-threshold">Soglia desiderata (€)</label>
            <input
              id="alert-threshold"
              type="number"
              inputMode="decimal"
              min="0.01"
              max="9999999999.99"
              step="0.01"
              required
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
            />
            {validationError && <p className="price-alert-dialog__error" role="alert">{validationError}</p>}
            {error && <p className="price-alert-dialog__error" role="alert">{error}</p>}
            <button className="button button--dark" type="submit" disabled={busy}>
              <Bell size={16} aria-hidden="true" /> {busy ? 'Salvataggio...' : 'Crea avviso'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

export function PriceAlertModal({ car, onClose }: PriceAlertModalProps) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {car && <PriceAlertDialog key={car.id} car={car} onClose={onClose} />}
    </AnimatePresence>,
    document.body,
  )
}
