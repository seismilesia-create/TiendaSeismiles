import type { Metadata } from 'next'
import Link from 'next/link'
import { getCampaigns, getSubscriberStats } from '@/features/shop/services/newsletter'
import { CampaignsTable } from '@/features/shop/components/admin/CampaignsTable'

export const metadata: Metadata = { title: 'Newsletter | Admin SEISMILES' }

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
  )
}

export default async function AdminNewsletterPage() {
  const [campaigns, stats] = await Promise.all([getCampaigns(), getSubscriberStats()])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl text-volcanic-900">Newsletter</h1>
          <p className="text-body-sm text-volcanic-500 mt-1">
            Envia campanas de email a tus suscriptores
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/newsletter/suscriptores"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sand-100 hover:bg-sand-200 text-volcanic-700 text-body-sm font-semibold rounded-xl transition-all"
          >
            <UsersIcon className="w-4 h-4" />
            Suscriptores
          </Link>
          <Link
            href="/admin/newsletter/nuevo"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-all duration-300"
          >
            <PlusIcon className="w-4 h-4" />
            Nueva campana
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl bg-white border border-sand-200/60 p-5">
          <p className="text-body-xs text-volcanic-500 uppercase tracking-wider font-semibold mb-1">Total suscriptores</p>
          <p className="text-2xl font-heading text-volcanic-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl bg-white border border-sand-200/60 p-5">
          <p className="text-body-xs text-volcanic-500 uppercase tracking-wider font-semibold mb-1">Activos</p>
          <p className="text-2xl font-heading text-emerald-600">{stats.active}</p>
        </div>
        <div className="rounded-2xl bg-white border border-sand-200/60 p-5">
          <p className="text-body-xs text-volcanic-500 uppercase tracking-wider font-semibold mb-1">Desuscritos</p>
          <p className="text-2xl font-heading text-volcanic-400">{stats.inactive}</p>
        </div>
      </div>

      {/* Campaigns table */}
      <div className="rounded-2xl bg-white border border-sand-200/60 p-6">
        <h2 className="text-body-sm font-semibold text-volcanic-900 mb-4">
          Campanas ({campaigns.length})
        </h2>
        <CampaignsTable campaigns={campaigns} />
      </div>
    </div>
  )
}
