'use client'

import { useState, useEffect } from 'react'
import { DEFAULT_SERVICES, type Service } from '@/lib/services'
import { useTranslation } from '@/contexts/LanguageContext'

const WORKING_HOURS: Record<string, string> = {
  en: 'Daily trips depart at 10:00 AM and return between 5:30 PM and 6:00 PM. Customer support is available 08:00-20:00 daily.',
  fr: 'Les départs sont à 10h00 et le retour entre 17h30 et 18h00. Le service client est disponible de 08h00 à 20h00 tous les jours.',
  ar: 'الرحلات تنطلق الساعة 10:00 صباحاً وتعود بين 5:30 و 6:00 مساءً. خدمة العملاء متاحة من 8:00 إلى 20:00 يومياً.',
  de: 'Tägliche Ausflüge starten um 10:00 Uhr und kehren zwischen 17:30 und 18:00 Uhr zurück. Kundenservice täglich von 08:00-20:00 Uhr verfügbar.',
}

const SERVICE_ALIASES: Record<string, string[]> = {
  'full-pack': ['full pack', 'pack complet', 'complete day', 'full pack complet', 'day trip', 'sardines', 'lunch', 'beach', 'coves', 'grilled', 'salads', 'pasta', 'pack'],
  'boat-full':   ['boat full', 'full day boat', 'boat tour full', 'day boat', 'private boat', 'boat full day', '700', 'excursion privee', 'excursion privée'],
  'boat-30min':  ['boat 30', '30 min boat', 'short boat', 'mini boat', 'quick boat', '40 dt', 'min 5', 'balade en mer', 'balade'],
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]/g, ' ')
    .trim()
}

function formatService(service: Service, lang: string): string {
  const priceLabel = lang === 'ar' ? 'د.ت' : lang === 'fr' ? 'DT' : lang === 'de' ? 'DT' : 'DT'
  const details = [
    `${service.title} - ${service.price}`,
    service.desc,
  ]

  if (service.id === 'full-pack') {
    details.push('Pack Complet: Welcome to Bahri Trip! Experience an unforgettable day in El Haouaria! Departure at 10:00 AM from the port, visit to the sea caves, relax in our private cove with beach umbrellas, bean bags, dining tables, and chill-out areas. From 11:30 AM: tasting of grilled sardines, traditional hrissa arbi, extra virgin olive oil, and tabouna bread. Swim in crystal-clear turquoise waters. Lunch around 1:00 PM: Grilled Royal Sea Bream BBQ, Seafood Pasta, Mechouia Salad, Tunisian Salad, water and seasonal dessert. Return between 5:30 PM and 6:00 PM. Prices: Adults 100 TND, Children (5-11 years) 70 TND, Under 5 years: Free.')
  } else if (service.id === 'boat-full') {
    details.push('A full-day private boat tour around El Haouaria coastline. Explore hidden coves, enjoy swimming stops, and experience the Mediterranean at your own pace.')
  } else if (service.id === 'boat-30min') {
    details.push('A quick 30-minute boat tour around El Haouaria bay. Minimum 5 people required.')
  } else {
    details.push('Available during regular tour hours.')
  }

  return details.join('\n')
}

function listServices(services: Service[]): string {
  const visible = services.length > 0 ? services : DEFAULT_SERVICES.filter(s => s.visible)
  let list = 'Our experiences:\n'
  if (visible.length > 0) {
    list += visible.map((service, index) => `${index + 1}. ${service.title} - ${service.price} ${service.per}`).join('\n') + '\n'
  }
  list += '\nOther available services:\n'
  list += '- Pack Complet: Adults 100 TND, Children (5-11) 70 TND, Under 5 Free\n'
  list += '- Excursion Privée: 300 TND per hour\n'
  list += '- Balade en Mer: 35 TND per person (minimum 5 people)\n\n'
  list += 'Ask me for details about any service!'
  return list
}

function matchesService(service: Service, question: string): boolean {
  const aliases = SERVICE_ALIASES[service.id] ?? []
  const searchable = normalize([service.id, service.title, service.desc, service.price, service.per, ...aliases].join(' '))
  return aliases.some(alias => question.includes(normalize(alias))) || question.includes(normalize(service.title)) || question.includes(service.id) || searchable.split(' ').some(word => word.length > 4 && question.includes(word))
}

function findService(question: string, services: Service[]): Service | undefined {
  const visible = services.length > 0 ? services : DEFAULT_SERVICES.filter(s => s.visible)
  return visible.find(service => matchesService(service, question))
}

