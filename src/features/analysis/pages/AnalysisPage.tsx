import { useAnalysis }              from '../hooks/useAnalysis'
import { HealthScore }             from '../components/HealthScore'
import { AnomalyAlerts }           from '../components/AnomalyAlerts'
import { CategoryComparison }      from '../components/CategoryComparison'
import { TopEstablishments }       from '../components/TopEstablishments'
import { SavingsRecommendations }  from '../components/SavingsRecommendations'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard({ height = 'h-40' }: { height?: string }) {
  return (
    <div className={`card bg-base-100 card-bordered animate-pulse ${height}`}>
      <div className="card-body gap-3">
        <div className="h-4 w-40 bg-base-300 rounded" />
        <div className="h-3 w-full bg-base-300 rounded" />
        <div className="h-3 w-3/4 bg-base-300 rounded" />
      </div>
    </div>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function AnalysisPage() {
  const {
    anomalies, topEstablishments, recommendations,
    score, historicalScores, categoryComparison,
    hasEnoughData, establishmentCoverage,
    loading, error,
  } = useAnalysis()

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto max-w-3xl px-4 py-6 pb-12">

        {/* Encabezado */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Análisis Inteligente</h1>
          <p className="text-sm text-base-content/50 mt-1">Basado en tus datos reales</p>
        </div>

        {/* Error global */}
        {error && (
          <div role="alert" className="alert alert-error text-sm mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Banner: datos insuficientes */}
        {!loading && !hasEnoughData && (
          <div role="alert" className="alert alert-info text-sm mb-4">
            <span>
              📊 Necesitas al menos 1 mes de datos completos para ver el análisis completo.
              Sigue registrando tus gastos.
            </span>
          </div>
        )}

        {/* Skeletons mientras carga */}
        {loading && (
          <div className="flex flex-col gap-4">
            <SkeletonCard height="h-56" />
            <SkeletonCard height="h-40" />
            <SkeletonCard height="h-48" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SkeletonCard height="h-40" />
              <SkeletonCard height="h-40" />
            </div>
          </div>
        )}

        {/* Contenido */}
        {!loading && !error && (
          <div className="flex flex-col gap-4">

            {/* Score — ancho completo */}
            <section aria-label="Score de salud financiera">
              <HealthScore score={score} historicalScores={historicalScores} />
            </section>

            {/* Alertas de anomalías — ancho completo */}
            <section aria-label="Alertas de gasto">
              <AnomalyAlerts anomalies={anomalies} hasEnoughData={hasEnoughData} />
            </section>

            {/* Comparativa mes a mes — ancho completo */}
            <section aria-label="Comparativa por categoría">
              <CategoryComparison categoryComparison={categoryComparison} />
            </section>

            {/* Top establecimientos + Recomendaciones — lado a lado en desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <section aria-label="Top establecimientos">
                <TopEstablishments
                  topEstablishments={topEstablishments}
                  establishmentCoverage={establishmentCoverage}
                />
              </section>
              <section aria-label="Recomendaciones de ahorro">
                <SavingsRecommendations recommendations={recommendations} />
              </section>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
