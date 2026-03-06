import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { useDashboardData } from '../hooks/useDashboardData'

// ── Constantes ────────────────────────────────────────────────────────────────

// Clave del mes actual en formato "YYYY-MM" para distinguir la barra activa
const CURRENT_MONTH = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

const COLOR_CURRENT = '#6366f1' // indigo — mes actual
const COLOR_OTHER   = '#d1d5db' // gris   — meses anteriores

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
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>

        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={abbreviate}
          tick={{ fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'oklch(var(--b2) / 0.5)' }} />

        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {data.map(entry => (
            <Cell
              key={entry.key}
              fill={entry.key === CURRENT_MONTH ? COLOR_CURRENT : COLOR_OTHER}
            />
          ))}
        </Bar>

      </BarChart>
    </ResponsiveContainer>
  )
}
