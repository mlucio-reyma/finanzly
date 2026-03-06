import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Database } from '../../../lib/database.types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ExpenseRow = Database['public']['Tables']['expenses']['Row']
type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']

// Datos del formulario para crear un gasto (sin id, user_id ni timestamps)
export type ExpenseFormData = {
  amount: number
  category: string
  date: string
  description?: string | null
  establishment?: string | null
  payment_method: string
}

// Criterios para filtrar la lista de gastos
export interface ExpenseFilters {
  startDate?: string    // YYYY-MM-DD
  endDate?: string      // YYYY-MM-DD
  categories?: string[] // IDs de categoría, ej: ['alimentacion', 'salud']
  paymentMethod?: string
}

// ── Constantes ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

// ── Traducción de errores de Supabase al español ──────────────────────────────

function traducirError(message: string): string {
  if (message.includes('JWT') || message.includes('session'))
    return 'Tu sesión ha expirado. Vuelve a iniciar sesión.'
  if (message.includes('not found'))
    return 'El gasto no fue encontrado.'
  if (message.includes('permission') || message.includes('policy') || message.includes('violates row-level'))
    return 'No tienes permiso para realizar esta acción.'
  if (message.includes('violates check constraint'))
    return 'El monto debe ser un número positivo.'
  if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch'))
    return 'Error de conexión. Verifica tu internet e inténtalo de nuevo.'
  if (message.includes('not authenticated') || message.includes('anon'))
    return 'Debes iniciar sesión para gestionar tus gastos.'
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}

// ── Hook principal ────────────────────────────────────────────────────────────

export function useExpenses() {
  // ── Estado ─────────────────────────────────────────────────────────────────
  const [expenses, setExpenses] = useState<ExpenseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Paginación: índice de página actual (0-based) y bandera de más resultados
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  // Filtros activos guardados para reutilizarlos en loadMore
  const [activeFilters, setActiveFilters] = useState<ExpenseFilters>({})

  // ── Función de carga principal ─────────────────────────────────────────────
  // Recibe los filtros y el rango de paginación, devuelve los datos.
  // Separada para que tanto fetchExpenses como loadMore la reutilicen.
  const loadExpenses = useCallback(
    async (filters: ExpenseFilters, from: number, to: number) => {
      let query = supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to)

      // Filtro por rango de fechas
      if (filters.startDate) {
        query = query.gte('date', filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate)
      }

      // Filtro por categorías (selección múltiple)
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories)
      }

      // Filtro por método de pago
      if (filters.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod)
      }

      return query
    },
    []
  )

  // ── Carga inicial / recarga completa ───────────────────────────────────────
  // Resetea la lista desde la página 0 con los filtros indicados.
  const fetchExpenses = useCallback(
    async (filters: ExpenseFilters = {}) => {
      setLoading(true)
      setError(null)

      const { data, error: sbError } = await loadExpenses(filters, 0, PAGE_SIZE - 1)

      if (sbError) {
        setError(traducirError(sbError.message))
        setLoading(false)
        return
      }

      setExpenses(data ?? [])
      setPage(0)
      setHasMore((data?.length ?? 0) === PAGE_SIZE)
      setLoading(false)
    },
    [loadExpenses]
  )

  // Carga automática al montar el hook
  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  // ── Paginación: cargar más resultados ──────────────────────────────────────
  // Añade la siguiente página al final de la lista existente.
  async function loadMore() {
    if (!hasMore || loading) return

    setLoading(true)
    setError(null)

    const nextPage = page + 1
    const from = nextPage * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, error: sbError } = await loadExpenses(activeFilters, from, to)

    if (sbError) {
      setError(traducirError(sbError.message))
      setLoading(false)
      return
    }

    setExpenses(prev => [...prev, ...(data ?? [])])
    setPage(nextPage)
    setHasMore((data?.length ?? 0) === PAGE_SIZE)
    setLoading(false)
  }

  // ── Aplicar filtros ────────────────────────────────────────────────────────
  // Guarda los nuevos filtros y recarga desde la primera página.
  async function applyFilters(filters: ExpenseFilters) {
    setActiveFilters(filters)
    await fetchExpenses(filters)
  }

  // ── Crear gasto ────────────────────────────────────────────────────────────
  async function createExpense(data: ExpenseFormData): Promise<{ error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Debes iniciar sesión para registrar gastos.' }
    }

    const { error: sbError } = await supabase
      .from('expenses')
      .insert({ ...data, user_id: user.id })

    if (sbError) {
      return { error: traducirError(sbError.message) }
    }

    // Recargar la lista para reflejar el nuevo gasto con los filtros activos
    await fetchExpenses(activeFilters)
    return { error: null }
  }

  // ── Actualizar gasto ───────────────────────────────────────────────────────
  async function updateExpense(
    id: string,
    data: Omit<ExpenseUpdate, 'id' | 'user_id' | 'created_at'>
  ): Promise<{ error: string | null }> {
    const { error: sbError } = await supabase
      .from('expenses')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (sbError) {
      return { error: traducirError(sbError.message) }
    }

    // Actualización optimista: evita un refetch completo
    setExpenses(prev =>
      prev.map(exp =>
        exp.id === id
          ? { ...exp, ...data, updated_at: new Date().toISOString() }
          : exp
      )
    )
    return { error: null }
  }

  // ── Eliminar gasto ─────────────────────────────────────────────────────────
  async function deleteExpense(id: string): Promise<{ error: string | null }> {
    const { error: sbError } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (sbError) {
      return { error: traducirError(sbError.message) }
    }

    // Eliminación optimista: actualiza la UI de inmediato sin refetch
    setExpenses(prev => prev.filter(exp => exp.id !== id))
    return { error: null }
  }

  // ── API pública del hook ───────────────────────────────────────────────────
  return {
    expenses,
    loading,
    error,
    hasMore,
    activeFilters,
    loadMore,
    applyFilters,
    createExpense,
    updateExpense,
    deleteExpense,
  }
}
