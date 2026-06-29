'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { translations, type Language, DEFAULT_LANGUAGE, LANGUAGES } from '@/lib/i18n/translations'
import type { TranslationKey } from '@/lib/i18n/translations'

function resolvePath(obj: TranslationKey, path: string): string {
  return path.split('.').reduce((current: any, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as any)[key]
    }
    return path
  }, obj as any) as string
}

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationKey
  resolvePath: (path: string) => string
}

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: translations.en,
  resolvePath: () => '',
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('bahri_language')
    if (stored && (stored === 'en' || stored === 'fr' || stored === 'ar' || stored === 'de')) {
      setLanguage(stored)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('bahri_language', lang)
    document.documentElement.lang = lang
    if (lang === 'ar') {
      document.documentElement.dir = 'rtl'
    } else {
      document.documentElement.dir = 'ltr'
    }
  }

  if (!mounted) {
    return (
      <LanguageContext.Provider value={{ language: DEFAULT_LANGUAGE, setLanguage: handleSetLanguage, t: translations.en, resolvePath: () => '' }}>
        {children}
      </LanguageContext.Provider>
    )
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: translations[language], resolvePath: (path: string) => resolvePath(translations[language], path) }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}

export { LANGUAGES }
