'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/contexts/LanguageContext'

export default function AdminLogin() {
  const router = useRouter()
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (username === 'bahri_atef2026' && password === 'atef.bahri07.2026') {
      localStorage.setItem('bahri_admin', 'true')
      router.push('/admin/dashboard')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #faf8f3 0%, #f0f7f4 100%)' }}>
      <a
        href="/"
        className="fixed top-6 left-6 flex items-center gap-2 text-sm font-bold text-[#1e3a4c]/60 hover:text-[#2d8a9e] bg-white px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all"
      >
        ← {t.admin.backToSite}
      </a>

      <div className="w-full max-w-md">
        <div className="text-center mb-8 anim-fade-up">
          <h1 className="text-4xl font-black text-[#1e3a4c] font-display" dangerouslySetInnerHTML={{ __html: t.admin.loginTitle }} />
          <p className="text-[#1e3a4c]/50 mt-2 text-sm font-medium">{t.admin.loginSubtitle}</p>
        </div>

        <div className="card p-8 sm:p-10 anim-scale">
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-[#1e3a4c]/70 mb-2 uppercase tracking-wider">{t.admin.username}</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border border-[#2d8a9e]/15 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#2d8a9e]/30 bg-[#faf8f3] text-[#1e3a4c] font-medium"
                placeholder="Username"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1e3a4c]/70 mb-2 uppercase tracking-wider">{t.admin.password}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-[#2d8a9e]/15 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#2d8a9e]/30 bg-[#faf8f3] text-[#1e3a4c] font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm font-semibold bg-red-50 p-3 rounded-2xl">{error}</p>
            )}

            <button
              type="submit"
              className="text-white font-bold py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[.98] shadow-lg"
              style={{ background: 'linear-gradient(135deg,#1e5f74,#2d8a9e)' }}
            >
              {t.admin.signIn}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
