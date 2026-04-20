import type { Metadata } from 'next'
import { MarqueeBanner, Navbar, Footer } from '@/features/shop/components'
import { getProductLines } from '@/features/shop/services/product-lines'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ArrepentimientoForm } from './ArrepentimientoForm'

export const metadata: Metadata = {
  title: 'Boton de Arrepentimiento | SEISMILES',
  description:
    'Ejerce tu derecho de arrepentimiento dentro de los 10 días corridos de la compra. Resolucion 424/2020 - Ley 24.240.',
}

export default async function ArrepentimientoPage() {
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
        <section className="relative bg-volcanic-900 py-20 lg:py-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-terra-500/5 blur-[150px] rounded-full pointer-events-none" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
              <span className="text-body-xs uppercase tracking-widest text-white/80 font-semibold">
                Defensa del consumidor
              </span>
            </div>
            <h1 className="font-heading text-display-lg sm:text-display-xl text-white mb-4">
              Boton de Arrepentimiento
            </h1>
            <p className="text-body-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              Ejerce tu derecho de arrepentimiento dentro de los 10 días corridos
              desde la celebracion del contrato o la recepcion del producto.
            </p>
          </div>
        </section>

        {/* Info + form */}
        <section className="py-16 lg:py-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Info legal */}
            <div className="mb-10 p-6 bg-sand-100 rounded-2xl border border-sand-200/60">
              <h2 className="font-heading text-lg text-volcanic-900 mb-3">
                Como funciona
              </h2>
              <ul className="space-y-2 text-body-sm text-volcanic-500 leading-relaxed">
                <li className="flex gap-3">
                  <span className="text-terra-500 font-bold">·</span>
                  <span>
                    Podés arrepentirte de tu compra dentro de los <strong className="text-volcanic-900">10 días corridos</strong> desde
                    la celebración del contrato o la recepción del producto, el plazo que sea más favorable.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-terra-500 font-bold">·</span>
                  <span>
                    Completá el formulario. Vamos a enviarte una <strong className="text-volcanic-900">constancia por email</strong> con
                    un código único de seguimiento.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-terra-500 font-bold">·</span>
                  <span>
                    Te contactaremos dentro de las <strong className="text-volcanic-900">24 horas hábiles</strong> para
                    coordinar la devolución del producto.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-terra-500 font-bold">·</span>
                  <span>
                    El producto debe devolverse en su estado original. Los <strong className="text-volcanic-900">costos de envío
                    de la devolución corren por nuestra cuenta</strong>.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-terra-500 font-bold">·</span>
                  <span>
                    Una vez recibido el producto, te reintegramos el <strong className="text-volcanic-900">importe íntegro</strong> por
                    el mismo medio de pago utilizado en la compra.
                  </span>
                </li>
              </ul>
              <p className="mt-4 pt-4 border-t border-sand-200 text-body-xs text-volcanic-500">
                Marco legal: art. 34 de la Ley 24.240 de Defensa del Consumidor y Resolucion 424/2020
                de la Secretaria de Comercio Interior.
              </p>
            </div>

            <ArrepentimientoForm />
          </div>
        </section>
      </main>

      <Footer productLines={productLines} />
    </>
  )
}
