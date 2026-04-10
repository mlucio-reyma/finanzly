import { useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../auth/hooks/useAuth'
import type { ChatContext } from '../types'

// ── Helpers de rango de mes ───────────────────────────────────────────────────

function monthRange(year: number, month: number): { start: string; end: string } {
  const y = String(year)
  const m = String(month + 1).padStart(2, '0')
  const lastDay = String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')
  return { start: `${y}-${m}-01`, end: `${y}-${m}-${lastDay}` }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useChatContext() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getChatContext = useCallback(async (includeGreeting?: boolean): Promise<ChatContext | null> => {
    if (!user) return null

    setIsLoading(true)
    setError(null)

    const now = new Date()
    const curr = monthRange(now.getFullYear(), now.getMonth())
    const prev = monthRange(
      new Date(now.getFullYear(), now.getMonth() - 1, 1).getFullYear(),
      new Date(now.getFullYear(), now.getMonth() - 1, 1).getMonth(),
    )

    try {
      // Tres queries en paralelo: gastos del mes actual, mes anterior, top 3
      const [
        { data: currRows, error: e1 },
        { data: prevRows, error: e2 },
        { data: topRows, error: e3 },
      ] = await Promise.all([
        supabase
          .from('expenses')
          .select('amount, category')
          .gte('date', curr.start)
          .lte('date', curr.end),
        supabase
          .from('expenses')
          .select('amount')
          .gte('date', prev.start)
          .lte('date', prev.end),
        supabase
          .from('expenses')
          .select('description, amount')
          .gte('date', curr.start)
          .lte('date', curr.end)
          .order('amount', { ascending: false })
          .limit(3),
      ])

      if (e1 ?? e2 ?? e3) {
        setError('No se pudo cargar el contexto financiero.')
        return null
      }

      // Total del mes actual
      const currentTotal = (currRows ?? []).reduce((s, r) => s + r.amount, 0)

      // Agrupar por categoría (procesamiento en cliente, volumen bajo)
      const categoryMap: Record<string, number> = {}
      for (const row of currRows ?? []) {
        categoryMap[row.category] = (categoryMap[row.category] ?? 0) + row.amount
      }
      const byCategory = Object.entries(categoryMap)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)

      // Top 3 gastos más grandes
      const topExpenses = (topRows ?? []).map(r => ({
        description: (r.description as string | null) ?? 'Sin descripción',
        amount: r.amount as number,
      }))

      // Comparación con mes anterior
      const previousTotal = (prevRows ?? []).reduce((s, r) => s + r.amount, 0)
      const change = currentTotal - previousTotal
      const changePercent = previousTotal > 0
        ? Math.round((change / previousTotal) * 10000) / 100
        : 0

      return {
        userId: user.id,
        includeGreeting: includeGreeting ?? false,
        currentMonth: { total: currentTotal, byCategory, topExpenses },
        comparison: previousTotal > 0
          ? { currentMonth: currentTotal, previousMonth: previousTotal, change, changePercent }
          : undefined,
      }
    } catch {
      setError('Error inesperado al obtener el contexto financiero.')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [user])

  return { getChatContext, isLoading, error }
}
