import { type Reservation } from '@/lib/reservations'
import { type Service } from '@/lib/services'
import { type BannerSettings } from '@/lib/banner'
import { type ContactMessage } from '@/lib/contact'

let supabase: any = null

function getSupabase() {
  if (!supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (url && key) {
      try {
        const { createClient } = require('@supabase/supabase-js')
        supabase = createClient(url, key)
      } catch (e) {
        console.error('Failed to create Supabase client:', e)
      }
    }
  }
  return supabase
}

// In-memory fallback
let fallbackMessages: any[] = []
let fallbackServices: any[] = []

// Reservations
export async function getStoredReservations(): Promise<Reservation[]> {
  const sb = getSupabase()
  if (!sb) return []
  try {
    const { data, error } = await sb.from('reservations').select('*').order('created_at', { ascending: false })
    if (error) return []
    return (data || []).map((r: any) => ({
      id: r.id,
      createdAt: r.created_at,
      name: r.name,
      phone: r.phone,
      email: r.email,
      service: r.service,
      serviceLabel: r.service_label,
      date: r.date,
      time: r.time,
      people: r.people,
      adults: r.adults,
      children: r.children,
      under5: r.under5,
      hours: r.hours,
      message: r.message,
      payment: r.payment,
      total: r.total,
      status: r.status,
      adminNote: r.admin_note,
      discount: r.discount,
    }))
  } catch {
    return []
  }
}

export async function upsertReservation(reservation: Reservation): Promise<void> {
  const sb = getSupabase()
  if (!sb) {
    console.error('Supabase not configured')
    return
  }
  try {
    const dbReservation = {
      id: reservation.id,
      created_at: reservation.createdAt,
      name: reservation.name,
      phone: reservation.phone,
      email: reservation.email,
      service: reservation.service,
      service_label: reservation.serviceLabel,
      date: reservation.date,
      time: reservation.time,
      people: reservation.people,
      adults: reservation.adults,
      children: reservation.children,
      under5: reservation.under5,
      hours: reservation.hours,
      message: reservation.message,
      payment: reservation.payment,
      total: reservation.total,
      status: reservation.status,
      admin_note: reservation.adminNote,
      discount: reservation.discount,
    }
    const { error } = await sb.from('reservations').upsert(dbReservation)
    if (error) console.error('Upsert error:', error)
  } catch (e) {
    console.error('Upsert exception:', e)
  }
}

export async function deleteStoredReservation(id: string): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  try {
    await sb.from('reservations').delete().eq('id', id)
  } catch {}
}

// Services
export async function getStoredServices(): Promise<Service[]> {
  const sb = getSupabase()
  if (!sb) {
    return fallbackServices.map((s: any) => ({
      id: s.id,
      title: s.title,
      desc: s.desc,
      price: s.price,
      basePrice: s.base_price,
      per: s.per,
      img: s.img,
      perPerson: s.per_person,
      hourly: s.hourly,
      visible: s.visible,
      hasFood: s.has_food,
    }))
  }
  try {
    const { data, error } = await sb.from('services').select('*')
    if (error || !data) return []
    return data.map((s: any) => ({
      id: s.id,
      title: s.title,
      desc: s.desc,
      price: s.price,
      basePrice: s.base_price,
      per: s.per,
      img: s.img,
      perPerson: s.per_person,
      hourly: s.hourly,
      visible: s.visible,
      hasFood: s.has_food,
    }))
  } catch {
    return []
  }
}

export async function saveStoredServices(services: Service[]): Promise<void> {
  const sb = getSupabase()
  if (!sb) {
    fallbackServices = [...services]
    return
  }
  for (const service of services) {
    try {
      await sb.from('services').upsert({
        id: service.id,
        title: service.title,
        desc: service.desc,
        price: service.price,
        base_price: service.basePrice,
        per: service.per,
        img: service.img,
        per_person: service.perPerson,
        hourly: service.hourly,
        visible: service.visible,
        has_food: service.hasFood,
      })
    } catch (e) {
      console.error('Service upsert error:', e)
      fallbackServices = [...services]
    }
  }
}

// Messages
export async function getStoredMessages(): Promise<ContactMessage[]> {
  const sb = getSupabase()
  if (!sb) {
    return fallbackMessages.map((m: any) => ({
      id: m.id,
      createdAt: m.createdAt,
      name: m.name,
      phone: m.phone,
      email: m.email,
      subject: m.subject,
      message: m.message,
      read: m.read,
    }))
  }
  try {
    const { data, error } = await sb.from('messages').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('Messages fetch error:', error)
      return []
    }
    return (data || []).map((m: any) => ({
      id: m.id,
      createdAt: m.created_at,
      name: m.name,
      phone: m.phone,
      email: m.email,
      subject: m.subject,
      message: m.message,
      read: m.read,
    }))
  } catch {
    return []
  }
}

export async function upsertMessage(message: ContactMessage): Promise<void> {
  const sb = getSupabase()
  if (!sb) {
    fallbackMessages.unshift(message)
    return
  }
  try {
    await sb.from('messages').upsert({
      id: message.id,
      created_at: message.createdAt,
      name: message.name,
      phone: message.phone,
      email: message.email,
      subject: message.subject,
      message: message.message,
      read: message.read,
    })
  } catch (e) {
    console.error('Message upsert error:', e)
    fallbackMessages.unshift(message)
  }
}

export async function deleteStoredMessage(id: string): Promise<void> {
  const sb = getSupabase()
  if (!sb) {
    fallbackMessages = fallbackMessages.filter(m => m.id !== id)
    return
  }
  try {
    await sb.from('messages').delete().eq('id', id)
  } catch (e) {
    console.error('Message delete error:', e)
    fallbackMessages = fallbackMessages.filter(m => m.id !== id)
  }
}

// Banner
export async function getStoredBanner(): Promise<BannerSettings | null> {
  const sb = getSupabase()
  if (!sb) return null
  try {
    const { data, error } = await sb.from('banner').select('*').single()
    if (error || !data) return null
    return {
      imageUrl: data.image_url,
      phoneImageUrl: data.phone_image_url ?? '',
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      btnPrimary: data.btn_primary,
      btnSecondary: data.btn_secondary,
      phoneTitle: data.phone_title ?? '',
      phoneSubtitle: data.phone_subtitle ?? '',
      phoneDescription: data.phone_description ?? '',
      phoneBtnPrimary: data.phone_btn_primary ?? '',
      phoneBtnSecondary: data.phone_btn_secondary ?? '',
    }
  } catch {
    return null
  }
}

export async function saveStoredBanner(banner: BannerSettings): Promise<void> {
  const sb = getSupabase()
  if (!sb) {
    console.error('Supabase not configured - banner not saved to database')
    return
  }
  try {
    const data: any = {
      id: 'single',
      image_url: banner.imageUrl,
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      btn_primary: banner.btnPrimary,
      btn_secondary: banner.btnSecondary,
    }
    if (banner.phoneImageUrl) data.phone_image_url = banner.phoneImageUrl
    if (banner.phoneTitle) data.phone_title = banner.phoneTitle
    if (banner.phoneSubtitle) data.phone_subtitle = banner.phoneSubtitle
    if (banner.phoneDescription) data.phone_description = banner.phoneDescription
    if (banner.phoneBtnPrimary) data.phone_btn_primary = banner.phoneBtnPrimary
    if (banner.phoneBtnSecondary) data.phone_btn_secondary = banner.phoneBtnSecondary
    const { error } = await sb.from('banner').upsert(data)
    if (error) console.error('Banner upsert error:', error)
  } catch (e) {
    console.error('Banner save exception:', e)
  }
}