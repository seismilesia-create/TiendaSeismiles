import type { Metadata } from 'next'
import { FaqItemForm } from '@/features/shop/components/admin/FaqItemForm'

export const metadata: Metadata = { title: 'Nueva FAQ | Admin SEISMILES' }

export default function AdminFaqNewPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl text-volcanic-900">Nueva pregunta frecuente</h1>
        <p className="text-body-sm text-volcanic-500 mt-1">
          Agrega una nueva pregunta y respuesta que se mostrara en la pagina de FAQ.
        </p>
      </div>

      <FaqItemForm />
    </div>
  )
}
