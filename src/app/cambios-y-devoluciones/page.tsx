import type { Metadata } from 'next'
import Link from 'next/link'
import { MarqueeBanner, Navbar, Footer } from '@/features/shop/components'
import { getProductLines } from '@/features/shop/services/product-lines'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Cambios y Devoluciones | SEISMILES Textil',
  description: 'Politica de cambios y devoluciones de SEISMILES Textil. Proceso simple, transparente y sin complicaciones.',
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
    </svg>
  )
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  )
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  )
}

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
  )
}

const WHATSAPP_NUMBER = '5493834243614'

export default async function CambiosDevolucionesPage() {
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
        {/* Hero */}
        <section className="relative pt-16 pb-12 lg:pt-24 lg:pb-16 bg-background overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-terra-500/5 blur-[150px] rounded-full pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-volcanic-900/5 mb-8">
              <RefreshIcon className="w-4 h-4 text-terra-500" />
              <span className="text-body-xs uppercase tracking-widest text-volcanic-600 font-semibold">
                Politica oficial
              </span>
            </div>

            <h1 className="font-heading text-display-lg sm:text-display-xl text-volcanic-900 mb-6">
              Cambios y Devoluciones
            </h1>
            <p className="text-body-lg text-volcanic-500 max-w-2xl mx-auto leading-relaxed">
              En SEISMILES trabajamos para que cada pieza que elijas te brinde la solidez y el confort de la montaña.
              Si necesitas realizar un cambio o devolucion, queremos que el proceso sea simple y transparente.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

            {/* 1. Cambios */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <RefreshIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">1. Cambios</h2>
              </div>

              <div className="space-y-5 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Podes realizar el cambio de cualquier articulo dentro de los <strong className="text-volcanic-900">30 dias corridos</strong> posteriores a la recepcion de tu compra.
                </p>

                <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                  <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Condicion</p>
                  <p className="text-body-sm text-volcanic-500">
                    El producto debe estar sin uso, en perfectas condiciones y con todas sus etiquetas originales colocadas.
                  </p>
                </div>

                <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                  <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Gestion</p>
                  <p className="text-body-sm text-volcanic-500">
                    Inicia tu cambio enviando un mensaje por WhatsApp al <strong>3834243614</strong>.
                  </p>
                </div>

                <h3 className="font-heading text-lg text-volcanic-900 pt-2">Opciones para realizar el cambio</h3>

                <div className="space-y-4">
                  <div className="border-l-2 border-terra-500 pl-4">
                    <p className="text-body-sm font-semibold text-volcanic-900">En San Fernando del Valle de Catamarca</p>
                    <p className="text-body-sm text-volcanic-500 mt-1">
                      Coordinamos el cambio de forma personalizada. Una vez que nos contactes por WhatsApp, te indicaremos el punto de encuentro o entrega en la ciudad para que puedas realizarlo sin costo.
                    </p>
                  </div>

                  <div className="border-l-2 border-terra-500 pl-4">
                    <p className="text-body-sm font-semibold text-volcanic-900">Cambio por Correo</p>
                    <p className="text-body-sm text-volcanic-500 mt-1">
                      Si sos de otra provincia o preferis el envio, te indicaremos los pasos a seguir.
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Costos</p>
                    <p className="text-body-sm text-volcanic-500">
                      En cambios por talle o color, el envio de la prenda hacia nosotros queda a cargo del cliente, y SEISMILES se hace cargo del re-envio del nuevo talle.
                    </p>
                  </div>

                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Fallas</p>
                    <p className="text-body-sm text-volcanic-500">
                      Si el cambio es por una falla de fabricacion, nosotros asumimos todos los gastos logisticos.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Devoluciones */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <PackageIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">2. Devoluciones</h2>
              </div>

              <div className="space-y-5 text-body-md text-volcanic-600 leading-relaxed">
                <div className="rounded-xl bg-volcanic-900 text-white p-5">
                  <p className="text-body-xs uppercase tracking-widest text-terra-400 font-semibold mb-2">Derecho de Arrepentimiento</p>
                  <p className="text-body-sm text-white/70">
                    De acuerdo a la normativa vigente, tenes <strong className="text-white">10 dias corridos</strong> desde que recibis el producto para solicitar la devolucion si no estas conforme.
                  </p>
                </div>

                <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                  <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Procedimiento</p>
                  <p className="text-body-sm text-volcanic-500">
                    Contactanos al WhatsApp <strong>3834243614</strong> indicando tu numero de pedido.
                  </p>
                </div>

                <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                  <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Reembolso</p>
                  <p className="text-body-sm text-volcanic-500">
                    El reintegro se realizara por el mismo medio de pago original una vez que hayamos recibido y verificado el estado de la prenda en nuestro taller.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Productos en Promocion */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <TagIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">3. Productos en Promocion o Liquidacion</h2>
              </div>

              <div className="text-body-md text-volcanic-600 leading-relaxed">
                <p className="mb-4">Para aquellas prendas adquiridas con descuentos especiales o en eventos de liquidacion:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Los cambios estan sujetos a disponibilidad de stock.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Los gastos de envio por cambio o devolucion en estos productos corren por cuenta del cliente.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* CTA WhatsApp */}
            <div className="rounded-2xl bg-volcanic-900 p-8 lg:p-10 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-terra-500/10 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative">
                <h3 className="font-heading text-xl lg:text-2xl text-white mb-3">
                  Necesitas hacer un cambio o devolucion?
                </h3>
                <p className="text-body-md text-white/50 mb-6 max-w-lg mx-auto">
                  Escribinos por WhatsApp y te guiamos en el proceso. Respuesta rapida y personalizada.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20SEISMILES!%20Quiero%20consultar%20sobre%20un%20cambio%2Fdevolucion.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20BD5A] text-white text-body-md font-semibold rounded-xl transition-colors"
                >
                  <WhatsappIcon className="w-5 h-5" />
                  Contactar por WhatsApp
                </a>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/faq"
                className="text-body-sm text-volcanic-500 hover:text-terra-500 transition-colors"
              >
                Preguntas frecuentes
              </Link>
              <span className="hidden sm:block text-volcanic-300">|</span>
              <Link
                href="/contacto"
                className="text-body-sm text-volcanic-500 hover:text-terra-500 transition-colors"
              >
                Contacto
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer productLines={productLines} />
    </>
  )
}
