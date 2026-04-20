import type { Metadata } from 'next'
import Link from 'next/link'
import { MarqueeBanner, Navbar, Footer } from '@/features/shop/components'
import { getProductLines } from '@/features/shop/services/product-lines'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | SEISMILES',
  description: 'Términos y condiciones de uso de la tienda online SEISMILES. Condiciones de compra, pagos, responsabilidades y más.',
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
  )
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  )
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" /><line x1="2" x2="22" y1="10" y2="10" />
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}

function ScaleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  )
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
    </svg>
  )
}

const LAST_UPDATED = '17 de abril de 2026'

export default async function TerminosCondicionesPage() {
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
              <FileTextIcon className="w-4 h-4 text-terra-500" />
              <span className="text-body-xs uppercase tracking-widest text-volcanic-600 font-semibold">
                Marco legal
              </span>
            </div>

            <h1 className="font-heading text-display-lg sm:text-display-xl text-volcanic-900 mb-6">
              Términos y Condiciones
            </h1>
            <p className="text-body-lg text-volcanic-500 max-w-2xl mx-auto leading-relaxed">
              Al navegar y realizar compras en nuestro sitio web, aceptás los siguientes
              términos y condiciones. Te pedimos que los leas con atención.
            </p>
            <p className="text-body-sm text-volcanic-400 mt-4">
              Última actualización: {LAST_UPDATED}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

            {/* 1. Generalidades */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <FileTextIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">1. Generalidades</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Los presentes Términos y Condiciones regulan el uso del sitio web de <strong className="text-volcanic-900">SEISMILES</strong>,
                  con domicilio en San Fernando del Valle de Catamarca, provincia de Catamarca, República Argentina,
                  y la relación contractual entre SEISMILES y los usuarios que accedan o realicen compras a través del sitio.
                </p>
                <p>
                  El uso del sitio implica la aceptación plena e incondicional de estos términos. Si no estás
                  de acuerdo con alguna de las condiciones aquí establecidas, te pedimos que te abstengas de utilizar el sitio.
                </p>
                <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                  <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Normativa aplicable</p>
                  <p className="text-body-sm text-volcanic-500">
                    Estos términos se rigen por la <strong>Ley 24.240 de Defensa del Consumidor</strong>,
                    la <strong>Ley 25.326 de Protección de Datos Personales</strong>,
                    el <strong>Código Civil y Comercial de la Nación</strong>,
                    y la <strong>Resolución 104/2005</strong> de la Secretaría de Coordinación Técnica
                    sobre información en sitios de comercio electrónico.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Cuenta de usuario */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">2. Cuenta de usuario</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Para realizar compras en el sitio es necesario crear una cuenta con una dirección de correo electrónico
                  válida y una contraseña. El usuario es responsable de:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Proporcionar información veraz y actualizada.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Mantener la confidencialidad de sus credenciales de acceso.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Notificar de inmediato a SEISMILES ante cualquier uso no autorizado de su cuenta.</span>
                  </li>
                </ul>
                <p>
                  SEISMILES se reserva el derecho de suspender o cancelar cuentas que incumplan estos términos
                  o que presenten actividad sospechosa.
                </p>
              </div>
            </div>

            {/* 3. Productos y precios */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <TagIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">3. Productos y precios</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <div className="space-y-4">
                  <div className="border-l-2 border-terra-500 pl-4">
                    <p className="text-body-sm font-semibold text-volcanic-900">Descripción de productos</p>
                    <p className="text-body-sm text-volcanic-500 mt-1">
                      Nos esforzamos por presentar de la manera más fiel posible las características, colores
                      y detalles de nuestras prendas. Sin embargo, las imágenes pueden variar levemente
                      respecto del producto real debido a la configuración de cada pantalla.
                    </p>
                  </div>

                  <div className="border-l-2 border-terra-500 pl-4">
                    <p className="text-body-sm font-semibold text-volcanic-900">Precios</p>
                    <p className="text-body-sm text-volcanic-500 mt-1">
                      Todos los precios publicados están expresados en Pesos Argentinos (ARS) e incluyen IVA.
                      SEISMILES se reserva el derecho de modificar los precios en cualquier momento,
                      sin previo aviso. El precio vigente al momento de confirmar la compra será el aplicable.
                    </p>
                  </div>

                  <div className="border-l-2 border-terra-500 pl-4">
                    <p className="text-body-sm font-semibold text-volcanic-900">Disponibilidad</p>
                    <p className="text-body-sm text-volcanic-500 mt-1">
                      Todos los productos están sujetos a disponibilidad de stock. En caso de que un producto
                      no esté disponible después de confirmada la compra, nos comunicaremos con vos para
                      ofrecer una alternativa o proceder al reembolso.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                  <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Promociones y descuentos</p>
                  <p className="text-body-sm text-volcanic-500">
                    Las promociones, descuentos y cupones tienen condiciones específicas (vigencia, stock,
                    productos aplicables) que serán comunicadas en cada caso. Los cupones no son acumulables
                    salvo que se indique expresamente lo contrario.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Proceso de compra */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <CartIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">4. Proceso de compra</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>El proceso de compra consta de los siguientes pasos:</p>

                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-terra-500/10 flex items-center justify-center text-body-xs font-semibold text-terra-600">1</span>
                    <p className="text-body-sm text-volcanic-500 pt-1">
                      <strong className="text-volcanic-900">Selección:</strong> Elegí los productos y talles que desees, y agregalos al carrito.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-terra-500/10 flex items-center justify-center text-body-xs font-semibold text-terra-600">2</span>
                    <p className="text-body-sm text-volcanic-500 pt-1">
                      <strong className="text-volcanic-900">Revisión:</strong> Verificá los productos, cantidades y el monto total en el carrito.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-terra-500/10 flex items-center justify-center text-body-xs font-semibold text-terra-600">3</span>
                    <p className="text-body-sm text-volcanic-500 pt-1">
                      <strong className="text-volcanic-900">Pago:</strong> Completá el pago a través de Mercado Pago con el medio que prefieras.
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-terra-500/10 flex items-center justify-center text-body-xs font-semibold text-terra-600">4</span>
                    <p className="text-body-sm text-volcanic-500 pt-1">
                      <strong className="text-volcanic-900">Confirmación:</strong> Recibirás un email con la confirmación de tu pedido y los detalles de la compra.
                    </p>
                  </div>
                </div>

                <p>
                  La compra se perfecciona con la confirmación del pago. Hasta ese momento,
                  la operación no se considera concretada y el stock no queda reservado.
                </p>
              </div>
            </div>

            {/* 5. Medios de pago */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">5. Medios de pago</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Todos los pagos se procesan de forma segura a través de <strong className="text-volcanic-900">Mercado Pago</strong>.
                  SEISMILES no almacena ni tiene acceso a tus datos financieros.
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Tarjetas</p>
                    <p className="text-body-sm text-volcanic-500">
                      Crédito y débito (Visa, Mastercard, American Express). Hasta 3 cuotas sin interés con tarjeta de crédito.
                    </p>
                  </div>

                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Otros medios</p>
                    <p className="text-body-sm text-volcanic-500">
                      Transferencia bancaria, dinero en cuenta de Mercado Pago, Rapipago y Pago Fácil.
                    </p>
                  </div>
                </div>

                <p>
                  En caso de que el pago sea rechazado o no se acredite, la compra no se considerará
                  confirmada. Ante inconvenientes con el pago, contactanos para asistirte.
                </p>
              </div>
            </div>

            {/* 6. Cambios, devoluciones y arrepentimiento */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <CartIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">6. Cambios, devoluciones y arrepentimiento</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Los cambios y devoluciones se rigen por nuestra política específica, disponible en{' '}
                  <Link href="/cambios-y-devoluciones" className="text-terra-500 hover:underline">Cambios y Devoluciones</Link>.
                  En resumen:
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Cambios</p>
                    <p className="text-body-sm text-volcanic-500">
                      Dentro de los 30 días corridos desde la recepción. El producto debe estar sin uso y con etiquetas originales.
                    </p>
                  </div>

                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Devoluciones</p>
                    <p className="text-body-sm text-volcanic-500">
                      El reembolso se realiza por el mismo medio de pago una vez verificado el estado del producto.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-volcanic-900 text-white p-5">
                  <p className="text-body-xs uppercase tracking-widest text-terra-400 font-semibold mb-2">Derecho de arrepentimiento</p>
                  <p className="text-body-sm text-white/70">
                    En cumplimiento de la <strong className="text-white">Ley 24.240</strong> y la{' '}
                    <strong className="text-white">Resolución 424/2020</strong>, tenés 10 días corridos
                    desde la recepción del producto para ejercer tu derecho de arrepentimiento
                    sin necesidad de justificar el motivo. Podés hacerlo a través de nuestro{' '}
                    <Link href="/arrepentimiento" className="text-terra-400 hover:underline">Botón de Arrepentimiento</Link>.
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Gift Cards */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <GiftIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">7. Gift Cards</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>Las tarjetas de regalo de SEISMILES están sujetas a las siguientes condiciones:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>No tienen fecha de vencimiento.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Son válidas para todos los productos de la tienda online.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>No son canjeables por dinero en efectivo.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Si el monto de la compra es inferior al saldo de la gift card, el saldo restante queda disponible para futuras compras.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Son intransferibles una vez asociadas a una cuenta.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 8. Propiedad intelectual */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">8. Propiedad intelectual</h2>
              </div>

              <div className="text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Todo el contenido del sitio web — incluyendo pero no limitado a textos, imágenes,
                  fotografías, logotipos, diseños, marcas, nombres comerciales y código fuente — es
                  propiedad exclusiva de SEISMILES o de sus licenciantes, y está protegido
                  por la legislación argentina e internacional sobre propiedad intelectual.
                </p>
                <p className="mt-4">
                  Queda prohibida la reproducción, distribución, modificación o uso comercial del contenido
                  sin autorización expresa y por escrito de SEISMILES.
                </p>
              </div>
            </div>

            {/* 9. Limitación de responsabilidad */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <AlertIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">9. Limitación de responsabilidad</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>SEISMILES no será responsable por:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Interrupciones o fallas técnicas del sitio web, de la plataforma de pagos o de los servicios de terceros.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Demoras en la entrega ocasionadas por el servicio de correo, condiciones climáticas u otras causas de fuerza mayor.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Uso indebido de la cuenta por parte del usuario o por terceros que accedan con sus credenciales.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Variaciones menores de color o textura respecto de las imágenes publicadas, propias de la naturaleza de los productos textiles.</span>
                  </li>
                </ul>
                <p>
                  En todos los casos, la responsabilidad de SEISMILES se limita al monto efectivamente
                  abonado por el usuario en la transacción en cuestión, sin perjuicio de los derechos
                  que le asisten al consumidor bajo la Ley 24.240.
                </p>
              </div>
            </div>

            {/* 10. Protección de datos */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <ShieldIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">10. Protección de datos personales</h2>
              </div>

              <div className="text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  El tratamiento de tus datos personales se rige por nuestra{' '}
                  <Link href="/politica-de-privacidad" className="text-terra-500 hover:underline">Política de Privacidad</Link>,
                  que forma parte integrante de estos Términos y Condiciones. Te recomendamos leerla para
                  conocer qué datos recopilamos, con qué finalidad y cuáles son tus derechos.
                </p>
              </div>
            </div>

            {/* 11. Jurisdicción */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <ScaleIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">11. Jurisdicción y ley aplicable</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Los presentes Términos y Condiciones se rigen por las leyes de la República Argentina.
                  Ante cualquier controversia que pudiera surgir en relación con el uso del sitio o con
                  las compras realizadas, las partes se someten a la jurisdicción de los Tribunales
                  Ordinarios de la ciudad de San Fernando del Valle de Catamarca, provincia de Catamarca.
                </p>

                <div className="rounded-xl bg-volcanic-900 text-white p-5">
                  <p className="text-body-xs uppercase tracking-widest text-terra-400 font-semibold mb-2">Defensa del consumidor</p>
                  <p className="text-body-sm text-white/70">
                    Sin perjuicio de lo anterior, como consumidor podés iniciar reclamos ante la
                    autoridad de aplicación de la Ley de Defensa del Consumidor de tu jurisdicción,
                    o ante la <strong className="text-white">Dirección Nacional de Defensa del Consumidor</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* 12. Modificaciones */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <FileTextIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">12. Modificaciones</h2>
              </div>

              <div className="text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  SEISMILES se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento.
                  Los cambios entrarán en vigencia a partir de su publicación en el sitio web. El uso continuado
                  del sitio después de la publicación de las modificaciones implica la aceptación de los nuevos términos.
                  La fecha de última actualización se indica al inicio de esta página.
                </p>
              </div>
            </div>

            {/* 13. Contacto */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">13. Contacto</h2>
              </div>

              <div className="text-body-md text-volcanic-600 leading-relaxed">
                <p className="mb-4">
                  Para cualquier consulta relacionada con estos Términos y Condiciones, podés contactarnos por:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Email</p>
                    <p className="text-body-sm text-volcanic-500">
                      <a href="mailto:seismilestextil@gmail.com" className="text-terra-500 hover:underline">seismilestextil@gmail.com</a>
                    </p>
                  </div>
                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">WhatsApp</p>
                    <p className="text-body-sm text-volcanic-500">
                      <a href="https://wa.me/5493834243614" className="text-terra-500 hover:underline">3834-243614</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/politica-de-privacidad"
                className="text-body-sm text-volcanic-500 hover:text-terra-500 transition-colors"
              >
                Política de privacidad
              </Link>
              <span className="hidden sm:block text-volcanic-300">|</span>
              <Link
                href="/cambios-y-devoluciones"
                className="text-body-sm text-volcanic-500 hover:text-terra-500 transition-colors"
              >
                Cambios y devoluciones
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
