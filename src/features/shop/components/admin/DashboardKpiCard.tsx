interface Props {
  title: string
  value: string
  icon: React.ReactNode
  change?: number // percentage change, optional
}

export function DashboardKpiCard({ title, value, icon, change }: Props) {
  return (
    <div className="rounded-2xl bg-white border border-sand-200/60 p-5 lg:p-6">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-sand-100 flex items-center justify-center text-volcanic-500">
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-1 text-body-xs font-semibold px-2 py-1 rounded-lg ${
              change >= 0
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-500'
            }`}
          >
            <svg viewBox="0 0 12 12" fill="none" className={`w-3 h-3 ${change < 0 ? 'rotate-180' : ''}`}>
              <path d="M6 2.5v7M6 2.5L3 5.5M6 2.5l3 3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="font-heading text-xl lg:text-2xl text-volcanic-900 mb-1">{value}</p>
      <p className="text-body-xs text-volcanic-400">{title}</p>
    </div>
  )
}
