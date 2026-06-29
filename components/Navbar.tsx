'use client'

import { useState, useEffect } from 'react'
import SeaWeatherBar from '@/components/SeaWeatherBar'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslation } from '@/contexts/LanguageContext'
import { Menu, X } from 'lucide-react'

const links = [
  { labelKey: 'navbar.home', href: '#home' },
  { labelKey: 'navbar.about', href: '#about' },
  { labelKey: 'navbar.services', href: '#services' },
  { labelKey: 'navbar.booking', href: '#booking' },
  { labelKey: 'navbar.contact', href: '#contact' },
]

export default function Navbar() {
  const { t, resolvePath } = useTranslation()
  const [scrolled, setScrolled]   = useState(false)
  const [active, setActive]       = useState('home')
  const [menuOpen, setMenuOpen]   = useState(false)
  const [mounted, setMounted]     = useState(false)

  useEffect(() => {
    setMounted(true)
    const onScroll = () => {
      setScrolled(window.scrollY > 20)
      const sections = ['home','about','services','booking','contact']
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActive(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'nav-glass shadow-lg' : 'bg-transparent'}`}
      >
        <SeaWeatherBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <a href="#home" className="flex items-center group">
            <img
              src="/logo.png"
              alt="BAHRI TRIP"
              className="object-contain h-10 sm:h-12 w-auto transition-all duration-300 group-hover:scale-105"
              style={{ mixBlendMode: 'normal' }}
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
            <span className="text-2xl sm:text-3xl font-black ml-2 text-[#1e3a4c]">
              Bahri<span className="text-[#2d8a9e]">Trip</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setActive(l.href.slice(1))}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  active === l.href.slice(1)
                    ? 'bg-[#2d8a9e] text-white shadow-md shadow-[#2d8a9e]/20'
                    : 'text-[#1e3a4c] hover:text-[#2d8a9e] hover:bg-[#f0f7f8]'
                }`}
              >
                {resolvePath(l.labelKey)}
              </a>
            ))}
            <LanguageSwitcher />
            <a
              href="/admin/login"
              className="ml-3 px-4 py-2 text-sm font-semibold text-[#1e3a4c]/50 hover:text-[#2d8a9e] transition-colors"
            >
              {resolvePath('navbar.admin')}
            </a>
            <a
              href="#booking"
              className="ml-2 btn-primary text-sm"
            >
              {resolvePath('navbar.bookNow')}
            </a>
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl hover:bg-[#f0f7f8] transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6 text-[#1e3a4c]" /> : <Menu className="w-6 h-6 text-[#1e3a4c]" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden nav-glass border-t border-[#2d8a9e]/10 px-4 pb-4 anim-fade-up">
            <nav className="flex flex-col gap-1">
              {links.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => { setActive(l.href.slice(1)); setMenuOpen(false) }}
                  className={`block px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    active === l.href.slice(1)
                      ? 'bg-[#2d8a9e] text-white'
                      : 'text-[#1e3a4c] hover:bg-[#f0f7f8]'
                  }`}
                >
                {resolvePath(l.labelKey)}
                </a>
              ))}
              <a href="#booking" onClick={() => setMenuOpen(false)} className="btn-primary text-center text-sm mt-2">
              {resolvePath('navbar.bookNow')}
              </a>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
