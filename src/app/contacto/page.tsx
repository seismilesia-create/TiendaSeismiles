import type { Metadata } from 'next'
import Link from 'next/link'
import { MarqueeBanner, Navbar, Footer } from '@/features/shop/components'
import { getProductLines } from '@/features/shop/services/product-lines'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { shopConfig } from '@/features/shop/config'

export const metadata: Metadata = {
  title: 'Contacto | SEISMILES',
  description: 'Contactanos para consultas, pedidos mayoristas o personalización empresarial. Estamos en Catamarca, Argentina.',
  alternates: { canonical: '/contacto' },
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
}

export default async function ContactoPage() {
  const [productLines, supabase] = await Promise.all([getProductLines(), createClient()])
  const { data: { user } } = await supabase.auth.getUser()
  let navUser: { email: string; role: string } | null = null
  if (user) {
    const service = createServiceClient()
    const { data: profile } = await service.from('profiles').select('role').eq('id', user.id).single()
    navUser = { email: user.email ?? '', role: profile?.role ?? 'customer' }
  }

  const { brand } = shopConfig

  return (
    <>
      <MarqueeBanner />
      <Navbar productLines={productLines} user={navUser} />

      <main>
        {/* Hero */}
        <section className="relative bg-volcanic-900 py-20 lg:py-28 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-terra-500/5 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-terra-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
              <MailIcon className="w-4 h-4 text-terra-400" />
              <span className="text-body-xs uppercase tracking-widest text-white/80 font-semibold">
                Contacto
              </span>
            </div>
            <h1 className="font-heading text-display-lg sm:text-display-xl text-white mb-4 max-w-3xl mx-auto">
              Hablemos
            </h1>
            <p className="text-body-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              Estamos acá para ayudarte. Escribinos por cualquier consulta sobre productos,
              pedidos mayoristas o personalización para tu empresa.
            </p>
          </div>
        </section>

        {/* Contact info + form */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Left: contact cards */}
              <div>
                <span className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold mb-4 block">
                  Nuestros canales
                </span>
                <h2 className="font-heading text-display-sm text-volcanic-900 mb-8">
                  Encontranos por donde prefieras
                </h2>

                <div className="space-y-4">
                  <a
                    href={brand.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-sand-200/60 hover:shadow-warm-lg hover:border-terra-200 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-terra-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-terra-500/15 transition-colors">
                      <PhoneIcon className="w-5 h-5 text-terra-500" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base text-volcanic-900 mb-1">WhatsApp</h3>
                      <p className="text-body-sm text-volcanic-500 leading-relaxed">
                        Escribinos y te respondemos al instante. Ideal para consultas rápidas sobre talles, stock y envíos.
                      </p>
                      <span className="inline-flex items-center gap-1.5 mt-3 text-body-xs font-semibold text-terra-500 group-hover:gap-2 transition-all">
                        Enviar mensaje
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </a>

                  <a
                    href={`mailto:${brand.email}`}
                    className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-sand-200/60 hover:shadow-warm-lg hover:border-terra-200 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-terra-50 flex items-center justify-center flex-shrink-0 group-hover:bg-terra-100 transition-colors">
                      <MailIcon className="w-5 h-5 text-terra-500" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base text-volcanic-900 mb-1">Email</h3>
                      <p className="text-body-sm text-volcanic-500 leading-relaxed">
                        Para consultas formales, pedidos mayoristas o propuestas comerciales.
                      </p>
                      <span className="inline-flex items-center gap-1.5 mt-3 text-body-xs font-semibold text-terra-500">
                        {brand.email}
                      </span>
                    </div>
                  </a>

                  <a
                    href={brand.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-sand-200/60 hover:shadow-warm-lg hover:border-volcanic-300 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-volcanic-900/10 flex items-center justify-center flex-shrink-0 group-hover:bg-volcanic-900/15 transition-colors">
                      <InstagramIcon className="w-5 h-5 text-volcanic-700" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base text-volcanic-900 mb-1">Instagram</h3>
                      <p className="text-body-sm text-volcanic-500 leading-relaxed">
                        Seguinos para ver las últimas novedades, lanzamientos y el backstage de nuestra marca.
                      </p>
                      <span className="inline-flex items-center gap-1.5 mt-3 text-body-xs font-semibold text-volcanic-700 group-hover:gap-2 transition-all">
                        @seismiles_
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </a>

                  <div className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-sand-200/60">
                    <div className="w-12 h-12 rounded-xl bg-sand-100 flex items-center justify-center flex-shrink-0">
                      <MapPinIcon className="w-5 h-5 text-volcanic-500" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base text-volcanic-900 mb-1">Ubicación</h3>
                      <p className="text-body-sm text-volcanic-500 leading-relaxed">
                        Catamarca, Argentina
                      </p>
                      <p className="text-body-xs text-volcanic-500 mt-1">
                        Diseñamos y estampamos desde el corazón del noroeste argentino.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: FAQ prompt + CTA */}
              <div>
                <span className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold mb-4 block">
                  Consultas frecuentes
                </span>
                <h2 className="font-heading text-display-sm text-volcanic-900 mb-6">
                  Tal vez ya tenemos la respuesta
                </h2>
                <p className="text-body-md text-volcanic-500 leading-relaxed mb-8">
                  Antes de escribirnos, te invitamos a revisar nuestra sección de preguntas frecuentes
                  donde respondemos las consultas más comunes sobre envíos, talles, pagos y devoluciones.
                </p>

                <Link
                  href="/faq"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-warm-lg mb-12"
                >
                  Ver preguntas frecuentes
                  <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>

                {/* Horarios */}
                <div className="p-6 bg-white rounded-2xl border border-sand-200/60">
                  <h3 className="font-heading text-lg text-volcanic-900 mb-4">Horarios de atención</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-volcanic-500">Lunes a Viernes</span>
                      <span className="text-body-sm font-medium text-volcanic-900">9:00 - 18:00</span>
                    </div>
                    <div className="w-full h-px bg-sand-200" />
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-volcanic-500">Sábados</span>
                      <span className="text-body-sm font-medium text-volcanic-900">9:00 - 13:00</span>
                    </div>
                    <div className="w-full h-px bg-sand-200" />
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-volcanic-500">Domingos y feriados</span>
                      <span className="text-body-sm font-medium text-volcanic-500">Cerrado</span>
                    </div>
                  </div>
                  <p className="text-body-xs text-volcanic-500 mt-4">
                    WhatsApp e Instagram: respondemos dentro de las 24hs hábiles.
                  </p>
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
