import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'
import { ChatBot } from '@/features/shop/components/ChatBot'
import { ViewTransitions } from '@/features/shop/components/ViewTransitions'
import { CartSyncProvider } from '@/features/shop/components/CartSyncProvider'
import { MetaPixel } from '@/features/analytics/components/MetaPixel'
import { MetaPixelPageView } from '@/features/analytics/components/MetaPixelPageView'

const SITE_NAME = 'SEISMILES'
const SITE_DESCRIPTION = 'Indumentaria urbana premium nacida en la Ruta de los SEISMILES, Catamarca. Remeras de algodón, pique superior y buzos canguro super premium. Calidad forjada a 6000 metros de altura.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.seismilestextil.com.ar'),
  verification: {
    google: '-GF1fuZ1RmZEyq5wwNz8aY-5Hd0yuLzUCzYfg8guZ8c',
  },
  title: {
    default: `${SITE_NAME} | Indumentaria Premium - Catamarca, Argentina`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['ropa catamarca', 'indumentaria premium', 'remeras pique', 'buzos canguro', 'seismiles', 'ropa urbana argentina'],
  openGraph: {
    title: `${SITE_NAME} | Indumentaria Premium - Catamarca, Argentina`,
    description: SITE_DESCRIPTION,
    locale: 'es_AR',
    siteName: SITE_NAME,
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <MetaPixel />
        <Suspense fallback={null}>
          <MetaPixelPageView />
        </Suspense>
        <ViewTransitions>
          {children}
        </ViewTransitions>
        <CartSyncProvider />
        <ChatBot />
      </body>
    </html>
  )
}
