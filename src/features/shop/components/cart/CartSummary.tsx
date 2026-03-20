'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/features/shop/stores/cart-store'
import { createCheckout } from '@/actions/checkout'
import { validateGiftCardCode } from '@/actions/giftcard-redeem'
import { validateCouponCode } from '@/actions/coupons'

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  )
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
    </svg>
  )
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  )
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
  )
}

interface CartSummaryProps {
  userId: string | null
}

export function CartSummary({ userId }: CartSummaryProps) {
  const items = useCartStore((s) => s.items)
  const getTotalItems = useCartStore((s) => s.getTotalItems)
  const getTotalPrice = useCartStore((s) => s.getTotalPrice)
  const setPendingOrderRef = useCartStore((s) => s.setPendingOrderRef)
  const appliedGiftCards = useCartStore((s) => s.appliedGiftCards)
  const applyGiftCard = useCartStore((s) => s.applyGiftCard)
  const removeGiftCard = useCartStore((s) => s.removeGiftCard)
  const appliedCoupon = useCartStore((s) => s.appliedCoupon)
  const applyCoupon = useCartStore((s) => s.applyCoupon)
  const removeCoupon = useCartStore((s) => s.removeCoupon)
  const clearCart = useCartStore((s) => s.clearCart)
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gcCode, setGcCode] = useState('')
  const [gcLoading, setGcLoading] = useState(false)
  const [gcError, setGcError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  // 1. Coupon discount (applied on subtotal)
  const descuentoCupon = appliedCoupon
    ? (appliedCoupon.tipo === 'porcentaje'
        ? Math.round(totalPrice * appliedCoupon.valor / 100)
        : Math.min(appliedCoupon.valor, totalPrice))
    : 0
  const subtotalDespuesCupon = totalPrice - descuentoCupon

  // 2. Gift card discounts (applied on remaining after coupon)
  let remaining = subtotalDespuesCupon
  const gcDescuentos = appliedGiftCards.map((gc) => {
    const d = Math.min(gc.saldo, remaining)
    remaining -= d
    return d
  })
  const descuentoGcTotal = gcDescuentos.reduce((sum, d) => sum + d, 0)
  const saldoSobrante = appliedGiftCards.reduce((sum, gc) => sum + gc.saldo, 0) - descuentoGcTotal
  const totalFinal = subtotalDespuesCupon - descuentoGcTotal
  const cuotas = totalFinal > 0 ? Math.round(totalFinal / 3) : 0

  async function handleApplyCoupon() {
    const code = couponCode.trim().toUpperCase()
    if (!code) return

    setCouponLoading(true)
    setCouponError(null)

    const result = await validateCouponCode(code, totalPrice)

    if (!result.valid) {
      setCouponError(result.error ?? 'Codigo invalido')
      setCouponLoading(false)
      return
    }

    applyCoupon({
      code,
      couponId: result.couponId!,
      tipo: result.tipo!,
      valor: result.valor!,
      descuento: result.descuento!,
    })
    setCouponCode('')
    setCouponLoading(false)
  }

  async function handleApplyGiftCard() {
    const code = gcCode.trim().toUpperCase()
    if (!code) return

    if (appliedGiftCards.some((g) => g.code === code)) {
      setGcError('Esta gift card ya esta aplicada')
      return
    }

    setGcLoading(true)
    setGcError(null)

    const result = await validateGiftCardCode(gcCode)

    if (!result.valid) {
      setGcError(result.error ?? 'Codigo invalido')
      setGcLoading(false)
      return
    }

    applyGiftCard({
      code,
      giftCardId: result.giftCardId!,
      saldo: result.saldo_restante!,
      titulo: result.titulo!,
    })
    setGcCode('')
    setGcLoading(false)
  }

  async function handleCheckout() {
    if (!userId) {
      router.push('/login?redirect=/carrito')
      return
    }

    setLoading(true)
    setError(null)

    const checkoutItems = items.map((i) => ({
      variantId: i.variantId,
      productId: i.productId,
      productName: i.productName,
      cantidad: i.cantidad,
      precio: i.precio,
    }))

    const codes = appliedGiftCards.length > 0
      ? appliedGiftCards.map((g) => g.code)
      : undefined

    const result = await createCheckout(checkoutItems, codes, appliedCoupon?.code)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // If gift cards covered the full amount, order was confirmed directly
    if (result.directConfirm) {
      clearCart()
      router.push('/carrito/resultado?collection_status=approved&direct=gc')
      return
    }

    // Save reference to verify payment when user returns
    if (result.externalRef) {
      setPendingOrderRef(result.externalRef)
    }

    // Redirect to Mercado Pago hosted checkout
    window.location.href = result.initPoint!
  }

  return (
    <div className="bg-white rounded-2xl border border-sand-200/60 p-5 lg:p-6">
      <h3 className="font-heading text-lg text-volcanic-900 mb-5">Resumen del pedido</h3>

      <div className="space-y-3 text-body-sm">
        <div className="flex items-center justify-between">
          <span className="text-volcanic-500">
            Subtotal ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
          </span>
          <span className="font-semibold text-volcanic-900 tabular-nums">
            ${totalPrice.toLocaleString('es-AR')}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-volcanic-500">Envio</span>
          <span className="font-semibold text-emerald-600">Gratis</span>
        </div>
      </div>

      {/* ─── Coupon Section ─── */}
      <div className="border-t border-sand-200 my-4" />

      {/* Applied coupon */}
      {appliedCoupon && (
        <div className="flex items-center justify-between p-3 bg-violet-50 border border-violet-200 rounded-xl mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <TagIcon className="w-4 h-4 text-violet-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-body-xs font-semibold text-violet-700 truncate">
                {appliedCoupon.code}
              </p>
              <p className="text-body-xs text-violet-600">
                {appliedCoupon.tipo === 'porcentaje'
                  ? `${appliedCoupon.valor}% de descuento`
                  : `$${appliedCoupon.valor.toLocaleString('es-AR')} de descuento`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-body-sm font-semibold text-violet-700 tabular-nums">
              -${descuentoCupon.toLocaleString('es-AR')}
            </span>
            <button
              onClick={removeCoupon}
              className="p-1 text-violet-500 hover:text-red-500 transition-colors"
              title="Quitar cupon"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Coupon input */}
      {!appliedCoupon && (
        <div className="mb-4">
          <label className="flex items-center gap-1.5 text-body-xs font-medium text-volcanic-600 mb-2">
            <TagIcon className="w-3.5 h-3.5" />
            Codigo de descuento
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase())
                if (couponError) setCouponError(null)
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon() } }}
              placeholder="Ej: INVIERNO20"
              className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-sm uppercase tracking-wider focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all placeholder:text-volcanic-300 placeholder:normal-case placeholder:tracking-normal"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading || !couponCode.trim()}
              className="px-4 py-2.5 bg-volcanic-900 hover:bg-volcanic-800 disabled:bg-volcanic-300 text-white text-body-xs font-semibold rounded-xl transition-colors shrink-0"
            >
              {couponLoading ? '...' : 'Aplicar'}
            </button>
          </div>
          {couponError && (
            <p className="mt-1.5 text-body-xs text-red-600">{couponError}</p>
          )}
        </div>
      )}

      {/* ─── Gift Card Section ─── */}
      <div className="border-t border-sand-200 my-4" />

      {/* Applied gift cards */}
      {appliedGiftCards.length > 0 && (
        <div className="space-y-2 mb-3">
          {appliedGiftCards.map((gc, i) => (
            <div key={gc.code} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <GiftIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-body-xs font-semibold text-emerald-700 truncate">
                    {gc.code}
                  </p>
                  <p className="text-body-xs text-emerald-600">
                    Saldo: ${gc.saldo.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-body-sm font-semibold text-emerald-700 tabular-nums">
                  -${gcDescuentos[i].toLocaleString('es-AR')}
                </span>
                <button
                  onClick={() => removeGiftCard(gc.code)}
                  className="p-1 text-emerald-500 hover:text-red-500 transition-colors"
                  title="Quitar gift card"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GC code input — always visible to allow adding more */}
      <div className="mb-4">
        <label className="flex items-center gap-1.5 text-body-xs font-medium text-volcanic-600 mb-2">
          <GiftIcon className="w-3.5 h-3.5" />
          {appliedGiftCards.length > 0 ? 'Agregar otra Gift Card' : 'Codigo de Gift Card'}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={gcCode}
            onChange={(e) => {
              // Strip everything except alphanumeric
              const raw = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
              // Auto-format: GC-XXXX-XXXX
              let formatted = raw
              if (raw.length > 2) {
                formatted = raw.slice(0, 2) + '-' + raw.slice(2)
              }
              if (raw.length > 6) {
                formatted = raw.slice(0, 2) + '-' + raw.slice(2, 6) + '-' + raw.slice(6, 10)
              }
              setGcCode(formatted)
            }}
            maxLength={12}
            placeholder="GC-XXXX-XXXX"
            className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-sm font-mono uppercase tracking-wider focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all placeholder:text-volcanic-300"
          />
          <button
            onClick={handleApplyGiftCard}
            disabled={gcLoading || !gcCode.trim()}
            className="px-4 py-2.5 bg-volcanic-900 hover:bg-volcanic-800 disabled:bg-volcanic-300 text-white text-body-xs font-semibold rounded-xl transition-colors shrink-0"
          >
            {gcLoading ? '...' : 'Aplicar'}
          </button>
        </div>
        {gcError && (
          <p className="mt-1.5 text-body-xs text-red-600">{gcError}</p>
        )}
      </div>

      <div className="border-t border-sand-200 my-4" />

      <div className="flex items-center justify-between mb-1">
        <span className="text-body-md font-semibold text-volcanic-900">Total</span>
        <div className="text-right">
          {(descuentoCupon > 0 || descuentoGcTotal > 0) && (
            <span className="text-body-xs text-volcanic-500 line-through tabular-nums mr-2">
              ${totalPrice.toLocaleString('es-AR')}
            </span>
          )}
          <span className="text-body-lg font-bold text-volcanic-900 tabular-nums">
            ${totalFinal.toLocaleString('es-AR')}
          </span>
        </div>
      </div>
      {totalFinal > 0 ? (
        <p className="text-body-xs text-volcanic-500 mb-6">
          3 cuotas sin interes de ${cuotas.toLocaleString('es-AR')}
        </p>
      ) : (
        <p className="text-body-xs text-emerald-600 font-medium mb-6">
          {descuentoGcTotal > 0
            ? `Cubierto con ${appliedCoupon ? 'descuento + ' : ''}Gift Card${appliedGiftCards.length > 1 ? 's' : ''}`
            : 'Cubierto con descuento'}
        </p>
      )}

      {saldoSobrante > 0 && (
        <div className="mb-5 flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <GiftIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-body-xs text-amber-700">
            Te quedan <span className="font-semibold">${saldoSobrante.toLocaleString('es-AR')}</span> de saldo sin usar. Podes volver a canjear tu gift card en tu proxima compra.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-body-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-4 bg-volcanic-900 hover:bg-volcanic-800 disabled:bg-volcanic-400 text-white text-body-md font-semibold rounded-xl transition-colors mb-3"
      >
        {loading ? (
          <>
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Procesando...
          </>
        ) : (
          <>
            {totalFinal > 0 ? (
              <>
                <CreditCardIcon className="w-5 h-5" />
                {userId ? 'Pagar con Mercado Pago' : 'Ingresar para comprar'}
              </>
            ) : (
              <>
                <GiftIcon className="w-5 h-5" />
                {userId ? 'Confirmar pedido' : 'Ingresar para comprar'}
              </>
            )}
          </>
        )}
      </button>

      <Link
        href="/catalogo"
        className="w-full flex items-center justify-center py-3.5 border border-sand-200 text-volcanic-700 hover:text-terra-500 hover:border-terra-500/30 text-body-sm font-medium rounded-xl transition-colors"
      >
        Seguir comprando
      </Link>

      <div className="flex items-center gap-2 mt-5 pt-5 border-t border-sand-200">
        <ShieldIcon className="w-4 h-4 text-terra-500 shrink-0" />
        <p className="text-body-xs text-volcanic-500">
          Compra segura · Envio gratis · Cambios por 30 dias
        </p>
      </div>
    </div>
  )
}
