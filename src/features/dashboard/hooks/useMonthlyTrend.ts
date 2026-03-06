import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface MonthlyTrendItem {
  key:   string // "YYYY-MM" — identifica el mes; útil para marcar el mes actual
  month: string // "Mar", "Feb", etc. en español
  total: number
}

export interface UseMonthlyTrendResult {
  data:    MonthlyTrendItem[]
  loading: boolean
  error:   string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

// Formatea un Date como "YYYY-MM-DD" para las queries
function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`
}

// Nombre corto del mes en español con primera letra en mayúscula y sin punto
function monthLabel(d: Date): string {
  return d
    .toLocaleDateString('es-MX', { month: 'short' })
    .replace(/^\w/, c => c.toUpperCase())
    .replace('.', '')
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMonthlyTrend(): UseMonthlyTrendResult {
  const [data, setData]       = useState<MonthlyTrendItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)

      const now = new Date()

      // Rango: primer día de hace 5 meses → hoy (= 6 meses totales)
      const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      const startStr  = toDateStr(startDate)
      const endStr    = now.toISOString().split('T')[0]

      const { data: rows, error: sbError } = await supabase
        .from('expenses')
        .select('amount, date')
        .gte('date', startStr)
        .lte('date', endStr)

      if (sbError) {
        setError('No se pudo cargar la tendencia mensual.')
        setLoading(false)
        return
      }

      // ── Construir 6 cubos mensuales con total inicializado en 0 ───────────
      // Garantiza que los meses sin gastos aparecen en la gráfica igualmente.
      const buckets: MonthlyTrendItem[] = []
      for (let i = 5; i >= 0; i--) {
        const d   = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
        buckets.push({ key, month: monthLabel(d), total: 0 })
      }

      // Acumular montos en el cubo correspondiente
      for (const row of rows ?? []) {
        const key    = row.date.slice(0, 7) // "YYYY-MM"
        const bucket = buckets.find(b => b.key === key)
        if (bucket) bucket.total += row.amount
      }

      setData(buckets)
      setLoading(false)
    }

    loadData()
  }, [])

  return { data, loading, error }
}