function getResponse(question: string, services: Service[], lang: string): string {
  const lower = normalize(question)

  // Hardcoded responses for specific services
  if (['pack', 'pack complet', 'full pack', 'complete day'].some(k => lower.includes(k))) {
    return 'Pack Complet - Experience an unforgettable day in El Haouaria!\n\n📅 Day Program:\n• Departure at 10:00 AM from the port ⛵\n• Visit to the sea caves (on the way out or back, depending on the weather)\n• Relax in our private cove with beach umbrellas 🏖️, comfortable bean bags, dining tables 🍽️, and chill-out areas\n• From 11:30 AM: Enjoy a tasting of grilled sardines 🐟, traditional hrissa arbi 🌶️, extra virgin olive oil 🫒, and tabouna bread 🍞\n• Swim and unwind in the crystal-clear turquoise waters 💦\n\n🍽️ Lunch (around 1:00 PM):\n• Grilled Royal Sea Bream BBQ 🐟\n• Seafood Pasta 🦐\n• Mechouia Salad 🥗\n• Tunisian Salad 🥗\n• Water and seasonal dessert included 🍉\n\n✨ Enjoy a paradise-like day surrounded by the sea, sunshine, and authentic Tunisian flavors.\n⏱️ Return: Between 5:30 PM and 6:00 PM\n💰 Prices:\n• Adults: 100 TND\n• Children (5–11 years): 70 TND\n• Under 5 years: Free'
  }

  if (['excursion privee', 'excursion privée', 'private tour', 'excursion'].some(k => lower.includes(k))) {
    return 'Excursion Privée: 300 TND per hour. A private boat tour for up to 4 people. Explore the beautiful coastline of El Haouaria at your own pace with a dedicated captain. Includes swimming stops and snorkeling equipment. Available daily from 09:00 to 17:00.'
  }

  if (['balade en mer', 'balade', 'sea walk', 'boat ride', 'sea stroll'].some(k => lower.includes(k))) {
    return 'Balade en Mer: 35 TND per person. Minimum 5 people required per booking. A relaxing sea stroll along the Tunisian coastline. Perfect for families and couples. Duration: approximately 1 hour. Departures from 09:00 to 13:00. Includes safety equipment and a bottle of water.'
  }

  const service = findService(lower, services)

  if (service) {
    const answer = formatService(service, lang)
    if (/(time|times|hour|hours|duration|how long|open|schedule|horaires|horaire|heure|ouvert|dispo|disponible|available|when|quand|duree|durée|combien de temps|working|depart|return)/.test(lower)) {
      return answer + '\n\nWorking time: ' + (WORKING_HOURS[lang] || WORKING_HOURS['en'])
    }
    return answer
  }

  if (/(working|hours|hour|duration|how long|open|schedule|horaires|horaire|heure|ouvert|dispo|disponible|available|time|times|when|quand|duree|durée|combien de temps|daily|depart|return)/.test(lower)) {
    return WORKING_HOURS[lang] || WORKING_HOURS['en']
  }

  if (/(all services|services|offer|options|activities|what do you have|choisir|activité|prestation|service)/.test(lower)) {
    return listServices(services)
  }

  if (/(price|prices|cost|tarif|prix|dt|dinar|payment|pay|cash|bank|e-dinar)/.test(lower)) {
    return 'Prices:\n- Pack Complet: Adults 100 TND, Children (5-11) 70 TND, Under 5 Free\n- Excursion Privée: 300 TND per hour\n- Balade en Mer: 35 TND per person (minimum 5 people)\n- Full Day Boat Tour: 700 DT full day\nPayment options: Cash, Bank Transfer, E-Dinar.'
  }

  if (/(food|meal|snack|lunch|repas|manger|déjeuner|dejeuner|sardines|seabream|pasta|salad)/.test(lower)) {
    return 'Our Full Pack includes grilled sardines tasting, hrissa arbi, olive oil, tabouna bread for breakfast-style tasting, plus grilled sea bream BBQ with seafood pasta, mechouia & Tunisian salads for lunch. Water and seasonal dessert included.'
  }

  if (/(book|reserve|booking|reservation|réserver|reserver|disponible|availability)/.test(lower)) {
    return 'You can book with the form on the site. We usually respond within hours. For immediate booking, call +216 26 922 587 or WhatsApp +216 26 922 587.'
  }

  if (/(group|family|couple|friends|party|capacity|people|personnes|groupe)/.test(lower)) {
    return 'The Pack Complet is perfect for families, couples, and groups. The Excursion Privée is great for private groups (up to 4 people). The Balade en Mer works well for groups of 5 or more. For larger groups, contact us directly.'
  }

  if (/(location|where|address|el haouaria|nabeul|tunisia|marina|port|lieu|adresse)/.test(lower)) {
    return 'Located in El Haouaria, Nabeul, Tunisia on the Mediterranean Sea. We meet at the main marina at 10:00 AM for departure and return between 5:30-6:00 PM.'
  }

  if (/(children|kids|child|baby|infant|age)/.test(lower)) {
    return 'Children ages 5-11: 70 DT. Under 5 years: Free. Kids enjoy the same day program with kid-friendly portions and safe areas at our private cove.'
  }

  if (/(contact|phone|email|whatsapp|call|telephone|tel|instagram)/.test(lower)) {
    return 'Call or WhatsApp +216 26 922 587, email contact@bahritrip.tn, or find us on Instagram @bahritrip. Customer support is available 08:00-20:00 daily.'
  }

  if (/(safety|life jacket|equipment|secure|safe|security|gilet|securite|sécurité)/.test(lower)) {
    return 'Your safety is our priority. Life jackets are provided for all activities, and our team is trained in first aid. The private cove has safe swimming areas for all ages.'
  }

  if (/(bring|towel|sunscreen|clothes|swimwear|water|apporter|serviette|crème|creme)/.test(lower)) {
    return 'Bring swimwear, a towel, sunscreen, and water. We provide all safety equipment, meals, and refreshments for the day.'
  }

  if (/(cancellation|refund|change|modify|annuler|remboursement|modifier)/.test(lower)) {
    return 'Free cancellation up to 24 hours before your trip. Contact us by phone or WhatsApp if you need to modify your booking.'
  }

  if (/(hello|hi|hey|greetings|good morning|good evening|bonjour|salut|salam)/.test(lower)) {
    return "Hello! I'm BAHRI ASK. Ask me about our day trips to El Haouaria, prices, the day program, booking, or departure times."
  }

  if (/(thank|thanks|appreciate|merci|shukran)/.test(lower)) {
    return "You're welcome! Need more help? Ask about any trip, price, the day program, booking, or departure time."
  }

  return 'I can answer questions about our day trips, prices, the day program, booking, and departure times. Ask me, for example, "What is included in the day trip?" or "What time do you depart?"'
}

