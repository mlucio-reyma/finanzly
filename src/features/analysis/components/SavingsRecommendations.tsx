import type { SavingsRecommendation } from '../lib/analysis-engine'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  recommendations: SavingsRecommendation[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

// ── Componente ────────────────────────────────────────────────────────────────

export function SavingsRecommendations({ recommendations }: Props) {
  return (
    <div className="card bg-base-100 card-bordered shadow-sm">
      <div className="card-body gap-3">
        <h2 className="card-title text-base">Recomendaciones de Ahorro</h2>

        {/* Estado vacío */}
        {recommendations.length === 0 && (
          <div role="alert" className="alert alert-success text-sm">
            <span>🎉 ¡Sin recomendaciones! Tus finanzas están en buen estado.</span>
          </div>
        )}

        {/* Cards de recomendaciones */}
        {recommendations.length > 0 && (
          <div className="flex flex-col gap-3">
            {recommendations.map(rec => (
              <div key={rec.id} className="rounded-lg border border-base-200 bg-base-50 p-4 flex flex-col gap-1.5">

                {/* Título */}
                <p className="font-semibold text-sm">{rec.title}</p>

                {/* Descripción */}
                <p className="text-xs text-base-content/60 leading-relaxed">
                  {rec.description}
                </p>

                {/* Ahorro potencial */}
                {rec.potentialSaving > 0 && (
                  <p className="text-xs font-semibold text-success mt-1">
                    💰 Podrías ahorrar ~{formatCurrency(rec.potentialSaving)}/mes
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
