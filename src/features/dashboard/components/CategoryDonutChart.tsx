import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useDashboardData }        from '../hooks/useDashboardData'
import type { CategoryBreakdownItem } from '../hooks/useDashboardData'

// ── Paleta de colores consistente para las categorías ─────────────────────────

const COLORS = [
  '#10B981',  // emerald principal - Finanzly brand
  '#F59E0B',  // amber
  '#3B82F6',  // blue
  '#F87171',  // red suave
  '#A78BFA',  // purple suave
  '#FB923C',  // orange
  '#34D399',  // emerald claro
  '#60A5FA',  // blue claro
  '#FBBF24',  // yellow
  '#F472B6',  // pink
  '#818CF8',  // indigo
  '#4ADE80',  // green claro
  '#E879F9',  // fuchsia
  '#38BDF8',  // sky blue
  '#FCD34D',  // yellow claro
  '#C084FC',  // purple claro
  '#86EFAC',  // green pastel
  '#FCA5A5',  // red pastel
  '#93C5FD',  // blue pastel
  '#6EE7B7',  // teal claro
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

// ── Tooltip personalizado ─────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: CategoryBreakdownItem }[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="bg-base-100 border border-base-300 rounded-lg p-3 text-sm shadow-lg">
      <p className="font-semibold mb-1">{item.emoji} {item.label}</p>
      <p>{formatCurrency(item.total)}</p>
      <p className="text-base-content/60">{item.percentage.toFixed(1)}%</p>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="w-44 h-44 bg-base-300 rounded-full" />
      <div className="flex flex-col gap-2 w-full">
        {[1, 2, 3].map(i => <div key={i} className="h-4 bg-base-300 rounded w-full" />)}
      </div>
    </div>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function CategoryDonutChart() {
  const { categoryBreakdown } = useDashboardData()
  const { data, loading, error } = categoryBreakdown

  if (loading) return <Skeleton />

  if (error) {
    return <div role="alert" className="alert alert-error text-sm"><span>{error}</span></div>
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 gap-2 text-base-content/50">
        <span className="text-4xl" aria-hidden="true">🍩</span>
        <p className="text-sm">Sin gastos registrados este mes</p>
      </div>
    )
  }

  const top5 = data.slice(0, 5)

  return (
    <div className="fn-card p-6 flex flex-col gap-4">

      {/* Gráfica de dona */}
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={top5}
            dataKey="total"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={2}
          >
            {top5.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Leyenda manual debajo de la gráfica */}
      <div className="flex flex-col gap-2">
        {top5.map((item, i) => (
          <div key={item.category} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
              <span className="truncate">{item.emoji} {item.label}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
              <span className="text-base-content/50">{item.percentage.toFixed(0)}%</span>
              <span className="font-medium">{formatCurrency(item.total)}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
