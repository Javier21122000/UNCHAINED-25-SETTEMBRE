import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Bell, ChevronLeft, ChevronRight, Heart, RefreshCw, Search } from 'lucide-react'
import { CarDetailModal } from '../components/Cars/CarDetailModal'
import { PriceAlertModal } from '../components/Cars/PriceAlertModal'
import { CAR_CATEGORIES, getCarProfile } from '../lib/carCatalog'
import type { CarCategoryId } from '../lib/carCatalog'
import { useAuthStore } from '../stores/useAuthStore'
import { useCarStore } from '../stores/useCarStore'
import { useGarageStore } from '../stores/useGarageStore'
import { isCarAdminResponse } from '../types'
import type { CarSortBy, CarView, SortDirection } from '../types'
import './CatalogPage.css'

const euro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })

/** Nell'hero c'è spazio per un solo dato: le varianti dopo il punto restano nella scheda completa. */
function primaVariante(value: string): string {
  return value.split('·')[0].replace(' (0–100 km/h)', '').trim()
}

export function CatalogPage() {
  const cars = useCarStore((state) => state.cars)
  const query = useCarStore((state) => state.query)
  const totalElements = useCarStore((state) => state.totalElements)
  const hasLoaded = useCarStore((state) => state.hasLoaded)
  const loading = useCarStore((state) => state.loading)
  const error = useCarStore((state) => state.error)
  const selectedCar = useCarStore((state) => state.selectedCar)
  const fetchCars = useCarStore((state) => state.fetchCars)
  const selectCar = useCarStore((state) => state.selectCar)
  const setQuery = useCarStore((state) => state.setQuery)
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'ADMIN'
  const favorites = useGarageStore((state) => state.favorites)
  const alerts = useGarageStore((state) => state.alerts)
  const garageBusy = useGarageStore((state) => state.busy)
  const garageError = useGarageStore((state) => state.error)
  const garageNotice = useGarageStore((state) => state.notice)
  const loadGarage = useGarageStore((state) => state.loadGarage)
  const addFavorite = useGarageStore((state) => state.addFavorite)
  const clearGarageFeedback = useGarageStore((state) => state.clearFeedback)
  const reduceMotion = useReducedMotion()

  const [marca, setMarca] = useState(query.marca ?? '')
  const [modello, setModello] = useState(query.modello ?? '')
  const [category, setCategory] = useState<CarCategoryId | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedColors, setSelectedColors] = useState<Record<string, number>>({})
  const [alertCar, setAlertCar] = useState<CarView | null>(null)
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void fetchCars().catch(() => undefined)
  }, [fetchCars, query.marca, query.modello, query.prezzoMin, query.prezzoMax, query.sortBy, query.direction, query.page, query.size])

  useEffect(() => {
    if (user?.id) void loadGarage()
  }, [user?.id, loadGarage])

  /** Le categorie nascono dai risultati: mostriamo solo quelle che hanno almeno un'auto. */
  const sections = useMemo(() => {
    const byCategory = new Map<CarCategoryId, CarView[]>()
    for (const car of cars) {
      const { category: id } = getCarProfile(car)
      const bucket = byCategory.get(id)
      if (bucket) bucket.push(car)
      else byCategory.set(id, [car])
    }
    return CAR_CATEGORIES
      .map((meta) => ({ meta, cars: byCategory.get(meta.id) ?? [] }))
      .filter((section) => section.cars.length > 0)
  }, [cars])

  // La categoria scelta può sparire dopo una ricerca: in quel caso si torna alla prima disponibile.
  const activeSection = sections.find((section) => section.meta.id === category) ?? sections[0]
  const visibleCars = activeSection?.cars ?? []
  const featured = visibleCars.find((car) => car.id === activeId) ?? visibleCars[0]
  const featuredProfile = featured ? getCarProfile(featured) : null
  const featuredColor = featured ? (selectedColors[featured.id] ?? 0) : 0
  const featuredImage = featuredProfile?.images[featuredColor] ?? featuredProfile?.images[0]
  const featuredIndex = featured ? visibleCars.findIndex((car) => car.id === featured.id) : -1
  const isFavorite = featured ? favorites.some((favorite) => favorite.car.id === featured.id) : false
  const currentAlert = featured ? alerts.find((alert) => alert.carId === featured.id) : undefined

  useEffect(() => {
    const rail = railRef.current
    const activeButton = rail?.querySelector<HTMLElement>('[aria-current="true"]')
    if (!rail || !activeButton) return

    const left = activeButton.getBoundingClientRect().left
      - rail.getBoundingClientRect().left
      + rail.scrollLeft
      - (rail.clientWidth - activeButton.clientWidth) / 2
    rail.scrollTo({ left, behavior: reduceMotion ? 'instant' : 'smooth' })
  }, [featured?.id, activeSection?.meta.id, reduceMotion])

  const closeDetails = useCallback(() => selectCar(null), [selectCar])
  const closeAlert = useCallback(() => setAlertCar(null), [])

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCategory(null)
    setActiveId(null)
    setQuery({ marca: marca.trim() || undefined, modello: modello.trim() || undefined })
  }

  function changeSort(value: CarSortBy) {
    setActiveId(null)
    setQuery({ sortBy: value, direction: value === 'recenti' ? 'desc' : 'asc' })
  }

  function changeDirection(value: SortDirection) {
    setActiveId(null)
    setQuery({ direction: value })
  }

  function pickCategory(id: CarCategoryId) {
    setCategory(id)
    setActiveId(null)
  }

  function moveSelection(direction: -1 | 1) {
    if (featuredIndex < 0) return
    const next = visibleCars[Math.max(0, Math.min(visibleCars.length - 1, featuredIndex + direction))]
    if (next) setActiveId(next.id)
  }

  function openDetails(car: CarView) {
    clearGarageFeedback()
    selectCar(car)
  }

  function saveFavorite(car: CarView) {
    if (!user) {
      window.location.assign('/login?next=/catalogo')
      return
    }
    void addFavorite(car.id).catch(() => undefined)
  }

  function openAlert(car: CarView) {
    if (!user) {
      window.location.assign('/login?next=/catalogo')
      return
    }
    clearGarageFeedback()
    selectCar(null)
    setAlertCar(car)
  }

  function resetSearch() {
    setMarca('')
    setModello('')
    setCategory(null)
    setActiveId(null)
    setQuery({ marca: undefined, modello: undefined })
  }

  return (
    <div className="catalog-page" data-mood={activeSection?.meta.id ?? 'supercar'}>
      <div className="catalog-top">
        <section className="catalog-intro" aria-label="Introduzione al catalogo">
          <div>
            <p className="eyebrow catalog-intro__eyebrow">
              {activeSection ? activeSection.meta.eyebrow : 'La tua prossima strada inizia qui'}
            </p>
            <p className="catalog-intro__headline">
              {activeSection ? activeSection.meta.tagline : 'Un’auto per ogni storia.'}
            </p>
          </div>
          <p className="catalog-intro__count">
            {hasLoaded ? `${totalElements} ${totalElements === 1 ? 'auto disponibile' : 'auto disponibili'}` : 'Caricamento catalogo'}
          </p>
        </section>

        <form className="catalog-filters" onSubmit={submitFilters} aria-label="Filtra le auto">
          <label className="catalog-filters__field">
            <span>Marca</span>
            <input value={marca} onChange={(event) => setMarca(event.target.value)} placeholder="Es. Ferrari" maxLength={60} />
          </label>
          <label className="catalog-filters__field">
            <span>Modello</span>
            <input value={modello} onChange={(event) => setModello(event.target.value)} placeholder="Es. Purosangue" maxLength={80} />
          </label>
          <button className="catalog-filters__submit" type="submit" aria-label="Applica filtri">
            <Search size={18} aria-hidden="true" />
          </button>
          <label className="catalog-filters__field catalog-filters__field--sort">
            <span>Ordina per</span>
            <select value={query.sortBy ?? 'recenti'} onChange={(event) => changeSort(event.target.value as CarSortBy)}>
              <option value="recenti">Più recenti</option>
              <option value="prezzo">Prezzo</option>
              <option value="marca">Marca</option>
              <option value="modello">Modello</option>
              {isAdmin && <option value="prezzoAcquisto">Prezzo d’acquisto</option>}
            </select>
          </label>
          <label className="catalog-filters__field catalog-filters__field--direction">
            <span>Direzione</span>
            <select value={query.direction ?? 'desc'} onChange={(event) => changeDirection(event.target.value as SortDirection)}>
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
            </select>
          </label>
        </form>

        {sections.length > 1 && (
          <nav className="catalog-moods" aria-label="Categorie">
            {sections.map(({ meta, cars: group }) => (
              <button
                key={meta.id}
                type="button"
                className="catalog-moods__item"
                data-mood={meta.id}
                aria-current={activeSection?.meta.id === meta.id ? 'true' : undefined}
                onClick={() => pickCategory(meta.id)}
              >
                {meta.label}
                <span>{String(group.length).padStart(2, '0')}</span>
              </button>
            ))}
          </nav>
        )}

        {error && (
          <div className="catalog-feedback" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => void fetchCars().catch(() => undefined)}>
              <RefreshCw size={16} aria-hidden="true" /> Riprova
            </button>
          </div>
        )}
        {(garageError || garageNotice) && (
          <div className="catalog-feedback" role={garageError ? 'alert' : 'status'}>
            <span>{garageError || garageNotice}</span>
            <button type="button" onClick={clearGarageFeedback} aria-label="Chiudi messaggio">×</button>
          </div>
        )}
      </div>

      {!hasLoaded && loading ? (
        <div className="catalog-loading" role="status" aria-live="polite">
          <motion.span
            className="catalog-loading__ring"
            aria-hidden="true"
            animate={reduceMotion ? undefined : { rotate: 360 }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          />
          <span>Prepariamo il catalogo...</span>
        </div>
      ) : !hasLoaded && error ? (
        <section className="catalog-empty" aria-live="polite">
          <span className="eyebrow">Catalogo non disponibile</span>
          <h1 className="display-title">Ci vediamo sulla strada.</h1>
          <p>Non riusciamo a caricare le auto in questo momento. Riprova tra poco.</p>
          <button className="button button--light" type="button" onClick={() => void fetchCars().catch(() => undefined)}>
            Riprova <RefreshCw size={16} aria-hidden="true" />
          </button>
        </section>
      ) : featured && featuredProfile ? (
        <>
          <section className="catalog-hero" aria-label={`${featured.marca} ${featured.modello}`}>
            <div className="catalog-hero__stage">
              <div className="catalog-hero__sun" aria-hidden="true" />
              <div className="catalog-hero__ridge catalog-hero__ridge--back" aria-hidden="true" />
              <div className="catalog-hero__ridge catalog-hero__ridge--front" aria-hidden="true" />
              <motion.h1
                key={`title-${featured.id}`}
                className="display-title catalog-hero__title"
                initial={reduceMotion ? false : { opacity: 0, x: -26 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              >
                {featured.modello}
              </motion.h1>
              <motion.img
                key={`image-${featured.id}-${featuredColor}`}
                className="catalog-hero__car"
                src={featuredImage?.src}
                alt={featuredProfile.illustrative
                  ? 'Auto raffigurata a scopo illustrativo'
                  : `${featured.marca} ${featured.modello}, colore ${featuredImage?.label}`}
                initial={reduceMotion ? false : { opacity: 0, x: 38, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              />
              <span className="catalog-hero__image-note">
                {featuredProfile.illustrative ? 'Immagine illustrativa' : 'Immagine di riferimento'}
              </span>
            </div>

            <div className="catalog-hero__details">
              <div className="catalog-hero__meta">
                <p className="eyebrow catalog-hero__brand">{featured.marca} · {featuredProfile.anno}</p>
                {featuredProfile.specialEdition && <span className="catalog-hero__edition">Special Edition · 1/1</span>}
              </div>
              <h2>{featured.modello}</h2>
              <p className="catalog-hero__claim">{featuredProfile.claim}</p>
              <p className="catalog-hero__description">{featured.descrizione}</p>

              <dl className="catalog-hero__specs">
                <div>
                  <dt>Potenza</dt>
                  <dd title={featuredProfile.specs.potenza}>{primaVariante(featuredProfile.specs.potenza)}</dd>
                </div>
                <div>
                  <dt>0–100</dt>
                  <dd title={featuredProfile.specs.accelerazione}>{primaVariante(featuredProfile.specs.accelerazione)}</dd>
                </div>
                <div>
                  <dt>Velocità</dt>
                  <dd title={featuredProfile.specs.velocita}>{primaVariante(featuredProfile.specs.velocita)}</dd>
                </div>
              </dl>

              <p className="catalog-hero__price">{euro.format(featured.prezzoVendita)}</p>

              {featuredProfile.images.length > 1 && (
                <div className="catalog-hero__colors" role="group" aria-label="Colori nelle immagini">
                  <span>Colori in foto</span>
                  {featuredProfile.images.map((variant, index) => (
                    <button
                      key={variant.src}
                      type="button"
                      className="car-color"
                      style={{ backgroundColor: variant.color }}
                      aria-label={`Mostra ${variant.label}`}
                      aria-pressed={featuredColor === index}
                      title={variant.label}
                      onClick={() => setSelectedColors((colors) => ({ ...colors, [featured.id]: index }))}
                    />
                  ))}
                </div>
              )}
              {isAdmin && isCarAdminResponse(featured) && featured.isBozza && (
                <span className="catalog-hero__draft">Bozza</span>
              )}

              <div className="catalog-hero__actions">
                <motion.button
                  className="button button--light"
                  type="button"
                  onClick={() => openDetails(featured)}
                  whileHover={reduceMotion ? undefined : { y: -3 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                >
                  Scheda completa <ArrowUpRight size={17} aria-hidden="true" />
                </motion.button>
                <motion.button
                  className="catalog-hero__secondary-action"
                  type="button"
                  onClick={() => saveFavorite(featured)}
                  disabled={garageBusy || isFavorite}
                  whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                >
                  <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
                  {isFavorite ? 'Nei preferiti' : 'Salva'}
                </motion.button>
                <motion.button
                  className="catalog-hero__secondary-action"
                  type="button"
                  onClick={() => openAlert(featured)}
                  whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                >
                  <Bell size={16} aria-hidden="true" />
                  {currentAlert?.inviato ? 'Avviso inviato' : currentAlert ? 'Avviso attivo' : 'Avviso prezzo'}
                </motion.button>
              </div>
            </div>
          </section>

          <section className="catalog-carousel" aria-label={`Auto della categoria ${activeSection?.meta.label ?? ''}`}>
            <div className="catalog-carousel__heading">
              <h2>{activeSection?.meta.label}</h2>
              <div className="catalog-carousel__controls">
                <button type="button" onClick={() => moveSelection(-1)} disabled={featuredIndex <= 0} aria-label="Auto precedente">
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSelection(1)}
                  disabled={featuredIndex < 0 || featuredIndex >= visibleCars.length - 1}
                  aria-label="Auto successiva"
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="catalog-carousel__rail" ref={railRef}>
              {visibleCars.map((car, index) => {
                const profile = getCarProfile(car)
                return (
                  <motion.button
                    key={car.id}
                    className="catalog-carousel__item"
                    type="button"
                    aria-current={featured.id === car.id ? 'true' : undefined}
                    onClick={() => setActiveId(car.id)}
                    whileHover={reduceMotion ? undefined : { y: -4 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  >
                    <span className="catalog-carousel__image-wrap">
                      <img src={profile.images[selectedColors[car.id] ?? 0]?.src ?? profile.images[0].src} alt="" loading="lazy" />
                    </span>
                    <span className="catalog-carousel__item-label">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <strong>{car.marca} {car.modello}</strong>
                    </span>
                    <span className="catalog-carousel__item-price">{euro.format(car.prezzoVendita)}</span>
                  </motion.button>
                )
              })}
            </div>
          </section>
        </>
      ) : hasLoaded ? (
        <section className="catalog-empty" aria-live="polite">
          <span className="eyebrow">Nessun risultato</span>
          <h1 className="display-title">La strada continua.</h1>
          <p>Non ci sono auto per questi filtri. Prova un’altra ricerca.</p>
          <button className="button button--light" type="button" onClick={resetSearch}>
            Mostra tutte le auto <ArrowRight size={16} aria-hidden="true" />
          </button>
        </section>
      ) : null}

      <CarDetailModal
        car={selectedCar}
        selectedVariantIndex={selectedCar ? (selectedColors[selectedCar.id] ?? 0) : 0}
        onVariantSelect={(index) => {
          if (selectedCar) setSelectedColors((colors) => ({ ...colors, [selectedCar.id]: index }))
        }}
        onClose={closeDetails}
        onOpenAlert={openAlert}
      />
      <PriceAlertModal car={alertCar} onClose={closeAlert} />
    </div>
  )
}

export default CatalogPage
