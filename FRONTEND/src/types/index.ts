export type UUID = string
export type ISODateTime = string
export type Role = 'USER' | 'ADMIN'

export interface UserResponse {
  id: UUID
  username: string
  email: string
  role: Role
  createdAt: ISODateTime
}

export interface AuthResponse {
  accessToken: string
  tokenType: 'Bearer'
  expiresInSeconds: number
  user: UserResponse
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  email: string
}

export interface CarResponse {
  id: UUID
  marca: string
  modello: string
  descrizione: string | null
  prezzoVendita: number
}

export interface CarAdminResponse extends CarResponse {
  prezzoAcquisto: number
  isBozza: boolean
  createdAt: ISODateTime
  updatedAt: ISODateTime
}

export type CarView = CarResponse | CarAdminResponse

export function isCarAdminResponse(car: CarView): car is CarAdminResponse {
  return 'prezzoAcquisto' in car && 'isBozza' in car
}

export interface CarCreateRequest {
  marca: string
  modello: string
  descrizione: string | null
  prezzoAcquisto: number
  prezzoVendita: number
  isBozza: boolean
}

export type CarUpdateRequest = CarCreateRequest

export type CarSortBy = 'recenti' | 'prezzo' | 'marca' | 'modello' | 'prezzoAcquisto'
export type SortDirection = 'asc' | 'desc'

export interface CarSearchParams {
  marca?: string
  modello?: string
  prezzoMin?: number
  prezzoMax?: number
  sortBy?: CarSortBy
  direction?: SortDirection
  page?: number
  size?: number
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface FavoriteCreateRequest {
  carId: UUID
}

export interface FavoriteResponse {
  id: UUID
  car: CarResponse
  createdAt: ISODateTime
}

export interface PriceAlertCreateRequest {
  carId: UUID
  sogliaPrezzo: number
}

export interface PriceAlertResponse {
  id: UUID
  carId: UUID
  marca: string
  modello: string
  prezzoVenditaAttuale: number
  sogliaPrezzo: number
  inviato: boolean
  createdAt: ISODateTime
}

export interface MessageResponse {
  message: string
}

export interface FieldViolation {
  field: string
  message: string
}

export interface ApiErrorResponse {
  timestamp: ISODateTime
  status: number
  error: string
  message: string
  path: string
  fieldErrors: FieldViolation[]
}
