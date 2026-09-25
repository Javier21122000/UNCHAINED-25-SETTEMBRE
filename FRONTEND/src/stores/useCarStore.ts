import { create } from 'zustand'
import { api, getApiErrorMessage } from '../lib/api'
import type {
  CarAdminResponse,
  CarCreateRequest,
  CarSearchParams,
  CarUpdateRequest,
  CarView,
  PageResponse,
  UUID,
} from '../types'

interface CarState {
  cars: CarView[]
  selectedCar: CarView | null
  query: CarSearchParams
  totalElements: number
  totalPages: number
  hasLoaded: boolean
  loading: boolean
  saving: boolean
  error: string | null
  setQuery: (updates: Partial<CarSearchParams>) => void
  fetchCars: () => Promise<void>
  fetchCarById: (id: UUID) => Promise<CarView>
  selectCar: (car: CarView | null) => void
  createCar: (request: CarCreateRequest) => Promise<CarAdminResponse>
  updateCar: (id: UUID, request: CarUpdateRequest) => Promise<CarAdminResponse>
  clearError: () => void
  reset: () => void
}

const initialQuery: CarSearchParams = {
  sortBy: 'recenti',
  page: 0,
  size: 60,
}

let requestSequence = 0

export const useCarStore = create<CarState>((set, get) => ({
  cars: [],
  selectedCar: null,
  query: { ...initialQuery },
  totalElements: 0,
  totalPages: 0,
  hasLoaded: false,
  loading: false,
  saving: false,
  error: null,

  setQuery: (updates) => {
    requestSequence += 1
    set((state) => ({
      query: { ...state.query, ...updates, page: updates.page ?? 0 },
      error: null,
    }))
  },

  fetchCars: async () => {
    const sequence = ++requestSequence
    set({ loading: true, error: null })

    try {
      const { data } = await api.get<PageResponse<CarView>>('/api/cars', {
        params: get().query,
      })
      if (sequence !== requestSequence) return

      set({
        cars: data.content,
        totalElements: data.totalElements,
        totalPages: data.totalPages,
        query: data.page === get().query.page && data.size === get().query.size
          ? get().query
          : { ...get().query, page: data.page, size: data.size },
        hasLoaded: true,
        loading: false,
      })
    } catch (error: unknown) {
      if (sequence !== requestSequence) return
      set({ loading: false, error: getApiErrorMessage(error, 'Catalogo non disponibile.') })
      throw error
    }
  },

  fetchCarById: async (id) => {
    set({ error: null })
    try {
      const { data } = await api.get<CarView>(`/api/cars/${encodeURIComponent(id)}`)
      set({ selectedCar: data })
      return data
    } catch (error: unknown) {
      set({ error: getApiErrorMessage(error, 'Auto non disponibile.') })
      throw error
    }
  },

  selectCar: (car) => set({ selectedCar: car }),

  createCar: async (request) => {
    set({ saving: true, error: null })
    try {
      const { data } = await api.post<CarAdminResponse>('/api/cars', request)
      set({ saving: false })
      await get().fetchCars().catch(() => undefined)
      return data
    } catch (error: unknown) {
      set({ saving: false, error: getApiErrorMessage(error, 'Creazione non riuscita.') })
      throw error
    }
  },

  updateCar: async (id, request) => {
    set({ saving: true, error: null })
    try {
      const { data } = await api.put<CarAdminResponse>(`/api/cars/${encodeURIComponent(id)}`, request)
      set((state) => ({
        saving: false,
        selectedCar: state.selectedCar?.id === id ? data : state.selectedCar,
      }))
      await get().fetchCars().catch(() => undefined)
      return data
    } catch (error: unknown) {
      set({ saving: false, error: getApiErrorMessage(error, 'Modifica non riuscita.') })
      throw error
    }
  },

  clearError: () => set({ error: null }),

  reset: () => {
    requestSequence += 1
    set({
      cars: [],
      selectedCar: null,
      query: { ...initialQuery },
      totalElements: 0,
      totalPages: 0,
      hasLoaded: false,
      loading: false,
      saving: false,
      error: null,
    })
  },
}))
