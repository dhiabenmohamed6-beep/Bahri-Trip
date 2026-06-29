'use client'

import { useState, useEffect } from 'react'
import { DEFAULT_BANNER, type BannerSettings } from '@/lib/banner'
import { useTranslation } from '@/contexts/LanguageContext'

export default function Hero() {
  const { t } = useTranslation()
  const [banner, setBanner] = useState<BannerSettings>(DEFAULT_BANNER)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    async function loadBanner() {
      try {
        const res = await fetch('/api/banner?cache=' + Date.now())
        const data = await res.json()
        setBanner(data)
      } catch {
        setBanner(DEFAULT_BANNER)
      }
    }
    loadBanner()

    const interval = setInterval(loadBanner, 5000)
    const onFocus = () => loadBanner()
    window.addEventListener('focus', onFocus)
    return () => { clearInterval(interval); window.removeEventListener('focus', onFocus) }
  }, [])

  const bannerImage = isMobile && banner.phoneImageUrl ? banner.phoneImageUrl : banner.imageUrl
  const bannerTitle = isMobile && banner.phoneTitle ? banner.phoneTitle : banner.title
  const bannerSubtitle = isMobile && banner.phoneSubtitle ? banner.phoneSubtitle : banner.subtitle
  const bannerDescription = isMobile && banner.phoneDescription ? banner.phoneDescription : banner.description
  const bannerBtnPrimary = isMobile && banner.phoneBtnPrimary ? banner.phoneBtnPrimary : banner.btnPrimary
  const bannerBtnSecondary = isMobile && banner.phoneBtnSecondary ? banner.phoneBtnSecondary : banner.btnSecondary

  return (
    <section id="home" className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url('${bannerImage}')` }} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a4c]/70 via-[#1e3a4c]/40 to-[#1e3a4c]/70" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-32 md:pt-40 pb-20 sm:pb-28 md:pb-36 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl">
          <p className="uppercase tracking-[4px] sm:tracking-[6px] text-[#f0c27a] text-xs sm:text-sm mb-4 sm:mb-6 anim-fade-up font-semibold" style={{ animationDelay:'.1s' }}>
            {t.hero.welcome}
          </p>
          <h1 className="text-[clamp(2.8rem,8vw,7rem)] font-black text-white leading-[0.95] mb-6 sm:mb-8 anim-fade-up font-display" style={{ animationDelay:'.2s' }}>
            {bannerTitle}<br />
            <span className="text-[#7dd3d0]">{bannerSubtitle}</span>
          </h1>
          <p className="text-white/85 text-base sm:text-xl md:text-2xl max-w-xl leading-relaxed mb-8 sm:mb-10 anim-fade-up" style={{ animationDelay:'.3s' }}>
            {bannerDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 anim-fade-up" style={{ animationDelay:'.4s' }}>
            <a href="#booking" className="btn-primary text-center text-sm sm:text-base">
              {bannerBtnPrimary}
            </a>
            <a href="#about" className="btn-secondary text-center text-sm sm:text-base border-white text-white hover:bg-white hover:text-[#1e3a4c]">
              {bannerBtnSecondary}
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" className="w-full h-12 sm:h-16 fill-[#faf8f3]">
          <path d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,60 1440,50 L1440,100 L0,100 Z" />
        </svg>
      </div>
    </section>
  )
}
