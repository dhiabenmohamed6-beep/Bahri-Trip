import { NextRequest, NextResponse } from 'next/server'
import { generateId, type Reservation } from '@/lib/reservations'
import { getStoredReservations, upsertReservation, deleteStoredReservation } from '@/lib/data-store'

export async function GET() {
  const reservations = await getStoredReservations()
  return NextResponse.json(reservations)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const reservation: Reservation = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    ...body
  }
  
  await upsertReservation(reservation)
  return NextResponse.json(reservation)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const updated: Reservation = {
    ...body,
    serviceLabel: body.service_label ?? body.serviceLabel,
    adminNote: body.admin_note ?? body.adminNote,
    createdAt: body.created_at ?? body.createdAt,
  }
  
  await upsertReservation(updated)
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  
  await deleteStoredReservation(id)
  return NextResponse.json({ success: true })
}