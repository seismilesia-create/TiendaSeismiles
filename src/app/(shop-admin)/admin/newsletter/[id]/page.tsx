import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCampaign } from '@/features/shop/services/newsletter'
import { CampaignForm } from '@/features/shop/components/admin/CampaignForm'

export const metadata: Metadata = { title: 'Editar Campana | Admin Seismiles' }

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const campaign = await getCampaign(id)

  if (!campaign) notFound()

  // Sent campaigns are read-only
  if (campaign.status !== 'draft') {
    return (
      <div>
        <div className="mb-8">
          <h1 className="font-heading text-2xl text-volcanic-900">Campana enviada</h1>
          <p className="text-body-sm text-volcanic-500 mt-1">
            Enviada a {campaign.recipients_count} suscriptor{campaign.recipients_count !== 1 ? 'es' : ''}
            {campaign.sent_at && ` el ${new Date(campaign.sent_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}`}
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-sand-200/60 p-6 lg:p-8 space-y-5">
          <div>
            <p className="text-body-xs text-volcanic-500 uppercase tracking-wider font-semibold mb-1">Asunto</p>
            <p className="text-body-sm font-semibold text-volcanic-900">{campaign.subject}</p>
          </div>
          <div>
            <p className="text-body-xs text-volcanic-500 uppercase tracking-wider font-semibold mb-1">Contenido</p>
            <div className="w-full px-4 py-3 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm whitespace-pre-wrap font-mono">
              {campaign.content}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-volcanic-900">Editar campana</h1>
        <p className="text-body-sm text-volcanic-500 mt-1">
          Modifica el borrador antes de enviarlo
        </p>
      </div>

      <CampaignForm campaign={campaign} />
    </div>
  )
}
