import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, FilePenLine, Plus, RefreshCw, ShieldCheck } from 'lucide-react'
import { getApiErrorMessage } from '../lib/api'
import { getCarProfile } from '../lib/carCatalog'
import { useAuthStore } from '../stores/useAuthStore'
import { useCarStore } from '../stores/useCarStore'
import { isCarAdminResponse } from '../types'
import type { CarAdminResponse, CarCreateRequest } from '../types'
import './AdminDashboard.css'

const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })
const dialogSpring = { type: 'spring' as const, stiffness: 420, damping: 34, mass: 0.7 }
const moneyPattern = /^\d{1,10}(?:[.,]\d{1,2})?$/

interface CarFormValues {
  marca: string
  modello: string
  descrizione: string
  prezzoAcquisto: string
  prezzoVendita: string
  isBozza: boolean
}

function emptyForm(): CarFormValues {
  return { marca: '', modello: '', descrizione: '', prezzoAcquisto: '', prezzoVendita: '', isBozza: true }
}

function formFromCar(car: CarAdminResponse): CarFormValues {
  return {
    marca: car.marca,
    modello: car.modello,
    descrizione: car.descrizione ?? '',
    prezzoAcquisto: car.prezzoAcquisto.toFixed(2),
    prezzoVendita: car.prezzoVendita.toFixed(2),
    isBozza: car.isBozza,
  }
}

function parseMoney(value: string, minimum: number): number | null {
  const normalized = value.trim().replace(',', '.')
  if (!moneyPattern.test(value.trim())) return null
  const amount = Number(normalized)
  return Number.isFinite(amount) && amount >= minimum && amount <= 9_999_999_999.99 ? amount : null
}

