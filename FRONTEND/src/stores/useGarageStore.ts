import axios from 'axios'
import { create } from 'zustand'
import { api, getApiErrorMessage } from '../lib/api'
import type {
  FavoriteCreateRequest,
  FavoriteResponse,
  PriceAlertCreateRequest,
  PriceAlertResponse,
  UUID,
} from '../types'

interface GarageState {
  favorites: FavoriteResponse[]
  alerts: PriceAlertResponse[]
  favoritesLoaded: boolean
  alertsLoaded: boolean
  loading: boolean
  busy: boolean
  error: string | null
  notice: string | null
  loadGarage: () => Promise<void>
  addFavorite: (carId: UUID) => Promise<void>
  removeFavorite: (id: UUID) => Promise<void>
  createAlert: (request: PriceAlertCreateRequest) => Promise<void>
  removeAlert: (id: UUID) => Promise<void>
  clearFeedback: () => void
  reset: () => void
}

let generation = 0

export const useGarageStore = create<GarageState>((set, get) => ({
  favorites: [],
  alerts: [],
  favoritesLoaded: false,
  alertsLoaded: false,
  loading: false,
  busy: false,
  error: null,
  notice: null,

  loadGarage: async () => {
    const requestGeneration = ++generation
    set({ loading: true, error: null })

    const [favoritesResult, alertsResult] = await Promise.allSettled([
      api.get<FavoriteResponse[]>('/api/favorites'),
      api.get<PriceAlertResponse[]>('/api/alerts'),
    ])
    if (requestGeneration !== generation) return

    const errors: string[] = []
    if (favoritesResult.status === 'fulfilled') {
      set({ favorites: favoritesResult.value.data, favoritesLoaded: true })
    } else {
      set({ favoritesLoaded: false })
      errors.push(`Preferiti: ${getApiErrorMessage(favoritesResult.reason)}`)
    }

    if (alertsResult.status === 'fulfilled') {
      set({ alerts: alertsResult.value.data, alertsLoaded: true })
    } else {
      set({ alertsLoaded: false })
      errors.push(`Avvisi: ${getApiErrorMessage(alertsResult.reason)}`)
    }

    set({ loading: false, error: errors.length ? errors.join(' ') : null })
  },

  addFavorite: async (carId) => {
    if (get().favorites.some((favorite) => favorite.car.id === carId)) {
      set({ notice: 'Auto già presente nei preferiti.', error: null })
      return
    }

    set({ busy: true, error: null, notice: null })
    try {
      const request: FavoriteCreateRequest = { carId }
      const { data } = await api.post<FavoriteResponse>('/api/favorites', request)
      generation += 1
      set((state) => ({
        favorites: [...state.favorites, data],
        favoritesLoaded: true,
        loading: false,
        busy: false,
        notice: 'Auto aggiunta ai preferiti.',
      }))
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) && error.response?.status === 409
        ? 'Auto già presente nei preferiti.'
        : getApiErrorMessage(error, 'Impossibile aggiungere il preferito.')
      set({ busy: false, error: message })
      throw error
    }
  },

  removeFavorite: async (id) => {
    set({ busy: true, error: null, notice: null })
    try {
      await api.delete<void>(`/api/favorites/${encodeURIComponent(id)}`)
      generation += 1
      set((state) => ({
        favorites: state.favorites.filter((favorite) => favorite.id !== id),
        favoritesLoaded: true,
        loading: false,
        busy: false,
        notice: 'Preferito rimosso.',
      }))
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        generation += 1
        set((state) => ({
          favorites: state.favorites.filter((favorite) => favorite.id !== id),
          favoritesLoaded: true,
          loading: false,
          busy: false,
          notice: 'Preferito non trovato o non tuo.',
        }))
        return
      }
      set({ busy: false, error: getApiErrorMessage(error, 'Impossibile rimuovere il preferito.') })
      throw error
    }
  },

  createAlert: async (request) => {
    if (get().alerts.some((alert) => alert.carId === request.carId)) {
      set({ error: 'Esiste già un avviso per questa auto.', notice: null })
      throw new Error('Esiste già un avviso per questa auto.')
    }

    set({ busy: true, error: null, notice: null })
    try {
      const { data } = await api.post<PriceAlertResponse>('/api/alerts', request)
      generation += 1
      set((state) => ({
        alerts: [...state.alerts, data],
        alertsLoaded: true,
        loading: false,
        busy: false,
        notice: 'Avviso prezzo creato.',
      }))
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) && error.response?.status === 409
        ? 'Esiste già un avviso per questa auto.'
        : getApiErrorMessage(error, 'Impossibile creare l’avviso.')
      set({ busy: false, error: message })
      throw error
    }
  },

  removeAlert: async (id) => {
    set({ busy: true, error: null, notice: null })
    try {
      await api.delete<void>(`/api/alerts/${encodeURIComponent(id)}`)
      generation += 1
      set((state) => ({
        alerts: state.alerts.filter((alert) => alert.id !== id),
        alertsLoaded: true,
        loading: false,
        busy: false,
        notice: 'Avviso rimosso.',
      }))
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        generation += 1
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== id),
          alertsLoaded: true,
          loading: false,
          busy: false,
          notice: 'Avviso non trovato o non tuo.',
        }))
        return
      }
      set({ busy: false, error: getApiErrorMessage(error, 'Impossibile rimuovere l’avviso.') })
      throw error
    }
  },

  clearFeedback: () => set({ error: null, notice: null }),

  reset: () => {
    generation += 1
    set({ favorites: [], alerts: [], favoritesLoaded: false, alertsLoaded: false, loading: false, busy: false, error: null, notice: null })
  },
}))
