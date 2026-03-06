import type { AnomalyResult } from '../lib/analysis-engine'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  anomalies:    AnomalyResult[]
  hasEnoughData: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

// ── Componente ────────────────────────────────────────────────────────────────

export function AnomalyAlerts({ anomalies, hasEnoughData }: Props) {
  return (
    <div className="card bg-base-100 card-bordered shadow-sm">
      <div className="card-body gap-3">
        <h2 className="card-title text-base">Alertas de Gasto</h2>

        {/* Sin historial suficiente */}
        {!hasEnoughData && (
          <div role="alert" className="alert alert-info text-sm">
            <span>📊 Necesitas al menos 2 meses de datos para ver alertas de anomalías.</span>
          </div>
        )}

        {/* Sin anomalías */}
        {hasEnoughData && anomalies.length === 0 && (
          <div role="alert" className="alert alert-success text-sm">
            <span>✅ ¡Sin anomalías este mes! Tus gastos están bajo control.</span>
          </div>
        )}

        {/* Lista de anomalías */}
        {hasEnoughData && anomalies.length > 0 && (
          <div className="flex flex-col gap-2">
            {anomalies.map(a => {
              const deviationPct = Math.round(a.deviation * 100)
              const overAmount   = a.current - a.average
              const isHigh       = a.deviation >= 0.5

              return (
                <div
                  key={a.category}
                  className={`rounded-lg border p-3 ${
                    isHigh
                      ? 'border-error/30 bg-error/5'
                      : 'border-warning/30 bg-warning/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xl" aria-hidden="true">{a.emoji}</span>
                      <div>
                        <p className="font-semibold text-sm">{a.label}</p>
                        <p className="text-xs text-base-content/60 mt-0.5">
                          Gastaste{' '}
                          <span className={`font-bold ${isHigh ? 'text-error' : 'text-warning'}`}>
                            {deviationPct}% más
                          </span>{' '}
                          que tu promedio ({formatCurrency(a.average)})
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold whitespace-nowrap ${isHigh ? 'text-error' : 'text-warning'}`}>
                      +{formatCurrency(overAmount)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
