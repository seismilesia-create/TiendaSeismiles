import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MarqueeBanner, Navbar, Footer, TopoPattern } from '@/features/shop/components'
import { getProductLines } from '@/features/shop/services/product-lines'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Nosotros | SEISMILES',
  description: 'Nacidos en la inmensidad del altiplano catamarqueño. Conoce la historia de SEISMILES, nuestra esencia y la ruta que nos inspira.',
  alternates: { canonical: '/nosotros' },
}

function MountainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
}

export default async function NosotrosPage() {
  const [productLines, supabase] = await Promise.all([getProductLines(), createClient()])
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
        {/* Hero - Full width image with overlay */}
        <section className="relative h-[70vh] lg:h-[80vh] flex items-end overflow-hidden">
          <Image
            src="/images/paso de san francisco - quebrada de las angosturas.jpg"
            alt="Paso de San Francisco, Ruta Nacional 60, Catamarca"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-volcanic-900/90 via-volcanic-900/40 to-transparent" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
              <MountainIcon className="w-4 h-4 text-terra-400" />
              <span className="text-body-xs uppercase tracking-widest text-white/80 font-semibold">
                Nuestra historia
              </span>
            </div>
            <h1 className="font-heading text-display-lg sm:text-display-xl lg:text-[4.5rem] leading-[1.05] text-white mb-4 max-w-3xl">
              El Horizonte que nos Guía
            </h1>
            <p className="text-body-lg text-white/60 max-w-2xl leading-relaxed">
              En SEISMILES, nuestra identidad nace de la contemplación de los gigantes que definen el cielo de Catamarca. Los "SEISMILES" —esos colosos que desafían los 6.000 metros de altura— no son solo parte de nuestro paisaje; son el estándar de solidez, resistencia y presencia que buscamos en cada prenda que fabricamos.
            </p>
          </div>
        </section>

        {/* Origin story */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Text */}
              <div>
                <span className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold mb-4 block">
                  Quienes somos
                </span>
                <h2 className="font-heading text-display-sm sm:text-display-md text-volcanic-900 mb-6">
                  Manos Catamarqueñas, Diseño de Altura
                </h2>
                <div className="space-y-5 text-body-md text-volcanic-500 leading-relaxed">
                  <p>
                    No somos una marca de paso. Somos un taller textil con raíces profundas en nuestra provincia, ubicado en la Avenida Presidente Castillo. Aquí, cada pieza es el resultado de un proceso consciente: desde la selección técnica de las materias primas hasta el control riguroso de la última puntada.
                  </p>
                  <p>
                    En un mundo de moda descartable, en SEISMILES elegimos el camino de la perdurabilidad. Trabajamos con algodones peinados de gramaje superior, rústicos premium y piqués de textura firme, diseñados para acompañarte durante años, manteniendo su forma y su carácter intactos.
                  </p>
                  <p>
                    Diseñamos para quienes valoran el origen de lo que visten. Para quienes buscan la comodidad de un básico pero exigen la distinción de una pieza bien lograda. Nuestra promesa es simple: ofrecerte indumentaria de autor que se sienta tan sólida y auténtica como la tierra de la que venimos.
                  </p>
                </div>
              </div>

              {/* Image */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <Image
                  src="/images/balcon pissis.jpg"
                  alt="Balcon del Pissis, lagunas y salares del altiplano catamarqueño"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 lg:py-28 bg-volcanic-900 relative overflow-hidden">
          {/* Topographic contour lines */}
          <TopoPattern className="text-white/[0.035]" />

          {/* Decorative blurs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-terra-500/5 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-terra-500/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-body-xs uppercase tracking-widest text-terra-400 font-semibold mb-4 block">
                Nuestros valores
              </span>
              <h2 className="font-heading text-display-sm sm:text-display-md text-white mb-4">
                Lo que nos define
              </h2>
              <p className="text-body-md text-white/60 max-w-2xl mx-auto">
                Cada decisión que tomamos está guiada por estos principios. Son nuestra brújula,
                como la cordillera lo es para el viajero.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  number: '01',
                  title: 'Calidad sin concesiones',
                  description: 'Elegimos los mejores materiales: algodón de fibra larga, pique superior y frisas peinadas de primera calidad. No hay atajos cuando el objetivo es la excelencia.',
                },
                {
                  number: '02',
                  title: 'Raíces catamarqueñas',
                  description: 'Diseñamos, curamos y estampamos en Catamarca. Nuestra identidad nace de la tierra, de sus colores, de su fuerza. Cada prenda lleva el ADN del altiplano.',
                },
                {
                  number: '03',
                  title: 'Hecho para durar',
                  description: 'Costuras reforzadas, tinturas de alta fijación, terminaciones impecables. Nuestras prendas están hechas para acompañarte, no para descartarse.',
                },
                {
                  number: '04',
                  title: 'Diseño con propósito',
                  description: 'Cada línea tiene nombre de volcán, cada detalle tiene razón de ser. Creamos ropa urbana con alma de montaña: versátil, resistente y con carácter.',
                },
                {
                  number: '05',
                  title: 'Confianza genuina',
                  description: 'Vestir SEISMILES es vestir confianza. Sabemos que cuando te sentis bien con lo que llevas puesto, todo cambia. Ese es nuestro compromiso.',
                },
                {
                  number: '06',
                  title: 'Comunidad',
                  description: 'No somos solo una marca, somos una comunidad de personas que valoran lo autentico. Crecemos juntos, paso a paso, cumbre a cumbre.',
                },
              ].map((value) => (
                <div
                  key={value.number}
                  className="rounded-2xl bg-white/[0.04] border border-white/[0.06] p-6 lg:p-8 hover:bg-white/[0.06] transition-colors duration-300"
                >
                  <span className="text-body-xs font-mono text-terra-400 mb-4 block">
                    {value.number}
                  </span>
                  <h3 className="font-heading text-lg text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-body-sm text-white/60 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Full width landscape image */}
        <section className="relative h-[50vh] lg:h-[60vh] overflow-hidden">
          <Image
            src="/images/Siesmiles_Secretaría de Turismo de Catamarca_03.jpg"
            alt="Volcanes nevados de la Ruta de los SEISMILES, Catamarca"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-volcanic-900/20 via-transparent to-[#FAFAF8]" />

          {/* Floating quote */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-4 max-w-3xl">
              <blockquote className="font-heading italic text-display-sm sm:text-display-md text-white drop-shadow-lg">
                &ldquo;Donde los volcanes tocan el cielo, vestimos confianza&rdquo;
              </blockquote>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28 bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-body-xs uppercase tracking-widest text-terra-500 font-semibold mb-4 block">
              Unite a SEISMILES
            </span>
            <h2 className="font-heading text-display-sm sm:text-display-md text-volcanic-900 mb-6">
              Conoce nuestra colección
            </h2>
            <p className="text-body-md text-volcanic-500 leading-relaxed mb-10 max-w-xl mx-auto">
              Cada prenda es una declaracion de lo que somos: resistencia, calidez y autenticidad.
              Explora las líneas que nacen de la montaña.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/catalogo"
                className="group flex items-center gap-2 px-8 py-4 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-md font-semibold rounded-xl transition-all duration-300 hover:shadow-warm-lg"
              >
                Ver colección
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                href="/faq"
                className="group flex items-center gap-2 px-8 py-4 bg-white hover:bg-sand-100 text-volcanic-900 text-body-md font-semibold rounded-xl border border-volcanic-900/10 transition-all duration-300"
              >
                Preguntas frecuentes
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer productLines={productLines} />
    </>
  )
}