export function AdminDashboard() {
  const user = useAuthStore((state) => state.user)
  const authStatus = useAuthStore((state) => state.status)
  const authError = useAuthStore((state) => state.error)
  const restoreSession = useAuthStore((state) => state.restoreSession)
  const cars = useCarStore((state) => state.cars)
  const query = useCarStore((state) => state.query)
  const totalElements = useCarStore((state) => state.totalElements)
  const totalPages = useCarStore((state) => state.totalPages)
  const hasLoaded = useCarStore((state) => state.hasLoaded)
  const loading = useCarStore((state) => state.loading)
  const saving = useCarStore((state) => state.saving)
  const apiError = useCarStore((state) => state.error)
  const fetchCars = useCarStore((state) => state.fetchCars)
  const fetchCarById = useCarStore((state) => state.fetchCarById)
  const setQuery = useCarStore((state) => state.setQuery)
  const createCar = useCarStore((state) => state.createCar)
  const updateCar = useCarStore((state) => state.updateCar)
  const clearError = useCarStore((state) => state.clearError)
  const reduceMotion = useReducedMotion()

  const [editing, setEditing] = useState<CarAdminResponse | null>(null)
  const hadAdminSession = useRef(false)
  const [form, setForm] = useState<CarFormValues>(emptyForm)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [selecting, setSelecting] = useState(false)

  useEffect(() => {
    if (user?.role === 'ADMIN') hadAdminSession.current = true
    if (authStatus === 'anonymous' && !hadAdminSession.current) window.location.replace('/login?next=/admin')
  }, [authStatus, user?.role])

  useEffect(() => {
    if (user?.role === 'ADMIN') void fetchCars().catch(() => undefined)
  }, [user?.role, fetchCars, query.page, query.size, query.sortBy, query.direction, query.marca, query.modello])

  function updateField<Key extends keyof CarFormValues>(key: Key, value: CarFormValues[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
    setValidationError(null)
    setSaveError(null)
    setNotice(null)
    clearError()
  }

  function startCreate() {
    setEditing(null)
    setForm(emptyForm())
    setValidationError(null)
    setSaveError(null)
    setNotice(null)
    clearError()
    document.getElementById('admin-form-title')?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth' })
  }

  function startSpecialEdition() {
    startCreate()
    setForm({ ...emptyForm(), marca: 'Ford', modello: 'Shelby GT500 Extreme', prezzoVendita: '1000000.00' })
  }

  async function startEdit(car: CarAdminResponse) {
    setSelecting(true)
    setValidationError(null)
    setSaveError(null)
    setNotice(null)
    clearError()
    try {
      const current = await fetchCarById(car.id)
      if (!isCarAdminResponse(current)) {
        setValidationError('I dati di amministrazione dell’auto non sono disponibili.')
        return
      }
      setEditing(current)
      setForm(formFromCar(current))
      document.getElementById('admin-form-title')?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth' })
    } catch (error: unknown) {
      setValidationError(getApiErrorMessage(error, 'Auto non disponibile.'))
      return
    } finally {
      setSelecting(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const marca = form.marca.trim()
    const modello = form.modello.trim()
    const descrizione = form.descrizione.trim()
    const prezzoAcquisto = parseMoney(form.prezzoAcquisto, 0)
    const prezzoVendita = parseMoney(form.prezzoVendita, 0.01)

    if (!marca || marca.length > 60 || !modello || modello.length > 80) {
      setValidationError('Inserisci marca e modello entro i limiti indicati.')
      return
    }
    if (descrizione.length > 4000) {
      setValidationError('La descrizione può contenere al massimo 4000 caratteri.')
      return
    }
    if (prezzoAcquisto === null || prezzoVendita === null) {
      setValidationError('Inserisci prezzi validi con al massimo due decimali. Il prezzo di vendita deve essere maggiore di zero.')
      return
    }
    if (getCarProfile({ marca, modello }).specialEdition && prezzoVendita !== 1_000_000) {
      setValidationError('La Shelby GT500 Extreme 1/1 deve avere un prezzo di vendita di 1.000.000,00 €.')
      return
    }

    const request: CarCreateRequest = {
      marca,
      modello,
      descrizione: descrizione || null,
      prezzoAcquisto,
      prezzoVendita,
      isBozza: form.isBozza,
    }

    setValidationError(null)
    setSaveError(null)
    setNotice(null)
    try {
      if (editing) {
        const updated = await updateCar(editing.id, request)
        setEditing(updated)
        setForm(formFromCar(updated))
        setNotice(`${updated.marca} ${updated.modello} aggiornata.`)
      } else {
        const created = await createCar(request)
        setForm(emptyForm())
        setNotice(`${created.marca} ${created.modello} creata.`)
      }
    } catch (error: unknown) {
      setSaveError(getApiErrorMessage(error, 'Salvataggio non riuscito.'))
      return
    }
  }

  if (authStatus === 'checking' || (authStatus === 'authenticated' && !user)) {
    return (
      <section className="admin-page admin-access" role="status">
        <p className="eyebrow">Area amministratore</p>
        <h1 className="display-title">Verifichiamo l’accesso.</h1>
        {authError && (
          <>
            <p>{authError}</p>
            <button className="button button--light" type="button" onClick={() => void restoreSession().catch(() => undefined)}>
              Riprova <RefreshCw size={16} aria-hidden="true" />
            </button>
          </>
        )}
      </section>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <section className="admin-page admin-access">
        <p className="eyebrow">Accesso riservato</p>
        <h1 className="display-title">Area amministratore.</h1>
        <p>Questa sezione è disponibile solo per gli amministratori.</p>
        <a className="button button--light" href="/catalogo">Vai al catalogo <ArrowRight size={16} aria-hidden="true" /></a>
      </section>
    )
  }

  const adminCars = cars.filter(isCarAdminResponse)
  const currentPage = query.page ?? 0

  return (
    <div className="admin-page">
      <motion.header
        className="admin-heading"
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={dialogSpring}
      >
        <span className="eyebrow">Area amministratore / Catalogo</span>
        <div className="admin-heading__main">
          <div>
            <h1 className="display-title">Gestisci le auto.</h1>
            <p>Pubblica nuovi modelli e aggiorna ogni dettaglio del salone.</p>
          </div>
          <button className="button button--light" type="button" onClick={startCreate}>
            <Plus size={17} aria-hidden="true" /> Nuova auto
          </button>
        </div>
      </motion.header>

      <div className="admin-grid">
        <section className="admin-list" aria-labelledby="admin-list-title">
          <div className="admin-panel-heading">
            <div>
              <p className="eyebrow">Inventario</p>
              <h2 id="admin-list-title">Le tue auto <span>{hasLoaded ? totalElements : '—'}</span></h2>
            </div>
            <button type="button" onClick={() => void fetchCars().catch(() => undefined)} disabled={loading} aria-label="Aggiorna elenco">
              <RefreshCw size={18} aria-hidden="true" />
            </button>
          </div>

          {apiError && !saveError && <p className="admin-feedback admin-feedback--error" role="alert">{apiError}</p>}
          {loading && <p className="admin-list__state" role="status">Caricamento auto...</p>}
          {!loading && hasLoaded && adminCars.length === 0 && (
            <p className="admin-list__state">Nessuna auto in questa pagina. Crea il primo modello o torna alla pagina precedente.</p>
          )}

          <div className="admin-list__items">
            {adminCars.map((car) => (
              <article className="admin-car" key={car.id}>
                <div className="admin-car__main">
                  <img src={getCarProfile(car).images[0].src} alt="" loading="lazy" />
                  <div>
                    <div className="admin-car__top">
                      <span className="eyebrow">{car.marca}</span>
                      <span className={car.isBozza ? 'admin-car__status admin-car__status--draft' : 'admin-car__status'}>
                        {car.isBozza ? 'Bozza' : 'Pubblicata'}
                      </span>
                    </div>
                    <h3>{car.modello}</h3>
                    {getCarProfile(car).specialEdition && <span className="admin-car__edition">Special Edition · 1/1</span>}
                    <p>Vendita <strong>{euro.format(car.prezzoVendita)}</strong> <span>·</span> Acquisto {euro.format(car.prezzoAcquisto)}</p>
                  </div>
                </div>
                <button className="admin-car__edit" type="button" onClick={() => void startEdit(car)} disabled={selecting || saving}>
                  <FilePenLine size={16} aria-hidden="true" /> Modifica <ArrowRight size={16} aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button type="button" onClick={() => setQuery({ page: currentPage - 1 })} disabled={currentPage <= 0 || loading}>
                <ArrowLeft size={16} aria-hidden="true" /> Precedente
              </button>
              <span>Pagina {currentPage + 1} di {totalPages}</span>
              <button type="button" onClick={() => setQuery({ page: currentPage + 1 })} disabled={currentPage >= totalPages - 1 || loading}>
                Successiva <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </section>

        <section className="admin-form-panel" aria-labelledby="admin-form-title">
          <div className="admin-panel-heading">
            <div>
              <p className="eyebrow">{editing ? 'Modifica completa' : 'Nuovo ingresso'}</p>
              <h2 id="admin-form-title">{editing ? 'Modifica auto' : 'Aggiungi auto'}</h2>
            </div>
            <span className="admin-form-panel__icon" aria-hidden="true">{editing ? <FilePenLine size={21} /> : <Plus size={22} />}</span>
          </div>
          {editing && <p className="admin-form-panel__id">ID auto: {editing.id}</p>}
          {!editing && (
            <button className="admin-form-panel__preset" type="button" onClick={startSpecialEdition}>
              Prepara Shelby GT500 Extreme · Special Edition 1/1
            </button>
          )}

          <form className="admin-form" onSubmit={(event) => void submit(event)}>
            <div className="admin-form__row">
              <label>Marca <input name="marca" autoComplete="off" required maxLength={60} value={form.marca} onChange={(event) => updateField('marca', event.target.value)} placeholder="Es. Toyota" /></label>
              <label>Modello <input name="modello" autoComplete="off" required maxLength={80} value={form.modello} onChange={(event) => updateField('modello', event.target.value)} placeholder="Es. Tacoma" /></label>
            </div>
            <label>Descrizione <textarea name="descrizione" rows={5} maxLength={4000} value={form.descrizione} onChange={(event) => updateField('descrizione', event.target.value)} placeholder="Racconta le caratteristiche dell’auto..." /></label>
            <span className="admin-form__counter">{form.descrizione.length} / 4000</span>
            <div className="admin-form__row">
              <label>Prezzo d’acquisto (€) <input name="prezzoAcquisto" type="text" inputMode="decimal" required value={form.prezzoAcquisto} onChange={(event) => updateField('prezzoAcquisto', event.target.value)} placeholder="0,00" /></label>
              <label>Prezzo di vendita (€) <input name="prezzoVendita" type="text" inputMode="decimal" required value={form.prezzoVendita} onChange={(event) => updateField('prezzoVendita', event.target.value)} placeholder="0,00" /></label>
            </div>
            <label className="admin-form__draft">
              <input type="checkbox" checked={form.isBozza} onChange={(event) => updateField('isBozza', event.target.checked)} />
              <span><strong>Salva come bozza</strong><small>Le bozze sono visibili solo agli amministratori.</small></span>
            </label>
            {editing && <p className="admin-form__hint">Un ribasso del prezzo di vendita può attivare gli avvisi prezzo degli utenti.</p>}
            {validationError && <p className="admin-feedback admin-feedback--error" role="alert">{validationError}</p>}
            {saveError && <p className="admin-feedback admin-feedback--error" role="alert">{saveError}</p>}
            {notice && <p className="admin-feedback admin-feedback--success" role="status"><Check size={17} aria-hidden="true" /> {notice}</p>}
            <div className="admin-form__actions">
              {editing && <button className="button button--outline" type="button" onClick={startCreate} disabled={saving}>Annulla modifica</button>}
              <button className="button button--terracotta" type="submit" disabled={saving || selecting}>
                {saving ? 'Salvataggio...' : editing ? 'Salva modifiche' : 'Crea auto'} <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </form>
        </section>
      </div>
      <p className="admin-page__security"><ShieldCheck size={16} aria-hidden="true" /> I prezzi d’acquisto e le bozze sono riservati agli amministratori.</p>
    </div>
  )
}

export default AdminDashboard
