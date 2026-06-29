'use client'

import { useEffect, useState } from 'react'

interface MarineCurrent {
  temperature_2m?: number | null
  water_temperature?: number | null
  wind_speed_10m?: number | null
  wave_height?: number | null
  wave_period?: number | null
  wave_direction?: number | null
  time?: string
}

interface MarineResponse {
  current?: MarineCurrent
  current_units?: Record<string, string>
  hourly?: {
    temperature_2m?: (number | null)[]
    water_temperature?: (number | null)[]
    wind_speed_10m?: (number | null)[]
    wave_height?: (number | null)[]
    wave_period?: (number | null)[]
    wave_direction?: (number | null)[]
  }
}

const API_URL = 'https://marine-api.open-meteo.com/v1/marine?latitude=37.05&longitude=10.98&current=temperature_2m,water_temperature,wind_speed_10m,wave_height,wave_period,wave_direction&hourly=temperature_2m,water_temperature,wind_speed_10m,wave_height,wave_period,wave_direction&timezone=auto'
const FALLBACK_SUMMARY = 'Live sea weather: water 24°C · calm waves · light wind · trips daily 10:00-18:00'

function firstDefined(...values: Array<number | null | undefined>): number | undefined {
  return values.find(value => typeof value === 'number')
}

function formatNumber(value: number | null | undefined, digits = 1): string {
  return typeof value === 'number' ? value.toFixed(digits) : '—'
}

function formatDirection(value: number | null | undefined): string {
  if (typeof value !== 'number') return 'variable'
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return directions[Math.round(value / 45) % 8]
}

function formatTime(value: string | undefined): string {
  if (!value) return 'live'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'live'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function buildSummary(data: MarineResponse): string {
  const current = data.current
  const hourly = data.hourly
  const water = firstDefined(current?.water_temperature, hourly?.water_temperature?.[0])
  const wave = firstDefined(current?.wave_height, hourly?.wave_height?.[0])
  const period = firstDefined(current?.wave_period, hourly?.wave_period?.[0])
  const wind = firstDefined(current?.wind_speed_10m, hourly?.wind_speed_10m?.[0])
  const direction = firstDefined(current?.wave_direction, hourly?.wave_direction?.[0])
  const air = firstDefined(current?.temperature_2m, hourly?.temperature_2m?.[0])

  return `Live sea weather: water ${formatNumber(water)}°C · waves ${formatNumber(wave)}m/${formatNumber(period, 0)}s from ${formatDirection(direction)} · wind ${formatNumber(wind, 0)} km/h · air ${formatNumber(air, 0)}°C · updated ${formatTime(current?.time)}`
}

export default function SeaWeatherBar() {
  const [summary, setSummary] = useState(FALLBACK_SUMMARY)

  useEffect(() => {
    let cancelled = false

    async function loadSeaWeather() {
      try {
        const res = await fetch(API_URL, { cache: 'no-store' })
        if (!res.ok) throw new Error('Sea weather unavailable')
        const data = await res.json() as MarineResponse
        if (!cancelled) setSummary(buildSummary(data))
      } catch {
        if (!cancelled) setSummary(FALLBACK_SUMMARY)
      }
    }

    loadSeaWeather()
    const interval = setInterval(loadSeaWeather, 10 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="relative h-7 sm:h-8 bg-[#1e3a4c] text-white overflow-hidden text-[10px] sm:text-xs font-semibold tracking-wide">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#1e3a4c] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#1e3a4c] to-transparent z-10" />
      <div className="h-full flex items-center whitespace-nowrap" style={{ animation: 'sea-weather-marquee 34s linear infinite' }}>
        <span className="pr-12">{summary}</span>
        <span className="pr-12" aria-hidden="true">{summary}</span>
        <span className="pr-12" aria-hidden="true">{summary}</span>
      </div>
      <style>{`
        @keyframes sea-weather-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
