import type { Metadata } from 'next'
import { ResultadoContent } from './ResultadoContent'

export const metadata: Metadata = {
  title: 'Resultado del pago | Seismiles Textil',
}

// MP appends these params to back_urls:
// collection_id, collection_status, payment_id, status,
// external_reference, payment_type, merchant_order_id, preference_id

export default async function ResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    collection_status?: string
    payment_id?: string
    collection_id?: string
    external_reference?: string
  }>
}) {
  const params = await searchParams

  // MP sends status in both 'status' and 'collection_status'
  const status = params.collection_status || params.status
  const paymentId = params.payment_id || params.collection_id
  const externalReference = params.external_reference

  return (
    <ResultadoContent
      status={status}
      paymentId={paymentId}
      externalReference={externalReference}
    />
  )
}
