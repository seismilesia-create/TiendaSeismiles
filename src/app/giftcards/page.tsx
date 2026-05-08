import type { Metadata } from 'next'
import { shopConfig } from '@/features/shop/config'
import { MarqueeBanner, Navbar, Footer, ScrollReveal } from '@/features/shop/components'
import { getProductLines } from '@/features/shop/services/product-lines'
import { getActiveGiftCardDefinitions } from '@/features/shop/services/admin-gift-cards'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { GiftCardGrid } from './GiftCardGrid'

export const metadata: Metadata = {
  title: 'Gift Cards',
  description: 'Regala calidad SEISMILES. Tarjetas de regalo con distintos montos para que elijan lo que mas les guste.',
  alternates: { canonical: '/giftcards' },
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export default async function GiftCardsPage() {
  const { giftCards } = shopConfig
  const [productLines, supabase, cardDefs] = await Promise.all([
    getProductLines(),
    createClient(),
    getActiveGiftCardDefinitions(),
  ])
  const { data: { user } } = await supabase.auth.getUser()
  let navUser: { email: string; role: string } | null = null
  if (user) {
    const service = createServiceClient()
    const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single()
    navUser = { email: user.email ?? '', role: profile?.role ?? 'customer' }
  }

  return (
    <>
      <MarqueeBanner />
      <Navbar productLines={productLines} user={navUser} />

      <main>
        {/* Hero */}
        <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 bg-background overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-terra-500/5 blur-[150px] rounded-full pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-volcanic-900/5 mb-8">
              <GiftIcon className="w-4 h-4 text-terra-500" />
              <span className="text-body-xs uppercase tracking-widest text-volcanic-600 font-semibold">
                Tarjetas de regalo
              </span>
            </div>

            <h1 className="font-heading text-display-lg sm:text-display-xl text-volcanic-900 mb-6">
              {giftCards.heading}
            </h1>
            <p className="text-body-lg text-volcanic-500 max-w-2xl mx-auto leading-relaxed">
              {giftCards.subtitle}
            </p>
          </div>
        </section>

        {/* Gift Cards Grid */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal stagger>
              <GiftCardGrid cards={cardDefs} userId={navUser ? user!.id : null} />
            </ScrollReveal>

            {/* Info section */}
            <div className="mt-16 lg:mt-20 max-w-3xl mx-auto">
              <div className="rounded-2xl bg-white border border-sand-200/60 p-8 lg:p-10">
                <h2 className="font-heading text-xl text-volcanic-900 mb-6 text-center">
                  Como funciona
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { step: '01', title: 'Elegí el monto', desc: 'Selecciona la gift card que mejor se ajuste.' },
                    { step: '02', title: 'Enviala', desc: 'La recibís por email lista para regalar.' },
                    { step: '03', title: 'A disfrutar', desc: 'Se canjea en cualquier producto de la tienda.' },
                  ].map((item) => (
                    <div key={item.step} className="text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-terra-500/10 mb-3">
                        <span className="text-body-xs font-mono font-semibold text-terra-500">{item.step}</span>
                      </div>
                      <h3 className="font-heading text-body-md text-volcanic-900 mb-1">{item.title}</h3>
                      <p className="text-body-sm text-volcanic-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {['Sin fecha de vencimiento', 'Entrega inmediata por email', 'Valida en toda la tienda'].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-terra-500" />
                  <span className="text-body-sm text-volcanic-600">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer productLines={productLines} />
    </>
  )
}
