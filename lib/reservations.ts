export type ReservationStatus = 'pending' | 'confirmed' | 'waiting' | 'cancelled'

export interface Reservation {
  id: string
  createdAt: string
  name: string
  phone: string
  email: string
  service: string
  serviceLabel: string
  date: string
  time: string
  people: number
  adults: number
  children: number
  under5: number
  hours: number
  message: string
  payment: string
  total: number
  status: ReservationStatus
  adminNote: string
  discount: number
}

const KEY = 'aqua_reservations'

export function getReservations(): Reservation[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') as Reservation[] }
  catch { return [] }
}

export function saveReservation(r: Reservation): void {
  const all = getReservations()
  all.unshift(r)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function updateReservation(updated: Reservation): void {
  const all = getReservations().map(r => r.id === updated.id ? updated : r)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function deleteReservation(id: string): void {
  const all = getReservations().filter(r => r.id !== id)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function generateId(): string {
  return 'RES-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,6).toUpperCase()
}

