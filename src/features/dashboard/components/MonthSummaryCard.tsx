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
    <div className="fn-hero-card animate-pulse">
      <div className="p-6 gap-4 flex flex-col">
        <div className="h-4 w-28 bg-white/10 rounded" />
        <div className="h-12 w-48 bg-white/10 rounded" />
        <div className="h-4 w-20 bg-white/10 rounded" />
        <div className="divider my-0 opacity-20" />
        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="h-5 w-20 bg-white/10 rounded" />
          </div>
          <div className="flex flex-col gap-1 items-end">
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="h-5 w-12 bg-white/10 rounded" />
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
    <div className="fn-hero-card">
      <div className="p-6 flex flex-col gap-3">

        <p className="text-sm font-medium text-[#94A3B8]">Total del mes</p>

        {/* Monto principal — grande y prominente */}
        <p className="fn-amount text-white">
          {formatCurrency(currentTotal)}
        </p>

        <TrendIndicator value={percentageChange} />

        <div className="divider my-0 opacity-20" />

        {/* Métricas secundarias */}
        <div className="flex justify-between">
          <div>
            <p className="text-xs text-[#94A3B8]">Promedio diario</p>
            <p className="font-semibold text-white">{formatCurrency(dailyAverage)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#94A3B8]">Transacciones</p>
            <p className="font-semibold text-white">{transactionCount}</p>
          </div>
        </div>

      </div>
    </div>
  )
}
