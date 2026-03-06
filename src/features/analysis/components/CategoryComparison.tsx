import type { CategoryComparison as CategoryComparisonType } from '../hooks/useAnalysis'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  categoryComparison: CategoryComparisonType[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

// ── Componente ────────────────────────────────────────────────────────────────

export function CategoryComparison({ categoryComparison }: Props) {
  const increased = categoryComparison.filter(c => c.change > 0).length
  const decreased = categoryComparison.filter(c => c.change < 0).length

  return (
    <div className="card bg-base-100 card-bordered shadow-sm">
      <div className="card-body gap-3">
        <h2 className="card-title text-base">Comparativa Mes a Mes</h2>

        {/* Resumen */}
        {categoryComparison.length > 0 && (
          <p className="text-sm text-base-content/60">
            <span className="text-error font-medium">{increased} categorías aumentaron</span>
            {' · '}
            <span className="text-success font-medium">{decreased} disminuyeron</span>
          </p>
        )}

        {/* Estado vacío */}
        {categoryComparison.length === 0 && (
          <p className="text-sm text-base-content/50 py-4 text-center">
            Aún no hay datos suficientes para comparar.
          </p>
        )}

        {/* Tabla */}
        {categoryComparison.length > 0 && (
          <div className="overflow-x-auto -mx-2">
            <table className="table table-sm">
              <thead>
                <tr className="text-xs text-base-content/50">
                  <th>Categoría</th>
                  <th className="text-right">Mes ant.</th>
                  <th className="text-right">Este mes</th>
                  <th className="text-right">Variación</th>
                </tr>
              </thead>
              <tbody>
                {categoryComparison.map(row => {
                  const pct = row.previous > 0
                    ? Math.round(((row.current - row.previous) / row.previous) * 100)
                    : null

                  const changeColor = row.change > 0
                    ? 'text-error'
                    : row.change < 0
                    ? 'text-success'
                    : 'text-base-content/40'

                  const arrow = row.change > 0 ? '↑' : row.change < 0 ? '↓' : '—'

                  return (
                    <tr key={row.category} className="hover">
                      <td>
                        <span className="flex items-center gap-1.5 text-sm">
                          <span aria-hidden="true">{row.emoji}</span>
                          {row.label}
                        </span>
                      </td>
                      <td className="text-right text-sm text-base-content/60">
                        {row.previous > 0 ? formatCurrency(row.previous) : '—'}
                      </td>
                      <td className="text-right text-sm font-medium">
                        {row.current > 0 ? formatCurrency(row.current) : '—'}
                      </td>
                      <td className={`text-right text-sm font-semibold ${changeColor}`}>
                        {arrow}
                        {pct !== null && row.change !== 0 ? ` ${Math.abs(pct)}%` : ''}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
