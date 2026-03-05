'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { MonthlyRevenue } from '@/features/shop/services/analytics'

function formatARS(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toLocaleString('es-AR')}`
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: MonthlyRevenue }>; label?: string }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload

  return (
    <div className="rounded-xl bg-volcanic-900 text-white px-4 py-3 shadow-lg text-body-xs">
      <p className="font-semibold mb-1">{label}</p>
      <p>${data.revenue.toLocaleString('es-AR')}</p>
      <p className="text-white/50 mt-1">{data.orders} ventas — {data.units} unidades</p>
    </div>
  )
}

interface Props {
  initialData: MonthlyRevenue[]
  years: number[]
  allYearsData: Record<number, MonthlyRevenue[]>
}

export function RevenueChart({ initialData, years, allYearsData }: Props) {
  const [selectedYear, setSelectedYear] = useState(years[0])
  const data = allYearsData[selectedYear] ?? initialData

  return (
    <div className="rounded-2xl bg-white border border-sand-200/60 p-5 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-lg text-volcanic-900">Ingresos por mes</h3>
          <p className="text-body-xs text-volcanic-400 mt-1">
            Total: ${data.reduce((s, d) => s + d.revenue, 0).toLocaleString('es-AR')}
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-2 rounded-xl bg-sand-100/50 border border-sand-200 text-volcanic-900 text-body-sm focus:outline-none focus:border-terra-500/50 transition-all"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="h-[300px] lg:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" vertical={false} />
            <XAxis
              dataKey="monthName"
              tick={{ fill: '#78716C', fontSize: 12 }}
              axisLine={{ stroke: '#E8E0D8' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#78716C', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatARS}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5F0EB' }} />
            <Bar
              dataKey="revenue"
              fill="#C75B39"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
