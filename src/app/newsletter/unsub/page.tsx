import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Desuscripcion | SEISMILES Textil' }

const MESSAGES: Record<string, { heading: string; body: string }> = {
  success: {
    heading: 'Te desuscribiste exitosamente',
    body: 'No vas a recibir mas emails de nuestro newsletter. Si fue un error, podes volver a suscribirte desde nuestra pagina.',
  },
  already: {
    heading: 'Ya estabas desuscrito',
    body: 'Tu email ya no recibe emails de nuestro newsletter.',
  },
  invalid: {
    heading: 'Enlace invalido',
    body: 'El enlace de desuscripcion es invalido o ya expiro.',
  },
}

export default async function UnsubPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const msg = MESSAGES[status ?? ''] ?? MESSAGES.invalid

  return (
    <div className="min-h-screen bg-sand-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl bg-white border border-sand-200/60 p-8 text-center">
        <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-volcanic-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-volcanic-500">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        <h1 className="font-heading text-xl text-volcanic-900 mb-3">
          {msg.heading}
        </h1>
        <p className="text-body-sm text-volcanic-500 leading-relaxed mb-8">
          {msg.body}
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-all"
        >
          Ir a la tienda
        </Link>
      </div>
    </div>
  )
}
