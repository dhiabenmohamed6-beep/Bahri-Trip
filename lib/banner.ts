export interface BannerSettings {
  imageUrl: string
  phoneImageUrl: string
  title: string
  subtitle: string
  description: string
  btnPrimary: string
  btnSecondary: string
  phoneTitle: string
  phoneSubtitle: string
  phoneDescription: string
  phoneBtnPrimary: string
  phoneBtnSecondary: string
}

export const DEFAULT_BANNER: BannerSettings = {
   imageUrl:     '/bunner.png',
   phoneImageUrl: '',
   title:        'Discover',
   subtitle:     'El Haouaria',
   description:  'An unforgettable day in El Haouaria with grilled sardines, crystal-clear turquoise waters, private cove relaxation, and authentic Tunisian flavors.',
   btnPrimary:   'Book Now',
   btnSecondary: 'Our Day Trip',
   phoneTitle: '',
   phoneSubtitle: '',
   phoneDescription: '',
   phoneBtnPrimary: '',
   phoneBtnSecondary: '',
  }

const KEY = 'aqua_banner'

export function getBanner(): BannerSettings {
  if (typeof window === 'undefined') return DEFAULT_BANNER
  try {
    const s = localStorage.getItem(KEY)
    return s ? { ...DEFAULT_BANNER, ...JSON.parse(s) } : DEFAULT_BANNER
  } catch { return DEFAULT_BANNER }
}

export function saveBanner(b: BannerSettings): void {
  localStorage.setItem(KEY, JSON.stringify(b))
}
