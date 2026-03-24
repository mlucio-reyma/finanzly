import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import { CATEGORIES } from '../../../types/categories'
import type { CalendarDataMap, DayData } from '../types/calendar.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, '0') }

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function getCategoryInfo(categoryId: string) {
  const found = CATEGORIES.find(c => c.id === categoryId)
  return found
    ? { name: found.label, icon: found.emoji }
    : { name: 'Otros', icon: '📦' }
}

function emptyDay(date: string): DayData {
  return { date, expenses: [], recurrents: [], totalExpenses: 0, totalRecurrents: 0, hasExpenses: false, hasRecurrents: false }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

// month es 0-indexed (igual que Date de JS)
export function useCalendarData(year: number, month: number) {
  const [dataMap, setDataMap] = useState<CalendarDataMap>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Ref para cache sin provocar re-renders ni loops de dependencias
  const cacheRef = useRef<Record<string, CalendarDataMap>>({})

  useEffect(() => {
    async function load() {
      const cacheKey = `${year}-${month}`
      if (cacheRef.current[cacheKey]) {
        setDataMap(cacheRef.current[cacheKey])
        return
      }

      setLoading(true)
      setError(null)

      const firstDay    = toDateKey(year, month, 1)
      const lastDayNum  = new Date(year, month + 1, 0).getDate()
      const lastDay     = toDateKey(year, month, lastDayNum)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const [
        { data: expenses, error: e1 },
        { data: recurring, error: e2 },
        { data: paidLog,   error: e3 },
      ] = await Promise.all([
        supabase
          .from('expenses')
          .select('id, amount, date, description, category')
          .eq('user_id', user.id)
          .gte('date', firstDay)
          .lte('date', lastDay),
        supabase
          .from('recurring_payments')
          .select('id, name, amount, due_day')
          .eq('user_id', user.id)
          .eq('active', true),
        supabase
          .from('recurring_payments_log')
          .select('recurring_payment_id')
          .eq('user_id', user.id)
          .eq('paid_month', firstDay),   // primer día del mes = clave del log
      ])

      if (e1 || e2 || e3) {
        setError('No se pudieron cargar los datos del calendario.')
        setLoading(false)
        return
      }

      const paidIds = new Set((paidLog ?? []).map(l => l.recurring_payment_id))
      const map: CalendarDataMap = {}

      // Gastos → map (indexados por YYYY-MM-DD)
      for (const exp of expenses ?? []) {
        const key = exp.date
        if (!map[key]) map[key] = emptyDay(key)
        map[key].expenses.push({
          id: exp.id,
          amount: exp.amount,
          description: exp.description,
          category: getCategoryInfo(exp.category),
        })
        map[key].totalExpenses += exp.amount
        map[key].hasExpenses = true
      }

      // Recurrentes → map (solo días válidos del mes)
      for (const rec of recurring ?? []) {
        if (rec.due_day > lastDayNum) continue
        const key = toDateKey(year, month, rec.due_day)
        if (!map[key]) map[key] = emptyDay(key)
        map[key].recurrents.push({
          id: rec.id,
          name: rec.name,
          amount: rec.amount,
          dueDay: rec.due_day,
          isPaid: paidIds.has(rec.id),
        })
        map[key].totalRecurrents += rec.amount
        map[key].hasRecurrents = true
      }

      cacheRef.current[cacheKey] = map
      setDataMap(map)
      setLoading(false)
    }

    load()
  }, [year, month])

  return { dataMap, loading, error }
}
