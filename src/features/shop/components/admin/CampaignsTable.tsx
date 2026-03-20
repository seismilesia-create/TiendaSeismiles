'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteCampaignAction, sendCampaignAction } from '@/actions/admin-newsletter'
import type { CampaignRow } from '@/features/shop/services/newsletter'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

interface Props {
  campaigns: CampaignRow[]
}

export function CampaignsTable({ campaigns }: Props) {
  const router = useRouter()
  const [confirmSend, setConfirmSend] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  async function handleSend(id: string) {
    setSending(true)
    const result = await sendCampaignAction(id)
    setSending(false)
    setConfirmSend(null)
    if (result.error) {
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    await deleteCampaignAction(id)
    setConfirmDelete(null)
    router.refresh()
  }

  if (campaigns.length === 0) {
    return (
      <p className="text-body-sm text-volcanic-400 text-center py-8">
        No hay campanas todavia. Crea tu primera campana.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-sand-200/60">
            <th className="text-left text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider pb-3 pr-4">
              Asunto
            </th>
            <th className="text-left text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider pb-3 pr-4">
              Estado
            </th>
            <th className="text-right text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider pb-3 pr-4">
              Destinatarios
            </th>
            <th className="text-left text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider pb-3 pr-4">
              Fecha
            </th>
            <th className="text-right text-body-xs font-semibold text-volcanic-500 uppercase tracking-wider pb-3">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id} className="border-b border-sand-100 last:border-0">
              <td className="py-3 pr-4">
                <span className="text-body-sm font-semibold text-volcanic-900">
                  {c.subject}
                </span>
              </td>
              <td className="py-3 pr-4">
                {c.status === 'draft' && (
                  <span className="inline-block px-2.5 py-1 text-body-xs font-semibold rounded-full bg-volcanic-100 text-volcanic-500">
                    Borrador
                  </span>
                )}
                {c.status === 'sending' && (
                  <span className="inline-block px-2.5 py-1 text-body-xs font-semibold rounded-full bg-amber-100 text-amber-700">
                    Enviando...
                  </span>
                )}
                {c.status === 'sent' && (
                  <span className="inline-block px-2.5 py-1 text-body-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                    Enviado
                  </span>
                )}
              </td>
              <td className="py-3 pr-4 text-right">
                <span className="text-body-sm text-volcanic-700">
                  {c.recipients_count > 0 ? c.recipients_count : '—'}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className="text-body-xs text-volcanic-400">
                  {c.status === 'sent' ? formatDate(c.sent_at) : formatDate(c.created_at)}
                </span>
              </td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {c.status === 'draft' && (
                    <>
                      {confirmSend === c.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-body-xs text-volcanic-500">Enviar a todos?</span>
                          <button
                            onClick={() => handleSend(c.id)}
                            disabled={sending}
                            className="px-3 py-1.5 text-body-xs font-semibold rounded-lg bg-terra-500 hover:bg-terra-600 text-white transition-all disabled:opacity-50"
                          >
                            {sending ? 'Enviando...' : 'Confirmar'}
                          </button>
                          <button
                            onClick={() => setConfirmSend(null)}
                            className="px-3 py-1.5 text-body-xs text-volcanic-500 hover:text-volcanic-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <>
                          <Link
                            href={`/admin/newsletter/${c.id}`}
                            className="px-3 py-1.5 text-body-xs font-semibold rounded-lg bg-sand-100 hover:bg-sand-200 text-volcanic-700 transition-all"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => setConfirmSend(c.id)}
                            className="px-3 py-1.5 text-body-xs font-semibold rounded-lg bg-terra-500/10 hover:bg-terra-500/20 text-terra-600 transition-all"
                          >
                            Enviar
                          </button>
                        </>
                      )}

                      {confirmDelete === c.id ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="px-3 py-1.5 text-body-xs font-semibold rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1.5 text-body-xs text-volcanic-500 hover:text-volcanic-700"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(c.id)}
                          className="px-3 py-1.5 text-body-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                        >
                          Eliminar
                        </button>
                      )}
                    </>
                  )}

                  {c.status === 'sent' && (
                    <Link
                      href={`/admin/newsletter/${c.id}`}
                      className="px-3 py-1.5 text-body-xs font-semibold rounded-lg bg-sand-100 hover:bg-sand-200 text-volcanic-700 transition-all"
                    >
                      Ver
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
