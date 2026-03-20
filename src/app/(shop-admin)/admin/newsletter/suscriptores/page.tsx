import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllSubscribers } from '@/features/shop/services/newsletter'
import { SubscribersTable } from '@/features/shop/components/admin/SubscribersTable'

export const metadata: Metadata = { title: 'Suscriptores | Admin Seismiles' }

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
  )
}

export default async function SubscribersPage() {
  const subscribers = await getAllSubscribers()
  const active = subscribers.filter((s) => s.is_active).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/newsletter"
            className="inline-flex items-center gap-1.5 text-body-xs text-volcanic-400 hover:text-volcanic-600 transition-colors mb-2"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Newsletter
          </Link>
          <h1 className="font-heading text-2xl text-volcanic-900">Suscriptores</h1>
          <p className="text-body-sm text-volcanic-500 mt-1">
            {subscribers.length} suscriptor{subscribers.length !== 1 ? 'es' : ''} · {active} activo{active !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-sand-200/60 p-6">
        <SubscribersTable subscribers={subscribers} />
      </div>
    </div>
  )
}
