import { calculateHealthScore } from './analysis-engine'
import type { ScoreFactors } from './analysis-engine'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Retorna el primer día del mes actual en formato YYYY-MM-DD */
function currentMonthStart(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

/**
 * Formatea una fecha YYYY-MM-DD como nombre de mes corto en español.
 * Ejemplo: "2026-03-01" → "Mar"
 */
function formatMonthLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date
    .toLocaleDateString('es-MX', { month: 'short' })
    .replace(/^\w/, c => c.toUpperCase())
    .replace('.', '')
}

// ── saveMonthlyScore ──────────────────────────────────────────────────────────

/**
 * Persiste (o actualiza) el score del mes actual en la tabla monthly_scores.
 * Usa upsert sobre (user_id, month) para evitar duplicados.
 * Si la operación falla, registra el error en consola pero no lo propaga —
 * el score es una métrica auxiliar y no debe interrumpir el flujo principal.
 */
export async function saveMonthlyScore(
  supabase: any,
  userId:   string,
  factors:  ScoreFactors,
): Promise<void> {
  const score = calculateHealthScore(factors)

  const { error } = await supabase
    .from('monthly_scores')
    .upsert(
      {
        user_id: userId,
        month:   currentMonthStart(),
        score,
        factors,
      },
      { onConflict: 'user_id,month' },
    )

  if (error) {
    console.error('[score-calculator] Error al guardar monthly_score:', error.message)
  }
}

// ── getHistoricalScores ───────────────────────────────────────────────────────

/**
 * Obtiene los últimos 6 scores mensuales del usuario ordenados cronológicamente.
 * Retorna cada entrada con el mes formateado en español ("Ene", "Feb", etc.)
 * para uso directo en gráficas.
 */
export async function getHistoricalScores(
  supabase: any,
  userId:   string,
): Promise<{ month: string; score: number }[]> {
  const { data, error } = await supabase
    .from('monthly_scores')
    .select('month, score')
    .eq('user_id', userId)
    .order('month', { ascending: true })
    .limit(6)

  if (error) {
    console.error('[score-calculator] Error al obtener historical scores:', error.message)
    return []
  }

  return (data ?? [])
    .filter((row: { month: string; score: number | null }) => row.score !== null)
    .map((row: { month: string; score: number }) => ({
      month: formatMonthLabel(row.month),
      score: row.score,
    }))
}
