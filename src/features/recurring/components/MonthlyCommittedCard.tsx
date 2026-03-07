// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  totalMonthly: number
}

// ── Helper ────────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-MX', {
    style:                 'currency',
    currency:              'MXN',
    minimumFractionDigits: 2,
  }).format(n)
}

// ── Componente ────────────────────────────────────────────────────────────────

export function MonthlyCommittedCard({ totalMonthly }: Props) {
  return (
    <div className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-4 gap-1">
        <p className="text-sm font-medium text-base-content/60">
          Compromisos del mes
        </p>
        <p className="text-3xl font-bold text-[#10B981]">
          {formatCurrency(totalMonthly)}
        </p>
        <p className="text-xs text-base-content/40">
          en pagos recurrentes activos
        </p>
      </div>
    </div>
  )
}
