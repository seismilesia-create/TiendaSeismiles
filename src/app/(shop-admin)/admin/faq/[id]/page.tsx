import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminFaq } from '@/features/shop/services/faq'
import { FaqItemForm } from '@/features/shop/components/admin/FaqItemForm'

export const metadata: Metadata = { title: 'Editar FAQ | Admin SEISMILES' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminFaqEditPage({ params }: Props) {
  const { id } = await params
  const faq = await getAdminFaq(id)

  if (!faq) notFound()

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-volcanic-900">Editar pregunta frecuente</h1>
        <p className="text-body-sm text-volcanic-500 mt-1">
          Modifica la pregunta y respuesta.
        </p>
      </div>

      <FaqItemForm faq={faq} />
    </div>
  )
}
