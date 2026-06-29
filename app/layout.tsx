import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'

export const metadata = {
  title: 'BAHRI TRIP',
  description: 'Unforgettable Day Experiences in El Haouaria, Tunisia',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5" />
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
