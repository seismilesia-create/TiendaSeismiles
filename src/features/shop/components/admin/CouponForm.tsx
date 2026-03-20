'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCouponAction, updateCouponAction } from '@/actions/admin-coupons'

interface Coupon {
  id: string
  codigo: string
  tipo: 'porcentaje' | 'monto_fijo'
  valor: number
  minimo_compra: number
  max_usos: number | null
  usos_actuales: number
  un_uso_por_usuario: boolean
  activo: boolean
  fecha_inicio: string
  fecha_fin: string | null
}

function toLocalDateInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toISOString().slice(0, 16)
}

export function CouponForm({ existing }: { existing?: Coupon }) {
  const router = useRouter()
  const isEdit = !!existing

  const [codigo, setCodigo] = useState(existing?.codigo ?? '')
  const [tipo, setTipo] = useState<'porcentaje' | 'monto_fijo'>(existing?.tipo ?? 'porcentaje')
  const [valor, setValor] = useState(existing?.valor ?? 10)
  const [minimoCompra, setMinimoCompra] = useState(existing?.minimo_compra ?? 0)
  const [maxUsos, setMaxUsos] = useState<string>(existing?.max_usos?.toString() ?? '')
  const [unUsoPorUsuario, setUnUsoPorUsuario] = useState(existing?.un_uso_por_usuario ?? true)
  const [activo, setActivo] = useState(existing?.activo ?? true)
  const [fechaInicio, setFechaInicio] = useState(toLocalDateInput(existing?.fecha_inicio ?? null) || '')
  const [fechaFin, setFechaFin] = useState(toLocalDateInput(existing?.fecha_fin ?? null))

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const fd = new FormData()
    fd.set('codigo', codigo)
    fd.set('tipo', tipo)
    fd.set('valor', String(valor))
    fd.set('minimo_compra', String(minimoCompra))
    if (maxUsos) fd.set('max_usos', maxUsos)
    fd.set('un_uso_por_usuario', String(unUsoPorUsuario))
    fd.set('activo', String(activo))
    if (fechaInicio) fd.set('fecha_inicio', new Date(fechaInicio).toISOString())
    if (fechaFin) fd.set('fecha_fin', new Date(fechaFin).toISOString())

    const result = isEdit
      ? await updateCouponAction(existing!.id, fd)
      : await createCouponAction(fd)

    if ('error' in result && result.error) {
      setError(result.error)
      setSaving(false)
      return
    }

    router.push('/admin/cupones')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-body-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Codigo */}
        <div>
          <label htmlFor="codigo" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
            Codigo del cupon
          </label>
          <input
            id="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            required
            className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md uppercase tracking-wider font-mono focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
            placeholder="INVIERNO20"
          />
          <p className="text-body-xs text-volcanic-400 mt-1">El codigo se convierte automaticamente a mayusculas</p>
        </div>

        {/* Tipo + Valor */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tipo" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
              Tipo de descuento
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'porcentaje' | 'monto_fijo')}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
            >
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="monto_fijo">Monto fijo ($)</option>
            </select>
          </div>
          <div>
            <label htmlFor="valor" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
              {tipo === 'porcentaje' ? 'Porcentaje (1-100)' : 'Monto (ARS)'}
            </label>
            <input
              id="valor"
              type="number"
              value={valor || ''}
              onChange={(e) => setValor(Number(e.target.value))}
              required
              min={1}
              max={tipo === 'porcentaje' ? 100 : undefined}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
              placeholder={tipo === 'porcentaje' ? '20' : '5000'}
            />
          </div>
        </div>

        {/* Minimo compra */}
        <div>
          <label htmlFor="minimo_compra" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
            Minimo de compra (ARS)
          </label>
          <input
            id="minimo_compra"
            type="number"
            value={minimoCompra || ''}
            onChange={(e) => setMinimoCompra(Number(e.target.value))}
            min={0}
            className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
            placeholder="0 = sin minimo"
          />
          <p className="text-body-xs text-volcanic-400 mt-1">0 o vacio = sin minimo de compra</p>
        </div>

        {/* Max usos */}
        <div>
          <label htmlFor="max_usos" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
            Limite de usos
          </label>
          <input
            id="max_usos"
            type="number"
            value={maxUsos}
            onChange={(e) => setMaxUsos(e.target.value)}
            min={1}
            className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
            placeholder="Vacio = ilimitado"
          />
          <p className="text-body-xs text-volcanic-400 mt-1">Vacio = sin limite de usos totales</p>
          {isEdit && (
            <p className="text-body-xs text-volcanic-500 mt-1">
              Usos actuales: <span className="font-semibold">{existing!.usos_actuales}</span>
            </p>
          )}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fecha_inicio" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
              Fecha inicio
            </label>
            <input
              id="fecha_inicio"
              type="datetime-local"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
            />
          </div>
          <div>
            <label htmlFor="fecha_fin" className="block text-body-sm font-medium text-volcanic-700 mb-1.5">
              Fecha fin (opcional)
            </label>
            <input
              id="fecha_fin"
              type="datetime-local"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-sand-200 text-volcanic-900 text-body-md focus:outline-none focus:border-terra-500 focus:ring-1 focus:ring-terra-500 transition-all"
            />
            <p className="text-body-xs text-volcanic-400 mt-1">Vacio = sin vencimiento</p>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={unUsoPorUsuario}
              onChange={(e) => setUnUsoPorUsuario(e.target.checked)}
              className="w-5 h-5 rounded border-sand-300 text-terra-500 focus:ring-terra-500"
            />
            <span className="text-body-sm font-medium text-volcanic-700">1 uso por cliente</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="w-5 h-5 rounded border-sand-300 text-terra-500 focus:ring-terra-500"
            />
            <span className="text-body-sm font-medium text-volcanic-700">Activo</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-sand-200">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-volcanic-900 hover:bg-volcanic-800 disabled:bg-volcanic-400 text-white text-body-sm font-semibold rounded-xl transition-colors"
        >
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear cupon'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/cupones')}
          className="px-6 py-3 border border-sand-200 text-volcanic-600 hover:text-volcanic-900 text-body-sm font-medium rounded-xl transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
