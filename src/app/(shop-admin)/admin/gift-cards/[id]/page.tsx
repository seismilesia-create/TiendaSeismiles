import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGiftCardDefinition } from '@/features/shop/services/admin-gift-cards'
import { GiftCardDefForm } from '@/features/shop/components/admin/GiftCardDefForm'

export const metadata: Metadata = { title: 'Editar Gift Card | Admin SEISMILES' }

export default async function EditGiftCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const def = await getGiftCardDefinition(id)

  if (!def) notFound()

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/gift-cards"
          className="text-body-sm text-volcanic-500 hover:text-terra-500 transition-colors"
        >
          Gift Cards
        </Link>
        <span className="text-volcanic-300">/</span>
        <span className="text-body-sm text-volcanic-900 font-medium">{def.titulo}</span>
      </div>

      <h1 className="font-heading text-2xl text-volcanic-900 mb-8">Editar gift card</h1>

      <GiftCardDefForm existing={def} />
    </div>
  )
}
