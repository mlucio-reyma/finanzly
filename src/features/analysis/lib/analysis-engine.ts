import { CATEGORIES } from '../../../types/categories'

// ── Tipos exportados ───────────────────────────────────────────────────────────

/** Gasto total de una categoría en un periodo dado */
export type CategoryTotal = {
  category:   string
  label:      string
  emoji:      string
  total:      number
  percentage: number
}

/** Promedio histórico de una categoría calculado sobre varios meses */
export type CategoryAverage = {
  category:    string
  monthsOfData: number
  average:     number
}

/** Resultado de una anomalía detectada en una categoría */
export type AnomalyResult = {
  category:  string
  label:     string
  emoji:     string
  current:   number
  average:   number
  deviation: number // fracción (0.35 = 35% sobre el promedio)
}

/** Estadísticas de un establecimiento */
export type EstablishmentStat = {
  name:           string
  total:          number
  visits:         number
  averagePerVisit: number
}

/** Factores que componen el score de salud financiera (cada uno de 0 a 25) */
export type ScoreFactors = {
  consistency: number // días con registros / días del mes × 25
  trend:       number // 25 si el gasto bajó, 12 si igual, 0 si subió
  categories:  number // 25 − (anomalías × 5), mínimo 0
  recurring:   number // % pagos recurrentes cubiertos × 25
}

/** Recomendación de ahorro generada a partir del análisis */
export type SavingsRecommendation = {
  id:             string
  title:          string
  description:    string
  potentialSaving: number
  category:       string
}

// ── Helpers internos ──────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

function categoryMeta(id: string) {
  return CATEGORIES.find(c => c.id === id) ?? { label: id, emoji: '📦' }
}

// ── detectAnomalies ───────────────────────────────────────────────────────────

/**
 * Detecta categorías donde el gasto actual supera el promedio histórico en más
 * del 20%. Solo considera categorías con al menos 2 meses de historial.
 * Devuelve los resultados ordenados de mayor a menor desviación.
 */
export function detectAnomalies(
  current:    CategoryTotal[],
  historical: CategoryAverage[],
): AnomalyResult[] {
  const results: AnomalyResult[] = []

  for (const cat of current) {
    const hist = historical.find(h => h.category === cat.category)
    if (!hist || hist.monthsOfData < 2 || hist.average === 0) continue

    const deviation = (cat.total - hist.average) / hist.average
    if (deviation <= 0.20) continue

    const meta = categoryMeta(cat.category)
    results.push({
      category:  cat.category,
      label:     meta.label,
      emoji:     meta.emoji,
      current:   cat.total,
      average:   hist.average,
      deviation,
    })
  }

  return results.sort((a, b) => b.deviation - a.deviation)
}

// ── getTopEstablishments ──────────────────────────────────────────────────────

/**
 * Agrupa los gastos por establecimiento y devuelve el top 10 ordenado por
 * total descendente. Ignora registros sin establecimiento o con campo vacío.
 */
export function getTopEstablishments(
  expenses: { establishment?: string | null; amount: number }[],
): EstablishmentStat[] {
  const map = new Map<string, { total: number; visits: number }>()

  for (const exp of expenses) {
    const name = exp.establishment?.trim()
    if (!name) continue

    const entry = map.get(name) ?? { total: 0, visits: 0 }
    entry.total  += exp.amount
    entry.visits += 1
    map.set(name, entry)
  }

  return Array.from(map.entries())
    .map(([name, { total, visits }]) => ({
      name,
      total,
      visits,
      averagePerVisit: visits > 0 ? total / visits : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
}

// ── calculateHealthScore ──────────────────────────────────────────────────────

/**
 * Calcula el score de salud financiera (0–100) sumando los cuatro factores.
 * Cada factor ya debe venir en escala 0–25 desde el hook que lo invoca.
 */
export function calculateHealthScore(factors: ScoreFactors): number {
  const raw = factors.consistency + factors.trend + factors.categories + factors.recurring
  return Math.min(100, Math.max(0, Math.round(raw)))
}

// ── generateRecommendations ───────────────────────────────────────────────────

/**
 * Genera al menos 3 recomendaciones de ahorro basadas en:
 * 1. Anomalías de categorías (una por anomalía detectada)
 * 2. Establecimiento de mayor gasto (si existe)
 * 3. Incremento global del gasto > 15%
 * 4. Recomendación genérica de cierre si no hay suficientes datos
 */
export function generateRecommendations(
  anomalies:         AnomalyResult[],
  topEstablishments: EstablishmentStat[],
  currentTotal:      number,
  previousTotal:     number,
): SavingsRecommendation[] {
  const recs: SavingsRecommendation[] = []

  // 1. Una recomendación por anomalía detectada
  for (const anomaly of anomalies) {
    const overAmount    = anomaly.current - anomaly.average
    const deviationPct  = Math.round(anomaly.deviation * 100)

    recs.push({
      id:             `anomaly-${anomaly.category}`,
      title:          `Gasto elevado en ${anomaly.label}`,
      description:    `Este mes gastaste ${deviationPct}% más en ${anomaly.label} que tu promedio histórico (${formatCurrency(anomaly.average)}). Reducir al promedio te ahorraría ${formatCurrency(overAmount)}.`,
      potentialSaving: overAmount,
      category:       anomaly.category,
    })
  }

  // 2. Establecimiento de mayor gasto con más de 2 visitas
  const topEst = topEstablishments.find(e => e.visits > 2)
  if (topEst) {
    const reducedVisits  = Math.max(1, Math.floor(topEst.visits * 0.6))
    const potentialSaving = topEst.total - reducedVisits * topEst.averagePerVisit

    recs.push({
      id:             `establishment-${topEst.name.toLowerCase().replace(/\s+/g, '-')}`,
      title:          `Frecuencia alta en ${topEst.name}`,
      description:    `Visitaste ${topEst.name} ${topEst.visits} veces este mes con un gasto total de ${formatCurrency(topEst.total)}. Reducir a ${reducedVisits} visitas podría ahorrarte ${formatCurrency(potentialSaving)}.`,
      potentialSaving: Math.max(0, potentialSaving),
      category:       'otros',
    })
  }

  // 3. Incremento global > 15%
  if (previousTotal > 0) {
    const globalDeviation = (currentTotal - previousTotal) / previousTotal
    if (globalDeviation > 0.15) {
      const overTotal = currentTotal - previousTotal
      recs.push({
        id:             'global-increase',
        title:          'Gasto total más alto que el mes anterior',
        description:    `Tu gasto total subió ${Math.round(globalDeviation * 100)}% vs el mes anterior (+${formatCurrency(overTotal)}). Revisa en qué categorías aumentó para identificar oportunidades de ajuste.`,
        potentialSaving: overTotal * 0.5,
        category:       'general',
      })
    }
  }

  // 4. Si aún no hay 3 recomendaciones, agregar una genérica
  if (recs.length < 3) {
    recs.push({
      id:             'generic-tracking',
      title:          'Registra tus establecimientos',
      description:    'Añadir el establecimiento en cada gasto te permitirá detectar dónde concentras más dinero y tomar decisiones más conscientes.',
      potentialSaving: 0,
      category:       'general',
    })
  }

  if (recs.length < 3) {
    recs.push({
      id:             'generic-recurring',
      title:          'Revisa tus pagos recurrentes',
      description:    'Asegúrate de marcar tus pagos recurrentes como pagados cada mes para mantener un historial preciso y evitar cargos olvidados.',
      potentialSaving: 0,
      category:       'general',
    })
  }

  return recs
}
