import { useDashboardData } from '../hooks/useDashboardData'
import { TrendIndicator }   from './TrendIndicator'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-MX', {
    style:                 'currency',
    currency:              'MXN',
    minimumFractionDigits: 2,
  }).format(n)
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="card bg-primary animate-pulse">
      <div className="card-body gap-4">
        <div className="h-4 w-28 bg-primary-content/20 rounded" />
        <div className="h-12 w-48 bg-primary-content/20 rounded" />
        <div className="h-4 w-20 bg-primary-content/20 rounded" />
        <div className="divider my-0 opacity-20" />
        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <div className="h-3 w-24 bg-primary-content/20 rounded" />
            <div className="h-5 w-20 bg-primary-content/20 rounded" />
          </div>
          <div className="flex flex-col gap-1 items-end">
            <div className="h-3 w-24 bg-primary-content/20 rounded" />
            <div className="h-5 w-12 bg-primary-content/20 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function MonthSummaryCard() {
  const { summary } = useDashboardData()
  const { currentTotal, percentageChange, dailyAverage, transactionCount, loading, error } = summary

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div role="alert" className="alert alert-error text-sm">
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="card bg-primary text-primary-content shadow-lg">
      <div className="card-body gap-3">

        <p className="text-sm font-medium opacity-80">Total del mes</p>

        {/* Monto principal — grande y prominente */}
        <p className="text-4xl font-bold tracking-tight">
          {formatCurrency(currentTotal)}
        </p>

        <TrendIndicator value={percentageChange} />

        <div className="divider my-0 opacity-20" />

        {/* Métricas secundarias */}
        <div className="flex justify-between">
          <div>
            <p className="text-xs opacity-70">Promedio diario</p>
            <p className="font-semibold">{formatCurrency(dailyAverage)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70">Transacciones</p>
            <p className="font-semibold">{transactionCount}</p>
          </div>
        </div>

      </div>
    </div>
  )
}
