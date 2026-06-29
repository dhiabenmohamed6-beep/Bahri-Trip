'use client'

import { useState } from 'react'
import { useTranslation, LANGUAGES } from '@/contexts/LanguageContext'
import { ChevronDown } from 'lucide-react'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation()
  const [open, setOpen] = useState(false)

  const current = LANGUAGES.find(l => l.code === language)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
      >
        <span>{current?.flag}</span>
        <span className="hidden sm:inline">{current?.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 min-w-[140px]">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                language === lang.code
                  ? 'bg-[#2d8a9e] text-white'
                  : 'text-[#1e3a4c] hover:bg-[#f0f7f8]'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
