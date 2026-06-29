'use client'

import { useTranslation } from '@/contexts/LanguageContext'

export default function Program() {
  const { t } = useTranslation()

  return (
    <section id="about" className="relative py-20 sm:py-28 bg-white overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#2d8a9e]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 drift" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#f0c27a]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 drift" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-12 sm:mb-16 anim-fade-up">
          <p className="uppercase tracking-[5px] text-[#2d8a9e] text-xs font-bold mb-3">{t.program.pricesTitle}</p>
          <h2 className="text-[clamp(2rem,5vw,5rem)] font-black text-[#1e3a4c] font-display leading-tight" dangerouslySetInnerHTML={{ __html: t.program.title }} />
          <p className="text-[#1e3a4c]/60 text-sm sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed">
            {t.program.subtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4 sm:space-y-0">
            {[
              { emoji: '⛵', time: '10:00 AM', title: t.program.departure, desc: t.program.departureDesc },
              { emoji: '🐟', time: '11:30 AM', title: t.program.tasting, desc: t.program.tastingDesc },
              { emoji: '💦', time: '12:30 PM', title: t.program.swim, desc: t.program.swimDesc },
              { emoji: '🍽️', time: '1:00 PM', title: t.program.lunch, desc: t.program.lunchDesc },
              { emoji: '🌅', time: '5:30–6:00 PM', title: t.program.return, desc: t.program.returnDesc },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 sm:gap-6 anim-slide-right" style={{ animationDelay: `${i * .1}s` }}>
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-lg border border-[#2d8a9e]/10 flex items-center justify-center text-2xl shrink-0 float" style={{ animationDelay: `${i * .5}s` }}>
                    {item.emoji}
                  </div>
                  {i < 4 && (
                    <div className="w-0.5 h-full bg-gradient-to-b from-[#2d8a9e]/20 to-transparent my-2" />
                  )}
                </div>
                <div className="card p-4 sm:p-6 flex-1 mb-2 sm:mb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                    <h4 className="font-bold text-[#1e3a4c] font-display text-base sm:text-lg">{item.title}</h4>
                    <span className="text-[10px] sm:text-xs font-bold text-white bg-[#2d8a9e] px-3 py-1 rounded-full w-fit">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-[#1e3a4c]/60 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 sm:mt-16 card p-5 sm:p-8 max-w-3xl mx-auto anim-fade-up" style={{ background: 'linear-gradient(135deg, #f0f7f4, #e8f4ef)' }}>
          <h3 className="text-lg font-bold text-[#1e3a4c] mb-4 font-display text-center">{t.program.pricesTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-black text-[#2d8a9e] font-display">100 {t.common.currency}</p>
              <p className="text-xs text-[#1e3a4c]/60 font-semibold">{t.common.adults}</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#f0c27a] font-display">70 {t.common.currency}</p>
              <p className="text-xs text-[#1e3a4c]/60 font-semibold">{t.common.children} (5-11)</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#1e3a4c] font-display">Free</p>
              <p className="text-xs text-[#1e3a4c]/60 font-semibold">{t.common.under5}</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-[#1e3a4c]/70 font-medium">{t.program.reservations}: <a href="tel:+21626922587" className="text-[#2d8a9e] font-bold hover:underline">+216 26 922 587</a></p>
          </div>
        </div>
      </div>
    </section>
  )
}
