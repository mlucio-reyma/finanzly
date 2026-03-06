import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { CATEGORIES } from '../../../types/categories'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface CategoryBreakdownItem {
  category:   string // ID de la categoría, ej: 'alimentacion'
  label:      string // Nombre legible, ej: 'Alimentación'
  emoji:      string
  total:      number
  percentage: number // 0-100
}

export interface UseCategoryBreakdownResult {
  data:    CategoryBreakdownItem[]
  loading: boolean
  error:   string | null
}

// ── Helper de rango del mes actual ────────────────────────────────────────────

function currentMonthRange(): { start: string; end: string } {
  const now     = new Date()
  const y       = now.getFullYear()
  const m       = String(now.getMonth() + 1).padStart(2, '0')
  const lastDay = String(new Date(y, now.getMonth() + 1, 0).getDate()).padStart(2, '0')
  return { start: `${y}-${m}-01`, end: `${y}-${m}-${lastDay}` }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCategoryBreakdown(): UseCategoryBreakdownResult {
  const [data, setData]       = useState<CategoryBreakdownItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)

      const { start, end } = currentMonthRange()

      // Solo necesitamos amount y category para el agrupamiento
      const { data: rows, error: sbError } = await supabase
        .from('expenses')
        .select('amount, category')
        .gte('date', start)
        .lte('date', end)

      if (sbError) {
        setError('No se pudo cargar el desglose por categorías.')
        setLoading(false)
        return
      }

      // ── Agrupar por categoría (procesamiento en cliente) ───────────────────
      // Volumen bajo en los primeros meses; suficiente sin RPC de Supabase.
      const totals: Record<string, number> = {}
      for (const row of rows ?? []) {
        totals[row.category] = (totals[row.category] ?? 0) + row.amount
      }

      const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0)

      // Enriquecer con metadata de CATEGORIES y calcular porcentaje
      const breakdown: CategoryBreakdownItem[] = Object.entries(totals)
        .map(([categoryId, total]) => {
          const cat = CATEGORIES.find(c => c.id === categoryId)
          return {
            category:   categoryId,
            label:      cat?.label ?? categoryId,
            emoji:      cat?.emoji ?? '📦',
            total,
            percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
          }
        })
        .sort((a, b) => b.total - a.total) // mayor gasto primero

      setData(breakdown)
      setLoading(false)
    }

    loadData()
  }, [])

  return { data, loading, error }
}
