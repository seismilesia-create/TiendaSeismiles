import type { Metadata } from 'next'
import { getArrepentimientos } from '@/features/shop/services/arrepentimientos'
import { ArrepentimientosTable } from '@/features/shop/components/admin/ArrepentimientosTable'

export const metadata: Metadata = {
  title: 'Arrepentimientos - Admin',
}

export default async function ArrepentimientosPage() {
  const items = await getArrepentimientos(200)
  const pendientes = items.filter((i) => i.estado === 'pendiente').length

  return (
    <>
      <div className="mb-8">
        <h1 className="font-heading text-display-xs text-volcanic-900 mb-2">
          Boton de Arrepentimiento
        </h1>
        <p className="text-body-sm text-volcanic-500">
          Solicitudes recibidas via el formulario publico. Plazo legal de respuesta:{' '}
          <strong>24 horas habiles</strong> (Res. 424/2020).
          {pendientes > 0 && (
            <>
              {' '}Hay <strong className="text-terra-600">{pendientes} pendiente{pendientes === 1 ? '' : 's'}</strong>.
            </>
          )}
        </p>
      </div>

      <ArrepentimientosTable items={items} />
    </>
  )
}
