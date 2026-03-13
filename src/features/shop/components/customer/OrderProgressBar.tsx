const STEPS = [
  { key: 'confirmado', label: 'Confirmado' },
  { key: 'en_preparacion', label: 'En preparación' },
  { key: 'enviado', label: 'Enviado' },
  { key: 'entregado', label: 'Entregado' },
]

const STEP_INDEX: Record<string, number> = {
  confirmado: 0,
  en_preparacion: 1,
  enviado: 2,
  entregado: 3,
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>
  )
}

interface Props {
  currentStatus: string
}

export function OrderProgressBar({ currentStatus }: Props) {
  const currentIndex = STEP_INDEX[currentStatus] ?? -1

  // Don't render for cancelled/refunded
  if (currentIndex === -1) return null

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex
          const isCurrent = i === currentIndex
          const isPending = i > currentIndex

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
              {/* Connector line (before this step) */}
              {i > 0 && (
                <div
                  className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${
                    i <= currentIndex ? 'bg-terra-500' : 'bg-sand-200'
                  }`}
                />
              )}

              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-terra-500 text-white'
                    : isCurrent
                      ? 'bg-terra-500 text-white ring-4 ring-terra-500/20'
                      : 'bg-sand-200 text-volcanic-500'
                }`}
              >
                {isCompleted ? (
                  <CheckIcon className="w-4 h-4" />
                ) : isCurrent ? (
                  <div className="w-2.5 h-2.5 bg-white rounded-full" />
                ) : (
                  <div className="w-2.5 h-2.5 bg-volcanic-300 rounded-full" />
                )}
              </div>

              {/* Label */}
              <span
                className={`mt-2 text-[11px] sm:text-body-xs font-medium text-center leading-tight ${
                  isPending ? 'text-volcanic-500' : 'text-volcanic-900'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
