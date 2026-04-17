import type { Metadata } from 'next'
import Link from 'next/link'
import { MarqueeBanner, Navbar, Footer } from '@/features/shop/components'
import { getProductLines } from '@/features/shop/services/product-lines'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Política de Privacidad | SEISMILES Textil',
  description: 'Política de privacidad de SEISMILES Textil. Conocé cómo recopilamos, usamos y protegemos tu información personal.',
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" />
    </svg>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function CookieIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" /><path d="M8.5 8.5v.01" /><path d="M16 15.5v.01" /><path d="M12 12v.01" /><path d="M11 17v.01" /><path d="M7 14v.01" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  )
}

const LAST_UPDATED = '17 de abril de 2026'

export default async function PoliticaPrivacidadPage() {
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
              <ShieldIcon className="w-4 h-4 text-terra-500" />
              <span className="text-body-xs uppercase tracking-widest text-volcanic-600 font-semibold">
                Protección de datos
              </span>
            </div>

            <h1 className="font-heading text-display-lg sm:text-display-xl text-volcanic-900 mb-6">
              Política de Privacidad
            </h1>
            <p className="text-body-lg text-volcanic-500 max-w-2xl mx-auto leading-relaxed">
              En SEISMILES valoramos tu confianza. Acá te explicamos de forma clara y transparente
              cómo recopilamos, usamos y protegemos tu información personal.
            </p>
            <p className="text-body-sm text-volcanic-400 mt-4">
              Última actualización: {LAST_UPDATED}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 lg:py-24 bg-background">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

            {/* 1. Responsable */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <ShieldIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">1. Responsable del tratamiento</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  El responsable del tratamiento de tus datos personales es <strong className="text-volcanic-900">SEISMILES Textil</strong>,
                  con domicilio en San Fernando del Valle de Catamarca, Catamarca, Argentina.
                </p>
                <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                  <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Contacto</p>
                  <p className="text-body-sm text-volcanic-500">
                    Email: <a href="mailto:seismilestextil@gmail.com" className="text-terra-500 hover:underline">seismilestextil@gmail.com</a><br />
                    WhatsApp: <a href="https://wa.me/5493834243614" className="text-terra-500 hover:underline">3834-243614</a>
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Datos que recopilamos */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <DatabaseIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">2. Datos que recopilamos</h2>
              </div>

              <div className="space-y-5 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Dependiendo de cómo interactúes con nuestra tienda, podemos recopilar los siguientes datos:
                </p>

                <div className="space-y-4">
                  <div className="border-l-2 border-terra-500 pl-4">
                    <p className="text-body-sm font-semibold text-volcanic-900">Registro de cuenta</p>
                    <p className="text-body-sm text-volcanic-500 mt-1">
                      Dirección de correo electrónico y contraseña (almacenada de forma encriptada).
                      También podés registrarte mediante tu cuenta de Google; en ese caso, recibimos
                      tu nombre y dirección de email asociada a tu cuenta de Google, sin acceder a
                      tu contraseña de Google ni a otros datos de tu cuenta.
                    </p>
                  </div>

                  <div className="border-l-2 border-terra-500 pl-4">
                    <p className="text-body-sm font-semibold text-volcanic-900">Compras</p>
                    <p className="text-body-sm text-volcanic-500 mt-1">
                      Datos necesarios para procesar tu pedido y pago a través de Mercado Pago.
                      SEISMILES no almacena datos de tarjetas de crédito ni información bancaria;
                      estos son gestionados directamente por Mercado Pago bajo sus propias políticas de seguridad.
                    </p>
                  </div>

                  <div className="border-l-2 border-terra-500 pl-4">
                    <p className="text-body-sm font-semibold text-volcanic-900">Newsletter</p>
                    <p className="text-body-sm text-volcanic-500 mt-1">
                      Dirección de correo electrónico, para enviarte novedades, promociones y tu cupón de bienvenida.
                    </p>
                  </div>

                  <div className="border-l-2 border-terra-500 pl-4">
                    <p className="text-body-sm font-semibold text-volcanic-900">Formulario de arrepentimiento</p>
                    <p className="text-body-sm text-volcanic-500 mt-1">
                      Nombre y apellido, DNI, correo electrónico y teléfono, según lo exige
                      la <strong className="text-volcanic-900">Resolución 424/2020</strong> de la Secretaría de Comercio Interior.
                    </p>
                  </div>

                  <div className="border-l-2 border-terra-500 pl-4">
                    <p className="text-body-sm font-semibold text-volcanic-900">Navegación</p>
                    <p className="text-body-sm text-volcanic-500 mt-1">
                      Información técnica como dirección IP, tipo de navegador, dispositivo y páginas visitadas,
                      recopilada de forma automática con fines analíticos y de mejora del servicio.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Finalidad */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">3. Finalidad del tratamiento</h2>
              </div>

              <div className="text-body-md text-volcanic-600 leading-relaxed">
                <p className="mb-4">Utilizamos tus datos personales para:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Procesar y gestionar tus compras y pedidos.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Enviarte confirmaciones de compra, actualizaciones de pedido y comunicaciones transaccionales.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Gestionar tu cuenta de usuario en la tienda online.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Enviarte novedades, promociones y contenido relevante si te suscribiste al newsletter (siempre con posibilidad de desuscripción).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Gestionar solicitudes de cambios, devoluciones y arrepentimiento.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Mejorar nuestro sitio web y la experiencia de compra.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Cumplir con obligaciones legales y regulatorias vigentes.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 4. Comunicaciones comerciales */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <MailIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">4. Comunicaciones comerciales</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Si te suscribiste a nuestro newsletter, recibirás emails con novedades, promociones y contenido de la marca.
                </p>
                <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                  <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Desuscripción</p>
                  <p className="text-body-sm text-volcanic-500">
                    Podes darte de baja en cualquier momento haciendo clic en el enlace de desuscripción
                    que figura al pie de cada email, o contactándonos directamente.
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Compartir datos con terceros */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <LockIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">5. Terceros y servicios externos</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  No vendemos, alquilamos ni compartimos tu información personal con terceros con fines comerciales.
                  Solo compartimos datos con los siguientes prestadores de servicio, estrictamente necesarios para el funcionamiento de la tienda:
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Mercado Pago</p>
                    <p className="text-body-sm text-volcanic-500">
                      Procesamiento de pagos. Los datos financieros son gestionados íntegramente por Mercado Pago.
                    </p>
                  </div>

                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Supabase</p>
                    <p className="text-body-sm text-volcanic-500">
                      Almacenamiento seguro de datos de cuenta y pedidos, con encriptación y políticas de acceso.
                    </p>
                  </div>

                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Resend</p>
                    <p className="text-body-sm text-volcanic-500">
                      Envío de emails transaccionales (confirmación de compra, newsletter).
                    </p>
                  </div>

                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Vercel</p>
                    <p className="text-body-sm text-volcanic-500">
                      Hosting del sitio web. Puede recopilar datos técnicos de navegación (IP, user agent).
                    </p>
                  </div>

                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Google (inicio de sesión)</p>
                    <p className="text-body-sm text-volcanic-500">
                      Si elegís registrarte o iniciar sesión con Google, se utiliza el servicio OAuth de Google
                      para autenticar tu identidad. Solo recibimos tu nombre y email; no accedemos a tu
                      contraseña de Google ni a otros datos de tu cuenta. El uso de la información recibida
                      de las APIs de Google cumple con la{' '}
                      <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-terra-500 hover:underline">
                        Política de Datos de Usuario de los Servicios de API de Google
                      </a>,
                      incluyendo los requisitos de Uso Limitado.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Uso de datos obtenidos de Google */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <ShieldIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">6. Uso de datos obtenidos de Google</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Nuestra aplicación ofrece la opción de iniciar sesión a través de Google OAuth.
                  Al hacerlo, solicitamos acceso únicamente a tu <strong className="text-volcanic-900">nombre</strong> y{' '}
                  <strong className="text-volcanic-900">dirección de correo electrónico</strong> asociados a tu cuenta de Google.
                </p>

                <div className="rounded-xl bg-volcanic-900 text-white p-5">
                  <p className="text-body-xs uppercase tracking-widest text-terra-400 font-semibold mb-2">
                    Cumplimiento de la Política de Uso Limitado de Google
                  </p>
                  <p className="text-body-sm text-white/70">
                    El uso y la transferencia a cualquier otra aplicación de la información recibida de las
                    APIs de Google se adhieren a la{' '}
                    <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-terra-400 hover:underline">
                      Política de Datos de Usuario de los Servicios de API de Google
                    </a>,
                    incluyendo los requisitos de Uso Limitado.
                  </p>
                </div>

                <p>En particular:</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Solo usamos los datos de Google para autenticar tu identidad y crear o vincular tu cuenta en nuestra tienda.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>No compartimos los datos obtenidos de Google con terceros, salvo cuando sea necesario para el funcionamiento del servicio (por ejemplo, el almacenamiento seguro de tu cuenta).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>No utilizamos los datos de Google para publicidad, creación de perfiles publicitarios ni para fines no relacionados con la funcionalidad de nuestra aplicación.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>No permitimos que personas o procesos automatizados accedan a los datos de Google para fines no autorizados.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 7. Cookies */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <CookieIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">7. Cookies</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Nuestro sitio utiliza cookies esenciales para el correcto funcionamiento de la tienda
                  (sesión de usuario, carrito de compras). También podemos utilizar cookies analíticas
                  para entender cómo se usa el sitio y mejorar la experiencia.
                </p>
                <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                  <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Gestión de cookies</p>
                  <p className="text-body-sm text-volcanic-500">
                    Podes configurar tu navegador para rechazar o eliminar cookies en cualquier momento.
                    Tené en cuenta que desactivar las cookies esenciales puede afectar el funcionamiento del sitio.
                  </p>
                </div>
              </div>
            </div>

            {/* 8. Seguridad */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <LockIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">8. Seguridad de los datos</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Implementamos medidas técnicas y organizativas para proteger tu información personal:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Conexión segura mediante protocolo HTTPS/SSL en todo el sitio.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Contraseñas almacenadas con encriptación (nunca en texto plano).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Políticas de acceso restringido a la base de datos (Row Level Security).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span>Datos de pago procesados exclusivamente por Mercado Pago, sin pasar por nuestros servidores.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 9. Derechos del usuario */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">9. Tus derechos</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  De acuerdo con la <strong className="text-volcanic-900">Ley 25.326 de Protección de Datos Personales</strong> y
                  sus normas complementarias, tenés derecho a:
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Acceso</p>
                    <p className="text-body-sm text-volcanic-500">
                      Solicitar información sobre qué datos personales tuyos tenemos almacenados.
                    </p>
                  </div>

                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Rectificación</p>
                    <p className="text-body-sm text-volcanic-500">
                      Pedir la corrección de datos inexactos o incompletos.
                    </p>
                  </div>

                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Supresión</p>
                    <p className="text-body-sm text-volcanic-500">
                      Solicitar la eliminación de tus datos personales de nuestros registros.
                    </p>
                  </div>

                  <div className="rounded-xl bg-sand-50 border border-sand-200 p-4">
                    <p className="text-body-sm font-semibold text-volcanic-900 mb-1">Oposición</p>
                    <p className="text-body-sm text-volcanic-500">
                      Oponerte al tratamiento de tus datos para determinadas finalidades.
                    </p>
                  </div>
                </div>

                <p>
                  Para ejercer cualquiera de estos derechos, escribinos a{' '}
                  <a href="mailto:seismilestextil@gmail.com" className="text-terra-500 hover:underline">seismilestextil@gmail.com</a>{' '}
                  o por WhatsApp al <a href="https://wa.me/5493834243614" className="text-terra-500 hover:underline">3834-243614</a>.
                  Responderemos tu solicitud en un plazo máximo de 10 días hábiles.
                </p>

                <div className="rounded-xl bg-volcanic-900 text-white p-5">
                  <p className="text-body-xs uppercase tracking-widest text-terra-400 font-semibold mb-2">Autoridad de control</p>
                  <p className="text-body-sm text-white/70">
                    La Agencia de Acceso a la Información Pública (AAIP) es el órgano de control
                    de la Ley 25.326. Podés presentar un reclamo ante la AAIP si considerás que
                    tus derechos no fueron debidamente atendidos.
                  </p>
                </div>
              </div>
            </div>

            {/* 10. Conservación */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <TrashIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">10. Conservación de datos</h2>
              </div>

              <div className="space-y-4 text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Conservamos tus datos personales durante el tiempo necesario para cumplir con las finalidades
                  descritas en esta política y con las obligaciones legales aplicables. En particular:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span><strong className="text-volcanic-900">Datos de cuenta:</strong> mientras tu cuenta esté activa, o hasta que solicites su eliminación.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span><strong className="text-volcanic-900">Datos de compra:</strong> por el plazo que exija la normativa fiscal y comercial vigente.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-terra-500 shrink-0" />
                    <span><strong className="text-volcanic-900">Newsletter:</strong> hasta que te desuscribas.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 11. Menores */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <ShieldIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">11. Menores de edad</h2>
              </div>

              <div className="text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Nuestros servicios están dirigidos a personas mayores de 18 años.
                  No recopilamos intencionalmente datos de menores de edad.
                  Si tomamos conocimiento de que hemos recibido datos de un menor sin el consentimiento
                  de su representante legal, procederemos a eliminarlos de forma inmediata.
                </p>
              </div>
            </div>

            {/* 12. Cambios */}
            <div className="rounded-2xl bg-white border border-sand-200 p-6 lg:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-terra-500/10 flex items-center justify-center">
                  <DatabaseIcon className="w-5 h-5 text-terra-500" />
                </div>
                <h2 className="font-heading text-display-xs text-volcanic-900">12. Modificaciones</h2>
              </div>

              <div className="text-body-md text-volcanic-600 leading-relaxed">
                <p>
                  Nos reservamos el derecho de actualizar esta política de privacidad para reflejar
                  cambios en nuestras prácticas o en la normativa aplicable. Cuando realicemos
                  modificaciones relevantes, actualizaremos la fecha de &quot;Última actualización&quot;
                  al inicio de esta página. Te recomendamos revisarla periódicamente.
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/cambios-y-devoluciones"
                className="text-body-sm text-volcanic-500 hover:text-terra-500 transition-colors"
              >
                Cambios y devoluciones
              </Link>
              <span className="hidden sm:block text-volcanic-300">|</span>
              <Link
                href="/arrepentimiento"
                className="text-body-sm text-volcanic-500 hover:text-terra-500 transition-colors"
              >
                Botón de arrepentimiento
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
