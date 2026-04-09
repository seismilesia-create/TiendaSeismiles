import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminQuestions, getAdminFaqs } from '@/features/shop/services/faq'
import { FaqQuestionsTable } from '@/features/shop/components/admin/FaqQuestionsTable'
import { FaqItemsTable } from '@/features/shop/components/admin/FaqItemsTable'

export const metadata: Metadata = { title: 'FAQ | Admin SEISMILES' }

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>
  )
}

export default async function AdminFaqPage() {
  const [questions, faqs] = await Promise.all([
    getAdminQuestions(),
    getAdminFaqs(),
  ])

  const pendingCount = questions.filter(q => q.status === 'pending').length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl text-volcanic-900">Preguntas Frecuentes</h1>
          <p className="text-body-sm text-volcanic-500 mt-1">
            {pendingCount > 0
              ? `${pendingCount} consulta${pendingCount !== 1 ? 's' : ''} pendiente${pendingCount !== 1 ? 's' : ''}`
              : 'Sin consultas pendientes'
            }
          </p>
        </div>
        <Link
          href="/admin/faq/nuevo"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-volcanic-900 hover:bg-volcanic-800 text-white text-body-sm font-semibold rounded-xl transition-all duration-300"
        >
          <PlusIcon className="w-4 h-4" />
          Nueva FAQ
        </Link>
      </div>

      {/* User questions */}
      <section className="mb-12">
        <h2 className="font-heading text-lg text-volcanic-900 mb-4">
          Consultas de clientes
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
              {pendingCount}
            </span>
          )}
        </h2>
        {questions.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white border border-sand-200/60">
            <p className="text-body-sm text-volcanic-500">No hay consultas de clientes aun.</p>
          </div>
        ) : (
          <FaqQuestionsTable questions={questions} />
        )}
      </section>

      {/* FAQ items */}
      <section>
        <h2 className="font-heading text-lg text-volcanic-900 mb-4">
          Preguntas frecuentes publicas
          <span className="ml-2 text-body-sm text-volcanic-500 font-normal">({faqs.length})</span>
        </h2>
        {faqs.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white border border-sand-200/60">
            <p className="text-body-sm text-volcanic-500 mb-4">No hay preguntas frecuentes aun.</p>
            <Link
              href="/admin/faq/nuevo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-terra-500 hover:bg-terra-600 text-white text-body-sm font-semibold rounded-xl transition-all duration-300"
            >
              <PlusIcon className="w-4 h-4" />
              Crear primera FAQ
            </Link>
          </div>
        ) : (
          <FaqItemsTable faqs={faqs} />
        )}
      </section>
    </div>
  )
}
