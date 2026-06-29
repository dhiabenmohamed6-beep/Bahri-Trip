'use client'

import { useEffect, useState } from 'react'
import { DEFAULT_SERVICES, type Service } from '@/lib/services'
import { useTranslation } from '@/contexts/LanguageContext'

export default function Contact() {
  const { t } = useTranslation()
  const [services, setServices] = useState<Service[]>([])
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services?cache=' + Date.now())
        const data = await res.json()
        setServices(data.filter((s: Service) => s.visible))
      } catch {
        setServices(DEFAULT_SERVICES.filter(s => s.visible))
      }
    }
    loadServices()
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    try {
      const body = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...form,
      }
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      setForm({ name: '', phone: '', email: '', subject: '', message: '' })
      setSent(true)
      setTimeout(() => setSent(false), 4000)
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="relative py-20 sm:py-28 bg-[#faf8f3] overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#7dd3d0]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2 drift" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#f0c27a]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3 drift" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-12 sm:mb-16 anim-fade-up">
          <p className="uppercase tracking-[5px] text-[#2d8a9e] text-xs font-bold mb-3">Get In Touch</p>
          <h2 className="text-[clamp(2rem,5vw,5rem)] font-black text-[#1e3a4c] font-display leading-tight" dangerouslySetInnerHTML={{ __html: t.contact.title }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
          <div className="lg:col-span-3 card p-6 sm:p-10 anim-slide-right">
            <h3 className="text-xl font-bold text-[#1e3a4c] mb-6 font-display">{t.contact.sendMessage}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[#1e3a4c]/60 text-xs font-bold mb-2 block uppercase tracking-wider">{t.contact.fullName}</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Your name" className="w-full h-12 bg-[#faf8f3] border border-[#2d8a9e]/15 rounded-2xl px-5 focus:outline-none focus:border-[#2d8a9e] text-sm font-medium text-[#1e3a4c] transition-all" />
                </div>
                <div>
                  <label className="text-[#1e3a4c]/60 text-xs font-bold mb-2 block uppercase tracking-wider">{t.contact.phone}</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+216 26 922 587" className="w-full h-12 bg-[#faf8f3] border border-[#2d8a9e]/15 rounded-2xl px-5 focus:outline-none focus:border-[#2d8a9e] text-sm font-medium text-[#1e3a4c] transition-all" />
                </div>
              </div>
              <div>
                <label className="text-[#1e3a4c]/60 text-xs font-bold mb-2 block uppercase tracking-wider">{t.contact.email}</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className="w-full h-12 bg-[#faf8f3] border border-[#2d8a9e]/15 rounded-2xl px-5 focus:outline-none focus:border-[#2d8a9e] text-sm font-medium text-[#1e3a4c] transition-all" />
              </div>
              <div>
                <label className="text-[#1e3a4c]/60 text-xs font-bold mb-2 block uppercase tracking-wider">{t.contact.subject}</label>
                <input name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?" className="w-full h-12 bg-[#faf8f3] border border-[#2d8a9e]/15 rounded-2xl px-5 focus:outline-none focus:border-[#2d8a9e] text-sm font-medium text-[#1e3a4c] transition-all" />
              </div>
              <div>
                <label className="text-[#1e3a4c]/60 text-xs font-bold mb-2 block uppercase tracking-wider">{t.contact.message}</label>
                <textarea name="message" value={form.message} onChange={handleChange} required rows={4} placeholder="Tell us about your dream day trip..." className="w-full bg-[#faf8f3] border border-[#2d8a9e]/15 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#2d8a9e] text-sm font-medium text-[#1e3a4c] resize-none transition-all" />
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full text-center text-sm sm:text-base disabled:opacity-60">
                {sending ? 'Sending...' : t.contact.sendMessageBtn}
              </button>
              {sent && <p className="text-green-600 text-sm font-semibold text-center bg-green-50 p-3 rounded-2xl">{t.contact.thankYou}</p>}
            </form>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">
            <div className="card p-5 sm:p-7 text-center anim-scale" style={{ animationDelay:'.1s' }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg,#1e5f74,#2d8a9e)' }}>
                📞
              </div>
              <h4 className="text-sm font-bold text-[#1e3a4c] mb-1 uppercase tracking-wider">{t.contact.phoneLabel}</h4>
              <a href="tel:+21626922587" className="text-[#2d8a9e] font-black text-lg hover:underline">+216 26 922 587</a>
              <p className="text-xs text-[#1e3a4c]/50 mt-1">{t.contact.available}</p>
            </div>

            <div className="card p-5 sm:p-7 text-center anim-scale" style={{ animationDelay:'.2s' }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg,#f0c27a,#e4893b)' }}>
                ✉️
              </div>
              <h4 className="text-sm font-bold text-[#1e3a4c] mb-1 uppercase tracking-wider">{t.contact.emailLabel}</h4>
              <a href="mailto:contact@bahritrip.tn" className="text-[#2d8a9e] font-black hover:underline">contact@bahritrip.tn</a>
              <p className="text-xs text-[#1e3a4c]/50 mt-1">{t.contact.replyWithin}</p>
            </div>

            <a href="https://instagram.com/bahritrip" target="_blank" rel="noopener noreferrer" className="card p-5 sm:p-7 text-center anim-scale hover:scale-[1.02] transition-transform" style={{ animationDelay:'.3s' }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg,#e1306c,#f77737)' }}>
                📸
              </div>
              <h4 className="text-sm font-bold text-[#1e3a4c] mb-1 uppercase tracking-wider">{t.contact.instagramLabel}</h4>
              <p className="text-[#2d8a9e] font-black hover:underline">@bahritrip</p>
              <p className="text-xs text-[#1e3a4c]/50 mt-1">{t.contact.followJourney}</p>
            </a>

            <div className="card p-5 sm:p-7 text-center anim-scale" style={{ animationDelay:'.4s' }}>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg,#1e5f74,#2d8a9e)' }}>
                📍
              </div>
              <h4 className="text-sm font-bold text-[#1e3a4c] mb-1 uppercase tracking-wider">{t.contact.locationLabel}</h4>
              <p className="text-[#1e3a4c] font-black">El Haouaria, Nabeul</p>
              <p className="text-xs text-[#1e3a4c]/50 mt-1">{t.contact.marinaPort}</p>
            </div>
          </div>
        </div>

        <div className="mt-16 sm:mt-20 text-center anim-fade-up">
          <div className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <img src="/logo.png" alt="BAHRI TRIP" className="h-8 w-auto object-contain" style={{ mixBlendMode: 'normal' }} />
            </div>
            <p className="text-[#1e3a4c]/40 text-xs sm:text-sm">
              {t.footer.rights.replace('{year}', String(new Date().getFullYear()))}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
