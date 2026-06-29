export interface Service {
  id: string
  title: string
  desc: string
  price: string
  basePrice: number
  per: string
  img: string
  perPerson: boolean
  hourly: boolean
  visible: boolean
  hasFood?: boolean
  minPeople?: number
}

export const DEFAULT_SERVICES: Service[] = [
   { id:'full-pack',   title:'Full Pack - Complete Day Trip', desc:'Welcome to Bahri Trip! Experience an unforgettable day in El Haouaria: departure at 10:00 AM, sea caves visit, private cove relaxation, grilled sardines tasting, hrissa arbi, olive oil, tabouna bread, swimming in crystal-clear turquoise waters, lunch with grilled sea bream BBQ, seafood pasta, mechouia & Tunisian salads, water and seasonal dessert. Return 5:30-6:00 PM.',                                                                                                                               price:'100 DT', basePrice:100, per:'per person', img:'/pack.jpg', perPerson:true, hourly:false, visible:true },
   { id:'boat-full',   title:'Full Day Boat Tour',           desc:'A full day private boat tour around El Haouaria coastline. Explore hidden coves, enjoy swimming stops, relax on the boat with sea views, and experience the Mediterranean at your own pace. Perfect for groups and families seeking a complete maritime adventure.',                                                                                                                               price:'700 DT',  basePrice:700,  per:'full day',    img:'/privee.jpg', perPerson:true, hourly:false, visible:true },
   { id:'boat-30min',  title:'30 Min Boat Tour',             desc:'A quick 30-minute boat tour around El Haouaria bay. Enjoy the sea breeze, beautiful coastal views, and a taste of the Mediterranean. Minimum 5 people required per booking.',                                                                                                                                                                                                             price:'40 DT',   basePrice:40,   per:'per person',  img:'/balade.jpg', perPerson:true, hourly:false, visible:true, minPeople:5 },
 ]

const KEY = 'aqua_services'

export function getServices(): Service[] {
  if (typeof window === 'undefined') return DEFAULT_SERVICES
  try {
    const s = localStorage.getItem(KEY)
    return s ? JSON.parse(s) : DEFAULT_SERVICES
  } catch { return DEFAULT_SERVICES }
}

export function saveServices(services: Service[]): void {
  localStorage.setItem(KEY, JSON.stringify(services))
}

export function generateServiceId(): string {
  return 'svc-' + Date.now().toString(36)
}
