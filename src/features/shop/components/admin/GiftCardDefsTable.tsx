'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteGiftCardDefAction } from '@/actions/admin-gift-cards'

interface GiftCardDef {
  id: string
  titulo: string
  precio: number
  descripcion: string
  gradient_from: string
  gradient_to: string
  activo: boolean
  orden: number
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
  )
}

export function GiftCardDefsTable({ definitions }: { definitions: GiftCardDef[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Eliminar esta gift card?')) return
    setDeleting(id)
    const result = await deleteGiftCardDefAction(id)
    if (result.error) {
      alert(result.error)
    }
    setDeleting(null)
    router.refresh()
  }

  if (!definitions.length) {
    return (
      <div className="text-center py-16 text-body-md text-volcanic-500">
        No hay gift cards definidas. Crea la primera.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-body-sm">
        <thead>
          <tr className="border-b border-sand-200 text-volcanic-500 text-left">
            <th className="pb-3 font-medium">Preview</th>
            <th className="pb-3 font-medium">Titulo</th>
            <th className="pb-3 font-medium">Precio</th>
            <th className="pb-3 font-medium">Estado</th>
            <th className="pb-3 font-medium">Orden</th>
            <th className="pb-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-100">
          {definitions.map((def) => (
            <tr key={def.id} className="hover:bg-sand-50/50">
              {/* Gradient preview */}
              <td className="py-3 pr-4">
                <div
                  className="w-16 h-10 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${def.gradient_from}, ${def.gradient_to})`,
                  }}
                />
              </td>

              {/* Titulo */}
              <td className="py-3 pr-4">
                <p className="font-semibold text-volcanic-900">{def.titulo}</p>
                <p className="text-volcanic-500 text-body-xs truncate max-w-[200px]">{def.descripcion}</p>
              </td>

              {/* Precio */}
              <td className="py-3 pr-4 font-semibold text-volcanic-900 tabular-nums">
                ${def.precio.toLocaleString('es-AR')}
              </td>

              {/* Estado */}
              <td className="py-3 pr-4">
                <span className={`inline-flex px-2.5 py-1 rounded-full text-body-xs font-semibold ${
                  def.activo
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-volcanic-100 text-volcanic-500'
                }`}>
                  {def.activo ? 'Activa' : 'Inactiva'}
                </span>
              </td>

              {/* Orden */}
              <td className="py-3 pr-4 text-volcanic-500 tabular-nums">
                {def.orden}
              </td>

              {/* Acciones */}
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/gift-cards/${def.id}`}
                    className="p-2 rounded-lg hover:bg-sand-100 text-volcanic-500 hover:text-volcanic-700 transition-colors"
                    title="Editar"
                  >
                    <EditIcon className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(def.id)}
                    disabled={deleting === def.id}
                    className="p-2 rounded-lg hover:bg-red-50 text-volcanic-500 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
