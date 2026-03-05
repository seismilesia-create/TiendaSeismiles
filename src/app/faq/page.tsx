import type { Metadata } from 'next'
import { shopConfig } from '@/features/shop/config'
import { MarqueeBanner, Navbar, Footer } from '@/features/shop/components'
import { getProductLines } from '@/features/shop/services/product-lines'
import { getActiveFaqs } from '@/features/shop/services/faq'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { FaqAccordion } from './FaqAccordion'
import { FaqContactForm } from './FaqContactForm'

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description: 'Respuestas a las preguntas mas comunes sobre Seismiles Textil. Envios, talles, medios de pago, cambios y mas.',
}

function HelpCircleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  )
}

export default async function FaqPage() {
  const { faq } = shopConfig
  const [productLines, supabase, dbFaqs] = await Promise.all([
    getProductLines(),
    createClient(),
    getActiveFaqs(),
  ])
  const { data: { user } } = await supabase.auth.getUser()
  let navUser: { email: string; role: string } | null = null
  if (user) {
    const service = createServiceClient()
    const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single()
    navUser = { email: user.email ?? '', role: profile?.role ?? 'customer' }
  }

  // Use DB items, fall back to config if empty
  const faqItems = dbFaqs.length > 0
    ? dbFaqs.map(f => ({ question: f.question, answer: f.answer }))
    : faq.items

  const formUser = user ? { email: user.email ?? '' } : null

  return (
    <>
      <MarqueeBanner />
      <Navbar productLines={productLines} user={navUser} />

      <main>
        {/* Hero */}
        <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 bg-[#FAFAF8] overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-terra-500/5 blur-[150px] rounded-full pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-volcanic-900/5 mb-8">
              <HelpCircleIcon className="w-4 h-4 text-terra-500" />
              <span className="text-body-xs uppercase tracking-widest text-volcanic-600 font-semibold">
                Centro de ayuda
              </span>
            </div>

            <h1 className="font-heading text-display-lg sm:text-display-xl text-volcanic-900 mb-6">
              {faq.heading}
            </h1>
            <p className="text-body-lg text-volcanic-500 max-w-2xl mx-auto leading-relaxed">
              {faq.subtitle}
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16 lg:py-24 bg-[#FAFAF8]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <FaqAccordion items={faqItems} />

            {/* Contact form */}
            <div className="mt-16 lg:mt-20">
              <div className="rounded-2xl bg-volcanic-900 p-8 lg:p-10 overflow-hidden relative">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-terra-500/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative">
                  <h2 className="font-heading text-xl lg:text-2xl text-white mb-3">
                    Hacenos tu pregunta
                  </h2>
                  <p className="text-body-md text-white/50 mb-8 max-w-lg">
                    {faq.contactPrompt}
                  </p>
                  <FaqContactForm user={formUser} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer productLines={productLines} />
    </>
  )
}
