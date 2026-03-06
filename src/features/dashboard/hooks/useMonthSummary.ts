import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface MonthSummary {
  currentTotal: number
  previousTotal: number
  percentageChange: number | null // null si no hay datos del mes anterior
  dailyAverage: number
  transactionCount: number
}

export interface UseMonthSummaryResult extends MonthSummary {
  loading: boolean
  error: string | null
}

// ── Helpers de fechas ─────────────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

// Devuelve { start, end } en formato YYYY-MM-DD para un mes dado (0-indexed)
function monthRange(year: number, month: number): { start: string; end: string } {
  const lastDay = new Date(year, month + 1, 0).getDate()
  return {
    start: `${year}-${pad(month + 1)}-01`,
    end:   `${year}-${pad(month + 1)}-${pad(lastDay)}`,
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useMonthSummary(): UseMonthSummaryResult {
  const [data, setData] = useState<MonthSummary>({
    currentTotal:     0,
    previousTotal:    0,
    percentageChange: null,
    dailyAverage:     0,
    transactionCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)

      const now  = new Date()
      const curr = monthRange(now.getFullYear(), now.getMonth())
      const prev = monthRange(
        new Date(now.getFullYear(), now.getMonth() - 1, 1).getFullYear(),
        new Date(now.getFullYear(), now.getMonth() - 1, 1).getMonth(),
      )

      // Ambas queries en paralelo para minimizar latencia
      const [{ data: currRows, error: e1 }, { data: prevRows, error: e2 }] =
        await Promise.all([
          supabase.from('expenses').select('amount').gte('date', curr.start).lte('date', curr.end),
          supabase.from('expenses').select('amount').gte('date', prev.start).lte('date', prev.end),
        ])

      if (e1 || e2) {
        setError('No se pudieron cargar los datos del resumen mensual.')
        setLoading(false)
        return
      }

      const currentTotal     = (currRows ?? []).reduce((s, r) => s + r.amount, 0)
      const previousTotal    = (prevRows ?? []).reduce((s, r) => s + r.amount, 0)
      const transactionCount = (currRows ?? []).length

      // Promedio diario: días transcurridos del mes actual (mínimo 1)
      const daysPassed   = Math.max(now.getDate(), 1)
      const dailyAverage = currentTotal / daysPassed

      // Variación porcentual respecto al mes anterior
      const percentageChange = previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : null

      setData({ currentTotal, previousTotal, percentageChange, dailyAverage, transactionCount })
      setLoading(false)
    }

    loadData()
  }, [])

  return { ...data, loading, error }
}
