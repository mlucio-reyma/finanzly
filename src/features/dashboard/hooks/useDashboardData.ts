import { useMonthSummary }      from './useMonthSummary'
import { useCategoryBreakdown } from './useCategoryBreakdown'
import { useMonthlyTrend }      from './useMonthlyTrend'

// Re-exportar los tipos individuales para que los componentes
// no necesiten importar desde múltiples archivos
export type { MonthSummary, UseMonthSummaryResult }      from './useMonthSummary'
export type { CategoryBreakdownItem, UseCategoryBreakdownResult } from './useCategoryBreakdown'
export type { MonthlyTrendItem, UseMonthlyTrendResult }          from './useMonthlyTrend'

// ── Tipos ─────────────────────────────────────────────────────────────────────

import type { UseMonthSummaryResult }      from './useMonthSummary'
import type { UseCategoryBreakdownResult } from './useCategoryBreakdown'
import type { UseMonthlyTrendResult }      from './useMonthlyTrend'

export interface DashboardData {
  summary:           UseMonthSummaryResult
  categoryBreakdown: UseCategoryBreakdownResult
  monthlyTrend:      UseMonthlyTrendResult
  loading: boolean      // true si cualquiera de los 3 sub-hooks está cargando
  error:   string | null // primer error encontrado entre los 3 hooks
}

// ── Hook orquestador ──────────────────────────────────────────────────────────
// Combina los 3 hooks de datos del dashboard en una sola interfaz.
// Los 3 hooks se montan simultáneamente, por lo que las queries corren en paralelo.

export function useDashboardData(): DashboardData {
  const summary           = useMonthSummary()
  const categoryBreakdown = useCategoryBreakdown()
  const monthlyTrend      = useMonthlyTrend()

  // Loading global: esperar a que todos terminen
  const loading = summary.loading || categoryBreakdown.loading || monthlyTrend.loading

  // Error global: el primero que se encuentre (si hay alguno)
  const error = summary.error ?? categoryBreakdown.error ?? monthlyTrend.error ?? null

  return {
    summary,
    categoryBreakdown,
    monthlyTrend,
    loading,
    error,
  }
}
