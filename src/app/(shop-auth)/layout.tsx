import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function ShopAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Brand panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <Image
          src="/images/paso de san francisco - quebrada de las angosturas.jpg"
          alt="Paisaje andino - Paso de San Francisco"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-volcanic-900/60" />

        {/* Brand content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/">
            <Image
              src="/images/logo-seismiles-v2.png"
              alt="SEISMILES"
              width={160}
              height={68}
              className="h-12 w-auto brightness-0 invert"
            />
          </Link>

          <div className="max-w-md">
            <p className="font-heading text-display-sm text-white leading-tight mb-4">
              Indumentaria de autor nacida a 6.000 metros de altura
            </p>
            <p className="text-body-md text-white/70 leading-relaxed">
              Diseño premium inspirado en la cordillera de los Andes. Cada prenda lleva la autenticidad y la fuerza de nuestra tierra.
            </p>
          </div>

          <p className="text-body-xs text-white/40">
            SEISMILES &mdash; San Fernando del Valle de Catamarca
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="py-6 px-6 lg:hidden">
          <Link href="/">
            <Image
              src="/images/logo-seismiles-v2.png"
              alt="SEISMILES"
              width={140}
              height={60}
              className="h-10 w-auto brightness-[0.35] contrast-[1.1]"
              priority
            />
          </Link>
        </header>

        {/* Form area */}
        <main className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