export default function AquaAskChat() {
  const { t, language } = useTranslation()
  const [open, setOpen] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: t.chat.greeting, fromUser: false }
  ])
  const [input, setInput] = useState('')

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services?cache=' + Date.now())
        const data = await res.json()
        setServices(data.filter((service: Service) => service.visible))
      } catch {
        setServices(DEFAULT_SERVICES.filter(service => service.visible))
      }
    }

    loadServices()
    const interval = setInterval(loadServices, 30000)
    return () => clearInterval(interval)
  }, [])

  async function handleSend() {
    if (!input.trim()) return

    const userMsg = { id: Date.now().toString(), text: input, fromUser: true }
    const response = getResponse(input, services, language)
    const botMsg = { id: (Date.now() + 1).toString(), text: response, fromUser: false }

    setMessages(prev => [...prev, userMsg, botMsg])
    setInput('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-2xl"
        style={{ background: 'linear-gradient(135deg,#1e5f74,#2d8a9e)' }}
        aria-label="Open chat"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[520px] border border-white/20" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
          <div className="p-5 flex items-center justify-between" style={{ background: 'linear-gradient(135deg,#1e3a4c,#0d2b3e)' }}>
            <div>
              <p className="text-white font-black text-lg font-display">{t.chat.title}</p>
              <p className="text-white/50 text-xs">{t.chat.subtitle}</p>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-[#faf8f3]" style={{ maxHeight: '320px' }}>
            <div className="flex flex-col gap-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.fromUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.fromUser
                      ? 'text-white rounded-br-sm'
                      : 'text-[#1e3a4c] border border-[#2d8a9e]/10 rounded-bl-sm bg-white shadow-sm'
                  }`} style={msg.fromUser ? { background: 'linear-gradient(135deg,#1e5f74,#2d8a9e)' } : {}}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 border-t bg-white flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder={t.chat.placeholder}
              className="flex-1 px-4 py-3 rounded-xl border border-[#2d8a9e]/15 focus:outline-none focus:border-[#2d8a9e] text-sm bg-white text-[#1e3a4c]"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg,#1e5f74,#2d8a9e)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

interface ChatMessage {
  id: string
  text: string
  fromUser: boolean
}
