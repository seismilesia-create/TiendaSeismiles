import type { Metadata } from 'next'
import { ResultadoGiftcard } from './ResultadoGiftcard'

export const metadata: Metadata = {
  title: 'Resultado Gift Card | Seismiles Textil',
}

export default async function ResultadoGiftcardPage({
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

  const status = params.collection_status || params.status
  const paymentId = params.payment_id || params.collection_id
  const externalReference = params.external_reference

  return (
    <ResultadoGiftcard
      status={status}
      paymentId={paymentId}
      externalReference={externalReference}
    />
  )
}
