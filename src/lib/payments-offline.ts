// ============================================================
// Pagos OFFLINE — Efectivo (retiro en local) y Transferencia
// ------------------------------------------------------------
// Estos métodos no usan proveedor externo (sin redirect ni webhook).
// El pedido queda en 'pendiente_pago' y un admin lo confirma a mano
// desde /admin/pedidos cuando recibe el efectivo o el comprobante.
//
// ⚠️  COMPLETAR con los datos reales del banco antes de habilitar
//     transferencia en producción (alias / CBU / titular).
// ============================================================

export const OFFLINE_PAYMENT_INFO = {
  /** Link de WhatsApp para enviar el comprobante / coordinar el retiro. */
  whatsapp: 'https://wa.me/5493834243614',
  whatsappDisplay: '+54 9 3834 24-3614',

  /** Datos para transferencia bancaria. Solo alias y CBU (sin titular/banco). */
  bank: {
    alias: 'tienda.seismiles',
    cbu: '0000003100045524331210',
  },

  /** Info para retiro en el local con pago en efectivo. */
  pickup: {
    // El momento/lugar exacto se coordina por WhatsApp al confirmar el pedido.
    zona: 'Catamarca capital',
  },
} as const

export type OfflinePaymentMethod = 'efectivo' | 'transferencia'

export function isOfflinePaymentMethod(value: unknown): value is OfflinePaymentMethod {
  return value === 'efectivo' || value === 'transferencia'
}
