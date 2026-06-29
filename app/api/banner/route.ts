import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_BANNER, type BannerSettings } from '@/lib/banner'
import { getStoredBanner, saveStoredBanner } from '@/lib/data-store'

export async function GET() {
  try {
    const banner = await getStoredBanner()
    return NextResponse.json(banner ?? DEFAULT_BANNER)
  } catch {
    return NextResponse.json(DEFAULT_BANNER)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const banner: BannerSettings = await req.json()
    await saveStoredBanner(banner)
    return NextResponse.json(banner)
  } catch {
    return NextResponse.json(DEFAULT_BANNER, { status: 500 })
  }
}