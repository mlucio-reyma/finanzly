import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'

// ── Constantes ────────────────────────────────────────────────────────────────

// Paleta de 6 colores: índice 0 = más antiguo, índice 5 = mes actual
const MONTH_COLORS = ['#e0f4e9', '#c0e9d4', '#9fddbe', '#7cd1aa', '#54c595', '#10b981']

// ── Helpers ───────────────────────────────────────────────────────────────────

// Abrevia montos grandes para el eje Y: 1200 → "$1.2k"
function abbreviate(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

// ── Tooltip personalizado ─────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-base-100 border border-base-300 rounded-lg p-3 text-sm shadow-lg">
      <p className="font-semibold mb-1">{label}</p>
      <p>{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse flex items-end gap-2 h-40 px-2">
      {[55, 75, 40, 90, 60, 100].map((h, i) => (
        <div key={i} className="flex-1 bg-base-300 rounded-t" style={{ height: `${h}%` }} />
      ))}
    </div>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function MonthlyBarChart() {
  const { monthlyTrend } = useDashboardData()
  const { data, loading, error } = monthlyTrend

  if (loading) return <Skeleton />

  if (error) {
    return <div role="alert" className="alert alert-error text-sm"><span>{error}</span></div>
  }

  return (
    <div className="fn-card p-6">
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>

        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={abbreviate}
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(var(--b2) / 0.5)' }} />

        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={entry.key}
              fill={MONTH_COLORS[i] ?? '#10b981'}
            />
          ))}
        </Bar>

      </BarChart>
    </ResponsiveContainer>
    </div>
  )
}
