import type { Metadata } from 'next'
import './globals.css'
import { WhatsAppFloat } from '@/features/shop/components/WhatsAppFloat'

const SITE_NAME = 'Seismiles Textil'
const SITE_DESCRIPTION = 'Indumentaria urbana premium nacida en la Ruta de los Seismiles, Catamarca. Remeras de algodon, pique superior y buzos canguro super premium. Calidad forjada a 6000 metros de altura.'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://seismilestextil.com'),
  title: {
    default: `${SITE_NAME} | Indumentaria Premium - Catamarca, Argentina`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ['ropa catamarca', 'indumentaria premium', 'remeras pique', 'buzos canguro', 'seismiles textil', 'ropa urbana argentina'],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  )
}
