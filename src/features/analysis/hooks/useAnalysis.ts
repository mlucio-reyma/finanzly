import { useState, useEffect, useCallback } from 'react'
import { supabase }    from '../../../lib/supabase'
import { CATEGORIES }  from '../../../types/categories'
import type { Database } from '../../../lib/database.types'
import {
  detectAnomalies, getTopEstablishments,
  calculateHealthScore, generateRecommendations,
} from '../lib/analysis-engine'
import type {
  CategoryTotal, CategoryAverage,
  AnomalyResult, EstablishmentStat, SavingsRecommendation,
} from '../lib/analysis-engine'
import { saveMonthlyScore, getHistoricalScores } from '../lib/score-calculator'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ExpenseRow = Database['public']['Tables']['expenses']['Row']

export type CategoryComparison = {
  category: string
  label:    string
  emoji:    string
  current:  number
  previous: number
  change:   number // positivo = subió, negativo = bajó
}

// ── Helpers de fecha ──────────────────────────────────────────────────────────

/** Primer día del mes con offset. 0 = actual, -1 = anterior, -6 = hace 6 meses */
function monthStart(offset = 0): string {
  const d = new Date()
  const t = new Date(d.getFullYear(), d.getMonth() + offset, 1)
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-01`
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function daysInCurrentMonth(): number {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

// ── Transformaciones de datos ─────────────────────────────────────────────────

/** Agrupa gastos por categoría y calcula totales y porcentajes */
function buildCategoryTotals(expenses: ExpenseRow[]): CategoryTotal[] {
  const map = new Map<string, number>()
  let grand = 0
  for (const e of expenses) {
    map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    grand += e.amount
  }
  return Array.from(map.entries()).map(([cat, total]) => {
    const meta = CATEGORIES.find(c => c.id === cat) ?? { label: cat, emoji: '📦' }
    return { category: cat, label: meta.label, emoji: meta.emoji, total,
             percentage: grand > 0 ? (total / grand) * 100 : 0 }
  })
}

/**
 * Calcula el promedio histórico por categoría agrupando primero por mes
 * para que meses con mucho volumen no distorsionen el promedio.
 */
function buildCategoryAverages(historical: ExpenseRow[]): CategoryAverage[] {
  const byMonth = new Map<string, Map<string, number>>()
  for (const e of historical) {
    const m = e.date.substring(0, 7)
    if (!byMonth.has(m)) byMonth.set(m, new Map())
    const cm = byMonth.get(m)!
    cm.set(e.category, (cm.get(e.category) ?? 0) + e.amount)
  }
  const agg = new Map<string, { sum: number; count: number }>()
  for (const catMap of byMonth.values()) {
    for (const [cat, total] of catMap) {
      const a = agg.get(cat) ?? { sum: 0, count: 0 }
      agg.set(cat, { sum: a.sum + total, count: a.count + 1 })
    }
  }
  return Array.from(agg.entries()).map(([category, { sum, count }]) => ({
    category, monthsOfData: count, average: sum / count,
  }))
}

/** Compara gastos del mes actual vs el mes anterior por categoría */
function buildCategoryComparison(
  currentTotals: CategoryTotal[],
  prevExpenses:  ExpenseRow[],
): CategoryComparison[] {
  const prevMap = new Map(buildCategoryTotals(prevExpenses).map(c => [c.category, c.total]))
  const cats    = new Set([...currentTotals.map(c => c.category), ...prevMap.keys()])

  return Array.from(cats).map(cat => {
    const meta     = CATEGORIES.find(c => c.id === cat) ?? { label: cat, emoji: '📦' }
    const current  = currentTotals.find(c => c.category === cat)?.total ?? 0
    const previous = prevMap.get(cat) ?? 0
    return { category: cat, label: meta.label, emoji: meta.emoji, current, previous, change: current - previous }
  }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAnalysis() {
  const [anomalies,            setAnomalies]           = useState<AnomalyResult[]>([])
  const [topEstablishments,    setTopEstablishments]   = useState<EstablishmentStat[]>([])
  const [recommendations,      setRecommendations]     = useState<SavingsRecommendation[]>([])
  const [score,                setScore]               = useState(0)
  const [historicalScores,     setHistoricalScores]    = useState<{ month: string; score: number }[]>([])
  const [categoryComparison,   setCategoryComparison]  = useState<CategoryComparison[]>([])
  const [hasEnoughData,        setHasEnoughData]       = useState(false)
  const [establishmentCoverage, setEstCoverage]        = useState(0)
  const [loading,              setLoading]             = useState(true)
  const [error,                setError]               = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sesión no encontrada.'); setLoading(false); return }

    const currStart   = monthStart(0)
    const prevStart   = monthStart(-1)
    const sixAgoStart = monthStart(-6)

    // ── Cuatro consultas en paralelo ──────────────────────────────────────────
    const [
      { data: currData,   error: e1 },
      { data: histData,   error: e2 },
      { data: logData,    error: e3 },
      { data: _recData,   error: e4, count: activeCount },
    ] = await Promise.all([
      supabase.from('expenses').select('*').eq('user_id', user.id)
        .gte('date', currStart).lte('date', todayStr()),
      supabase.from('expenses').select('*').eq('user_id', user.id)
        .gte('date', sixAgoStart).lt('date', currStart),
      supabase.from('recurring_payments_log').select('id').eq('user_id', user.id)
        .eq('paid_month', currStart),
      supabase.from('recurring_payments').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('active', true),
    ])

    if (e1 || e2 || e3 || e4) {
      setError('No se pudieron cargar los datos de análisis.')
      setLoading(false)
      return
    }

    const curr    = (currData  ?? []) as ExpenseRow[]
    const hist    = (histData  ?? []) as ExpenseRow[]
    const prevExp = hist.filter(e => e.date >= prevStart)

    // ── Cálculos derivados ────────────────────────────────────────────────────
    const currTotals  = buildCategoryTotals(curr)
    const histAvgs    = buildCategoryAverages(hist)
    const currTotal   = curr.reduce((s, e) => s + e.amount, 0)
    const prevTotal   = prevExp.reduce((s, e) => s + e.amount, 0)

    const detectedAnomalies = detectAnomalies(currTotals, histAvgs)
    const topEst            = getTopEstablishments(curr)
    const comparison        = buildCategoryComparison(currTotals, prevExp)

    // ── Score de salud financiera ─────────────────────────────────────────────
    const recurringTotal = activeCount ?? 0
    const recurringPaid  = (logData ?? []).length

    const factors = {
      consistency: Math.round((new Set(curr.map(e => e.date)).size / daysInCurrentMonth()) * 25),
      trend:       currTotal < prevTotal ? 25 : currTotal === prevTotal ? 12 : 0,
      categories:  Math.max(0, 25 - detectedAnomalies.length * 5),
      recurring:   recurringTotal > 0 ? Math.round((recurringPaid / recurringTotal) * 25) : 25,
    }

    const computedScore = calculateHealthScore(factors)
    const recs          = generateRecommendations(detectedAnomalies, topEst, currTotal, prevTotal)

    // Guardar score en background (no bloquea el render)
    saveMonthlyScore(supabase, user.id, factors)

    const histScores    = await getHistoricalScores(supabase, user.id)
    const withEstab     = curr.filter(e => e.establishment?.trim()).length
    const distinctMonths = new Set(hist.map(e => e.date.substring(0, 7))).size

    setAnomalies(detectedAnomalies)
    setTopEstablishments(topEst)
    setRecommendations(recs)
    setScore(computedScore)
    setHistoricalScores(histScores)
    setCategoryComparison(comparison)
    setHasEnoughData(distinctMonths >= 2)
    setEstCoverage(curr.length > 0 ? Math.round((withEstab / curr.length) * 100) : 0)
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  return {
    anomalies, topEstablishments, recommendations,
    score, historicalScores, categoryComparison,
    hasEnoughData, establishmentCoverage,
    loading, error,
    refresh: loadData,
  }
}
