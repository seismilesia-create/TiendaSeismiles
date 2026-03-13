import Image from 'next/image'
import type { OrderDetail } from '@/features/shop/services/orders'

interface Props {
  order: OrderDetail
}

export function OrderProductCard({ order }: Props) {
  return (
    <div className="rounded-2xl bg-white border border-sand-200/60 overflow-hidden">
      <div className="p-5 lg:p-6 border-b border-sand-200/60">
        <h3 className="font-heading text-lg text-volcanic-900">Detalle del producto</h3>
      </div>

      <div className="p-5 lg:p-6">
        <div className="flex gap-4 sm:gap-6">
          {/* Product image */}
          <div className="relative w-24 h-28 sm:w-32 sm:h-36 rounded-xl overflow-hidden bg-sand-100 shrink-0">
            {order.imagen_url ? (
              <Image
                src={order.imagen_url}
                alt={order.producto.nombre}
                fill
                className="object-cover"
                sizes="128px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-volcanic-300"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-body-md font-semibold text-volcanic-900 mb-2">
              {order.producto.nombre}
            </h4>

            <div className="space-y-1.5">
              {order.color && (
                <div className="flex items-center gap-2">
                  <span className="text-body-xs text-volcanic-500">Color:</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-sand-200"
                      style={{ backgroundColor: order.color.hex }}
                    />
                    <span className="text-body-sm text-volcanic-700">{order.color.nombre}</span>
                  </div>
                </div>
              )}

              {order.talle && (
                <div className="flex items-center gap-2">
                  <span className="text-body-xs text-volcanic-500">Talle:</span>
                  <span className="text-body-sm font-medium text-volcanic-700">{order.talle}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-body-xs text-volcanic-500">Cantidad:</span>
                <span className="text-body-sm text-volcanic-700">{order.cantidad}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-body-xs text-volcanic-500">Precio unitario:</span>
                <span className="text-body-sm text-volcanic-700">${order.precio_unitario.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="mt-5 pt-4 border-t border-sand-200/60 flex items-center justify-between">
          <span className="text-body-sm text-volcanic-500">Total del pedido</span>
          <span className="font-heading text-xl text-volcanic-900">
            ${order.total.toLocaleString('es-AR')}
          </span>
        </div>
      </div>
    </div>
  )
}
