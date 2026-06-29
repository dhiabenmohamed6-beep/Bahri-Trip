import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_SERVICES, type Service } from '@/lib/services'
import { getStoredServices, saveStoredServices } from '@/lib/data-store'

export async function GET() {
  try {
    const services = await getStoredServices()
    return NextResponse.json(services.length > 0 ? services : DEFAULT_SERVICES)
  } catch {
    return NextResponse.json(DEFAULT_SERVICES)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const services = await req.json()
    await saveStoredServices(services)
    return NextResponse.json(services)
  } catch {
    return NextResponse.json(DEFAULT_SERVICES)
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  
  // Note: The admin page handles the delete by sending the full list without the item
  return NextResponse.json({ success: true })
}