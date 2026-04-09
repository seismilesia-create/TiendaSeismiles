import type { Metadata } from 'next'
import Link from 'next/link'
import { GiftCardDefForm } from '@/features/shop/components/admin/GiftCardDefForm'

export const metadata: Metadata = { title: 'Nueva Gift Card | Admin SEISMILES' }

export default function NewGiftCardPage() {
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
        <span className="text-body-sm text-volcanic-900 font-medium">Nueva</span>
      </div>

      <h1 className="font-heading text-2xl text-volcanic-900 mb-8">Crear gift card</h1>

      <GiftCardDefForm />
    </div>
  )
}
