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

  /** Datos para transferencia bancaria. COMPLETAR con los reales. */
  bank: {
    alias: 'tienda.seismiles', // TODO: alias real de la cuenta
    cbu: '0000003100045524331210', // TODO: CBU/CVU real (dejar '' para ocultarlo en el email)
    titular: 'Maria Pilar David Rojo', // TODO: titular de la cuenta
    banco: 'Mercado Pago', // TODO: nombre del banco (opcional)
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
