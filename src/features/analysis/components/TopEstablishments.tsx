import type { EstablishmentStat } from '../lib/analysis-engine'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  topEstablishments:    EstablishmentStat[]
  establishmentCoverage: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

// ── Componente ────────────────────────────────────────────────────────────────

export function TopEstablishments({ topEstablishments, establishmentCoverage }: Props) {
  const lowCoverage = establishmentCoverage < 30

  return (
    <div className="card bg-base-100 card-bordered shadow-sm">
      <div className="card-body gap-3">
        <h2 className="card-title text-base">Top Establecimientos</h2>

        {/* Banner de baja cobertura */}
        {lowCoverage && (
          <div role="alert" className="alert alert-info text-sm">
            <span>
              💡 Solo el {establishmentCoverage}% de tus gastos tienen establecimiento registrado.
              Agrégalo en cada gasto para ver este análisis completo.
            </span>
          </div>
        )}

        {/* Estado vacío */}
        {topEstablishments.length === 0 && (
          <p className="text-sm text-base-content/50 py-4 text-center">
            Aún no hay establecimientos registrados este mes.
          </p>
        )}

        {/* Lista */}
        {topEstablishments.length > 0 && (
          <div className="flex flex-col gap-2">
            {topEstablishments.map((est, i) => (
              <div key={est.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors">

                {/* Ranking */}
                <span className={`text-xs font-bold w-6 text-center tabular-nums ${
                  i === 0 ? 'text-warning' : i === 1 ? 'text-base-content/50' : 'text-base-content/30'
                }`}>
                  #{i + 1}
                </span>

                {/* Nombre + visitas */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{est.name}</p>
                  <p className="text-xs text-base-content/50">
                    {est.visits} {est.visits === 1 ? 'visita' : 'visitas'} · {formatCurrency(est.averagePerVisit)} promedio
                  </p>
                </div>

                {/* Total */}
                <span className="font-bold text-sm text-primary whitespace-nowrap">
                  {formatCurrency(est.total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
