import type { Metadata } from 'next'
import { CampaignForm } from '@/features/shop/components/admin/CampaignForm'

export const metadata: Metadata = { title: 'Nueva Campana | Admin SEISMILES' }

export default function NuevaCampanaPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-volcanic-900">Nueva campana</h1>
        <p className="text-body-sm text-volcanic-500 mt-1">
          Compone un email para enviar a todos los suscriptores activos
        </p>
      </div>

      <CampaignForm />
    </div>
  )
}
