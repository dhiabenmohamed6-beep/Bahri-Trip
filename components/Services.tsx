'use client'

import { useEffect, useState } from 'react'
import { getServices, DEFAULT_SERVICES, type Service } from '@/lib/services'
import { useTranslation } from '@/contexts/LanguageContext'

const meta: Record<string, { icon: string; color: string }> = {
  'full-pack':  { icon: '🐟', color: '#2d8a9e' },
  'boat-full':  { icon: '🚤', color: '#1e5f74' },
  'boat-30min': { icon: '⛵', color: '#f0c27a' },
}

function toDisplay(svc: Service) {
  const m = meta[svc.id] || { icon: '✨', color: '#2d8a9e' }
  return { ...svc, ...m }
}

export default function Services() {
  const { t } = useTranslation()
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services?cache=' + Date.now())
        const data = await res.json()
        const visible = data.filter((s: Service) => s.visible)
        const prioritized = [
          ...visible.filter((s: Service) => s.id === 'full-pack' || s.id === 'boat-full' || s.id === 'boat-30min'),
          ...visible.filter((s: Service) => s.id !== 'full-pack' && s.id !== 'boat-full' && s.id !== 'boat-30min'),
        ]
        setServices(prioritized)
      } catch {
        const visible = DEFAULT_SERVICES.filter(s => s.visible)
        const prioritized = [
          ...visible.filter((s: Service) => s.id === 'full-pack' || s.id === 'boat-full' || s.id === 'boat-30min'),
          ...visible.filter((s: Service) => s.id !== 'full-pack' && s.id !== 'boat-full' && s.id !== 'boat-30min'),
        ]
        setServices(prioritized)
      }
    }
    loadServices()

    const interval = setInterval(loadServices, 30000)
    return () => clearInterval(interval)
  }, [])

  const visible = services.length > 0 ? services : DEFAULT_SERVICES.filter(s => s.visible)

  return (
    <section id="services" className="relative py-20 sm:py-28 bg-[#faf8f3] overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#2d8a9e]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 drift" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#f0c27a]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 drift" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12 sm:mb-16">
          <div className="anim-slide-right">
            <p className="uppercase tracking-[4px] text-[#2d8a9e] text-xs font-bold mb-3">{t.services.whatWeOffer}</p>
            <h2 className="text-[clamp(2rem,5vw,5rem)] font-black text-[#1e3a4c] leading-tight font-display"
                dangerouslySetInnerHTML={{ __html: t.services.title }} />
          </div>
          <p className="text-[#1e3a4c]/60 text-sm sm:text-lg max-w-md leading-relaxed anim-fade-up" style={{ animationDelay:'.15s' }}>
            {t.services.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {visible.map((svc, i) => {
            const m = meta[svc.id] || { icon: '✨', color: '#2d8a9e' }
            return (
              <div
                key={svc.id}
                className="card overflow-hidden group anim-scale"
                style={{ animationDelay: `${i * .1}s` }}
              >
                <div className="h-44 bg-cover bg-center relative" style={{ backgroundImage: `url('${svc.img || '/pack.jpg'}')` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a4c]/70 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl bg-white/90 backdrop-blur flex items-center justify-center text-2xl shadow-lg float">
                    {m.icon}
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="text-lg font-bold text-[#1e3a4c] mb-2 font-display">
                    {svc.id === 'full-pack' ? t.services.fullPack :
                     svc.id === 'boat-full' ? t.services.boatFull :
                     svc.id === 'boat-30min' ? t.services.boat30min : svc.title}
                  </h3>
                  <p className="text-[#1e3a4c]/60 text-sm leading-relaxed mb-4 line-clamp-3">{svc.desc}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-black font-display" style={{ color: m.color }}>{svc.price}</p>
                      <p className="text-xs text-[#1e3a4c]/50 font-medium">{svc.per}</p>
                    </div>
                    <a
                      href={`/booking?service=${svc.id}`}
                      className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105"
                      style={{ background: m.color, color: 'white' }}
                    >
                      {t.navbar.bookNow}
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 sm:mt-16 text-center anim-fade-up">
          <a href="/booking" className="btn-primary inline-block text-sm sm:text-base">
            {t.services.reserveTrip}
          </a>
        </div>
      </div>
    </section>
  )
}
