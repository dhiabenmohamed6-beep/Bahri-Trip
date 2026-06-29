'use client'

import { useState, useEffect, Suspense } from 'react'
import { DEFAULT_SERVICES, type Service } from '@/lib/services'
import { generateId } from '@/lib/reservations'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from '@/contexts/LanguageContext'

function BookingForm() {
  const { t } = useTranslation()
  const [services, setServices] = useState<Service[]>([])
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    date: '',
    time: '',
    people: 1,
    adults: 1,
    children: 0,
    under5: 0,
    hours: 1,
    message: '',
    payment: 'cash',
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const [submittedPrice, setSubmittedPrice] = useState(0)
  const [loadingServices, setLoadingServices] = useState(true)
  const [submitError, setSubmitError] = useState('')
  const searchParams = useSearchParams()

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
      } finally {
        setLoadingServices(false)
      }
    }
    loadServices()

    const interval = setInterval(loadServices, 30000)
    const serviceParam = searchParams.get('service')
    if (serviceParam) {
      setForm(f => ({ ...f, service: serviceParam }))
    }
    return () => clearInterval(interval)
  }, [searchParams])

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00']

  const selectedService = services.find(s => s.id === form.service)
  const isFullPack = selectedService?.id === 'full-pack'
  const totalPeople = isFullPack ? (form.adults || 0) + (form.children || 0) + (form.under5 || 0) : form.people
  const calculatedPrice = selectedService
    ? selectedService.hourly
      ? selectedService.basePrice * form.hours
      : selectedService.perPerson
        ? isFullPack
          ? (form.adults || 0) * 100 + (form.children || 0) * 70 + (form.under5 || 0) * 0
          : selectedService.basePrice * form.people
        : selectedService.basePrice
    : 0

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setSubmitError('')
    setForm(f => ({ ...f, [name]: (name === 'people' || name === 'hours' || name === 'adults' || name === 'children' || name === 'under5') ? Number(value) : value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    if (!selectedService) {
      setSubmitError('Please select a service to continue.')
      return
    }

    const normalizedPeople = isFullPack
      ? (form.adults || 0) + (form.children || 0) + (form.under5 || 0)
      : form.people

    const reservation = {
      ...form,
      people: normalizedPeople,
      id: generateId(),
      createdAt: new Date().toISOString(),
      serviceLabel: selectedService.title,
      total: calculatedPrice,
      status: 'pending',
      adminNote: '',
      discount: 0,
    }

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => 'Unknown error')
        throw new Error(text || `Server responded with ${res.status}`)
      }

      setSubmittedPrice(calculatedPrice)
      setForm({ ...form, name: '', phone: '', email: '', message: '' })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    } catch (err: any) {
      setSubmitError(err?.message || 'Booking failed. Please try again or call us directly.')
    }
  }

  return (
    <section id="booking" className="relative py-20 sm:py-28 overflow-hidden" style={{ background: 'linear-gradient(180deg, #1e3a4c 0%, #0d2b3e 100%)' }}>
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#2d8a9e]/20 rounded-full blur-3xl drift" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#f0c27a]/15 rounded-full blur-3xl drift" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#7dd3d0]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-12 sm:mb-16 anim-fade-up">
          <p className="uppercase tracking-[5px] text-[#f0c27a] text-xs font-bold mb-3">Bienvenue à Bahri Trip</p>
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black text-white mb-4 font-display">
            {t.booking.title}
          </h2>
          <p className="text-white/70 text-sm sm:text-lg max-w-2xl mx-auto">
            {t.booking.subtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative bg-white/[0.06] backdrop-blur-2xl rounded-[32px] p-6 sm:p-10 border border-white/10 shadow-2xl anim-scale">
            <div className="mb-8">
              <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#2d8a9e] flex items-center justify-center text-sm">1</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className="md:col-span-2">
                  <label className="text-[#f0c27a] text-xs font-bold mb-2 block uppercase tracking-wider">Full Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full h-14 bg-white/20 border border-white/25 text-white placeholder-white/60 rounded-2xl px-6 focus:outline-none focus:border-[#2d8a9e] focus:bg-white/25 text-base font-medium transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#f0c27a] text-xs font-bold mb-2 block uppercase tracking-wider">Phone Number *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+216 26 922 587"
                    className="w-full h-14 bg-white/20 border border-white/25 text-white placeholder-white/60 rounded-2xl px-6 focus:outline-none focus:border-[#2d8a9e] focus:bg-white/25 text-base font-medium transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#f0c27a] text-xs font-bold mb-2 block uppercase tracking-wider">Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full h-14 bg-white/20 border border-white/25 text-white placeholder-white/60 rounded-2xl px-6 focus:outline-none focus:border-[#2d8a9e] focus:bg-white/25 text-base font-medium transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#f0c27a] text-[#1e3a4c] flex items-center justify-center text-sm font-black">2</span>
                Booking Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="text-[#f0c27a] text-xs font-bold mb-2 block uppercase tracking-wider">{t.booking.selectService}</label>
                  <select
                    name="service"
                    value={form.service}
                    onChange={handleChange}
                    className="w-full h-14 bg-white/20 border border-white/25 text-white rounded-2xl px-6 focus:outline-none focus:border-[#2d8a9e] focus:bg-white/25 text-base font-medium transition-all appearance-none"
                    required
                  >
                    <option value="" className="bg-[#1e3a4c]">Choose your experience...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id} className="bg-[#1e3a4c]">{s.title} - {s.price}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[#f0c27a] text-xs font-bold mb-2 block uppercase tracking-wider">{t.booking.date}</label>
                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-14 bg-white/20 border border-white/25 text-white rounded-2xl px-6 focus:outline-none focus:border-[#2d8a9e] focus:bg-white/25 text-base font-medium transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#f0c27a] text-xs font-bold mb-2 block uppercase tracking-wider">{t.booking.time}</label>
                  <select
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    className="w-full h-14 bg-white/20 border border-white/25 text-white rounded-2xl px-6 focus:outline-none focus:border-[#2d8a9e] focus:bg-white/25 text-base font-medium transition-all appearance-none"
                    required
                  >
                    <option value="" className="bg-[#1e3a4c]">Select time</option>
                    {timeSlots.map(t => (
                      <option key={t} value={t} className="bg-[#1e3a4c]">{t}</option>
                    ))}
                  </select>
                </div>

                <div className={isFullPack ? 'md:col-span-2' : ''}>
                  <label className="text-[#f0c27a] text-xs font-bold mb-2 block uppercase tracking-wider">
                    {isFullPack ? t.booking.guests : 'Number of People'}
                  </label>
                  {isFullPack ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-white/50 text-[10px] font-bold mb-1 block uppercase tracking-wider">{t.booking.adults}</label>
                        <input
                          name="adults"
                          type="number"
                          min={1}
                          max={20}
                          value={form.adults}
                          onChange={handleChange}
                          placeholder="Adults"
                          className="w-full h-14 bg-white/20 border border-white/25 text-white placeholder-white/60 rounded-2xl px-4 focus:outline-none focus:border-[#2d8a9e] focus:bg-white/25 text-base font-medium transition-all"
                          required
                        />
                        <p className="text-[10px] text-white/40 mt-1">100 {t.common.currency} each</p>
                      </div>
                      <div>
                        <label className="text-white/50 text-[10px] font-bold mb-1 block uppercase tracking-wider">{t.booking.children}</label>
                        <input
                          name="children"
                          type="number"
                          min={0}
                          max={20}
                          value={form.children}
                          onChange={handleChange}
                          placeholder="Children"
                          className="w-full h-14 bg-white/20 border border-white/25 text-white placeholder-white/60 rounded-2xl px-4 focus:outline-none focus:border-[#2d8a9e] focus:bg-white/25 text-base font-medium transition-all"
                        />
                        <p className="text-[10px] text-white/40 mt-1">70 {t.common.currency} each</p>
                      </div>
                      <div>
                        <label className="text-white/50 text-[10px] font-bold mb-1 block uppercase tracking-wider">{t.booking.under5}</label>
                        <input
                          name="under5"
                          type="number"
                          min={0}
                          max={20}
                          value={form.under5}
                          onChange={handleChange}
                          placeholder="Under 5"
                          className="w-full h-14 bg-white/20 border border-white/25 text-white placeholder-white/60 rounded-2xl px-4 focus:outline-none focus:border-[#2d8a9e] focus:bg-white/25 text-base font-medium transition-all"
                        />
                        <p className="text-[10px] text-white/40 mt-1">Free</p>
                      </div>
                    </div>
                  ) : selectedService?.perPerson ? (
                    <input
                      name="people"
                      type="number"
                      min={selectedService?.minPeople || 1}
                      max={20}
                      value={form.people}
                      onChange={handleChange}
                      placeholder={`How many people? (min ${selectedService?.minPeople || 1})`}
                      className="w-full h-14 bg-white/20 border border-white/25 text-white placeholder-white/60 rounded-2xl px-6 focus:outline-none focus:border-[#2d8a9e] focus:bg-white/25 text-base font-medium transition-all"
                    />
                  ) : null}

                  {isFullPack && (
                    <div className="md:col-span-2 mt-2 p-5 rounded-2xl border border-[#f0c27a]/30 bg-[#f0c27a]/10">
                      <p className="text-[#f0c27a] text-xs font-bold mb-3 uppercase tracking-wider">📅 Full Day Program</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/70 leading-relaxed">
                        <div>
                          <p className="text-white/90 font-bold mb-1">⛵ 10:00 AM — Departure from Port</p>
                          <p>Meet at the marina and set sail for an unforgettable day on the Mediterranean.</p>
                        </div>
                        <div>
                          <p className="text-white/90 font-bold mb-1">🐟 11:30 AM — Tasting Session</p>
                          <p>Grilled sardines, traditional hrissa arbi, extra virgin olive oil, and tabouna bread on the beach.</p>
                        </div>
                        <div>
                          <p className="text-white/90 font-bold mb-1">💦 12:30 PM — Swim & Relax</p>
                          <p>Crystal-clear turquoise waters, private cove with beach umbrellas, bean bags, dining tables, and chill-out areas. Sea caves visit on the way depending on weather.</p>
                        </div>
                        <div>
                          <p className="text-white/90 font-bold mb-1">🍽️ 1:00 PM — Lunch on the Beach</p>
                          <p>Grilled Royal Sea Bream BBQ, Seafood Pasta, Mechouia Salad, Tunisian Salad, plus water and seasonal dessert.</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-white/90 font-bold mb-1">🌅 5:30–6:00 PM — Return</p>
                          <p>Head back to the port with memories of a perfect day.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-[#f0c27a] text-xs font-bold mb-2 block uppercase tracking-wider">{t.booking.payment}</label>
                  <select
                    name="payment"
                    value={form.payment}
                    onChange={handleChange}
                    className="w-full h-14 bg-white/20 border border-white/25 text-white rounded-2xl px-6 focus:outline-none focus:border-[#2d8a9e] focus:bg-white/25 text-base font-medium transition-all appearance-none"
                  >
                    <option value="cash" className="bg-[#1e3a4c]">{t.booking.cash}</option>
                    <option value="transfer" className="bg-[#1e3a4c]">{t.booking.transfer}</option>
                    <option value="edinar" className="bg-[#1e3a4c]">{t.booking.edinar}</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[#f0c27a] text-xs font-bold mb-2 block uppercase tracking-wider">{t.booking.specialRequests}</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Any special needs or celebrations?"
                    rows={3}
                    className="w-full h-32 bg-white/15 border border-white/25 text-white placeholder-white/60 rounded-2xl px-6 py-4 focus:outline-none focus:border-[#2d8a9e] focus:bg-white/20 resize-none text-base transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 p-6 bg-[#2d8a9e]/20 rounded-3xl border border-[#2d8a9e]/30">
              <div>
                <p className="text-[#7dd3d0] text-xs uppercase tracking-widest mb-1 font-bold">{t.booking.totalPrice}</p>
                <p className="text-white text-4xl font-black font-display">{calculatedPrice} <span className="text-xl text-white/60">DT</span></p>
                {selectedService && (
                  <div className="mt-2">
                    {isFullPack ? (
                      <div className="flex flex-wrap gap-3 text-xs text-white/60">
                        {form.adults > 0 && <span>Adults × {form.adults} = {(form.adults || 0) * 100} DT</span>}
                        {form.children > 0 && <span>Children × {form.children} = {(form.children || 0) * 70} DT</span>}
                        {form.under5 > 0 && <span>Under 5 × {form.under5} = 0 DT</span>}
                      </div>
                    ) : (
                      <p className="text-white/50 text-sm mt-1">
                        {selectedService.perPerson && `× ${form.people} person${form.people > 1 ? 's' : ''}`}
                        {selectedService.hourly && `× ${form.hours} hour${form.hours > 1 ? 's' : ''}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {selectedService && (
                <div className="text-right mt-3 sm:mt-0">
                  <p className="text-white/40 text-xs">{selectedService.title}</p>
                  <p className="text-[#f0c27a] font-bold">{selectedService.price}</p>
                </div>
              )}
            </div>

            {submitError && (
              <div className="mb-4 p-4 rounded-2xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
                {submitError}
              </div>
            )}
            <button
              type="submit"
              disabled={loadingServices || !selectedService}
              className="w-full h-14 rounded-2xl font-black text-white text-lg transition-all hover:scale-[1.02] active:scale-[.98] shadow-lg shadow-[#2d8a9e]/30 hover:shadow-xl hover:shadow-[#2d8a9e]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg,#1e5f74,#2d8a9e)' }}
            >
              {loadingServices ? 'Loading services...' : !selectedService ? 'Please select a service' : t.booking.confirmBooking}
            </button>
          </form>

          {showSuccess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
              <div className="bg-white rounded-3xl p-10 text-center max-w-md w-full shadow-2xl transform anim-scale">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg,#1e5f74,#2d8a9e)' }}>
                  <span className="text-4xl text-white">✓</span>
                </div>
                <h3 className="text-3xl font-black text-[#1e3a4c] mb-3 font-display">{t.booking.bookingConfirmed}</h3>
                <p className="text-[#1e3a4c]/60 mb-2">Total: <strong className="text-[#2d8a9e]">{submittedPrice} DT</strong></p>
                <p className="text-[#1e3a4c]/50 text-sm">{t.booking.weWillContact}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" className="w-full h-10 sm:h-16 block fill-[#faf8f3]">
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  )
}

export default function Booking() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-white" style={{ background: 'linear-gradient(180deg, #1e3a4c 0%, #0d2b3e 100%)' }}>Loading booking form...</div>}>
      <BookingForm />
    </Suspense>
  )
}
