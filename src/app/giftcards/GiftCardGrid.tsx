'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createGiftcardCheckout } from '@/actions/giftcard-checkout'
import { MagneticButton } from '@/features/shop/components/MagneticButton'

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}

interface GiftCardDef {
  id: string
  titulo: string
  precio: number
  descripcion: string
  gradient_from: string
  gradient_to: string
  imagen_url: string | null
}

interface GiftCardGridProps {
  cards: GiftCardDef[]
  userId: string | null
}

export function GiftCardGrid({ cards, userId }: GiftCardGridProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleBuy(cardId: string) {
    if (!userId) {
      router.push('/login?redirect=/giftcards')
      return
    }

    setLoadingId(cardId)
    setError(null)

    const result = await createGiftcardCheckout(cardId)

    if (result.error) {
      setError(result.error)
      setLoadingId(null)
      return
    }

    window.location.href = result.initPoint!
  }

  return (
    <>
      {error && (
        <div className="max-w-md mx-auto mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-body-sm text-red-700 text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {cards.map((card, index) => (
          <div key={card.id} data-stagger={index} className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-sand-200/60 hover:shadow-warm-lg transition-all duration-500">
            {/* Card visual */}
            <div
              className="relative aspect-[4/3] p-6 flex flex-col justify-between"
              style={
                card.imagen_url
                  ? undefined
                  : { background: `linear-gradient(135deg, ${card.gradient_from}, ${card.gradient_to})` }
              }
            >
              {card.imagen_url && (
                <>
                  <Image src={card.imagen_url} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                  <div className="absolute inset-0 bg-black/30" />
                </>
              )}
              <div className="relative z-10 flex items-start justify-between">
                <Image
                  src="/images/logo-seismiles-v2.png"
                  alt=""
                  width={80}
                  height={35}
                  className="h-6 w-auto brightness-0 invert opacity-40"
                  aria-hidden
                />
                <GiftIcon className="w-5 h-5 text-white/30" />
              </div>

              <div className="relative z-10">
                <p className="text-body-xs text-white/50 uppercase tracking-widest mb-1">
                  Valor
                </p>
                <p className="font-heading text-display-md text-white leading-none">
                  ${card.precio.toLocaleString('es-AR')}
                </p>
              </div>
            </div>

            {/* Card info */}
            <div className="flex flex-col flex-1 p-6">
              <h3 className="font-heading text-lg text-volcanic-900 mb-2">
                {card.titulo}
              </h3>
              <p className="text-body-sm text-volcanic-500 leading-relaxed mb-6 flex-1">
                {card.descripcion}
              </p>
              <MagneticButton strength={4}>
                <button
                  onClick={() => handleBuy(card.id)}
                  disabled={loadingId !== null}
                  className="w-full py-3 px-4 bg-volcanic-900 hover:bg-volcanic-800 disabled:bg-volcanic-400 text-white text-body-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-warm flex items-center justify-center gap-2"
                >
                  {loadingId === card.id ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Procesando...
                    </>
                  ) : (
                    'Comprar'
                  )}
                </button>
              </MagneticButton>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
