import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Database } from '../../../lib/database.types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type RecurringPaymentRow    = Database['public']['Tables']['recurring_payments']['Row']
type RecurringPaymentLogRow = Database['public']['Tables']['recurring_payments_log']['Row']

// Datos del formulario (sin id, user_id ni created_at)
export type RecurringFormData = {
  name:          string
  amount:        number
  due_day:       number
  category:      string
  reminder_days: number
  active:        boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Primer día del mes actual en formato YYYY-MM-DD (clave para el log)
function getLocalDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function currentMonthStart(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

function traducirError(message: string): string {
  if (message.includes('JWT') || message.includes('session'))
    return 'Tu sesión ha expirado. Vuelve a iniciar sesión.'
  if (message.includes('unique') || message.includes('duplicate'))
    return 'Este pago ya fue registrado para el mes actual.'
  if (message.includes('network') || message.includes('fetch'))
    return 'Error de conexión. Verifica tu internet.'
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}

// ── Hook principal ────────────────────────────────────────────────────────────

export function useRecurring() {
  const [recurringPayments, setRecurringPayments] = useState<RecurringPaymentRow[]>([])
  const [logEntries, setLogEntries]               = useState<RecurringPaymentLogRow[]>([])
  const [loading, setLoading]                     = useState(true)
  const [error, setError]                         = useState<string | null>(null)

  // ── Carga inicial: pagos recurrentes + log del mes actual ──────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [{ data: payments, error: e1 }, { data: log, error: e2 }] = await Promise.all([
      supabase.from('recurring_payments').select('*').order('due_day', { ascending: true }),
      supabase.from('recurring_payments_log').select('*').eq('paid_month', currentMonthStart()),
    ])

    if (e1 || e2) {
      setError('No se pudieron cargar los pagos recurrentes.')
      setLoading(false)
      return
    }

    setRecurringPayments(payments ?? [])
    setLogEntries(log ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Valores derivados ──────────────────────────────────────────────────────

  // IDs de pagos ya marcados como pagados este mes
  const paidThisMonth = new Set(logEntries.map(e => e.recurring_payment_id))

  // Suma de montos de pagos activos = compromiso mensual total
  const totalMonthly = recurringPayments
    .filter(p => p.active)
    .reduce((sum, p) => sum + p.amount, 0)

  // ── Crear pago recurrente ──────────────────────────────────────────────────
  async function createRecurring(data: RecurringFormData): Promise<{ error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Debes iniciar sesión.' }

    const { error: sbError } = await supabase
      .from('recurring_payments')
      .insert({ ...data, user_id: user.id })

    if (sbError) return { error: traducirError(sbError.message) }

    // Recargar la lista desde Supabase para garantizar estado consistente
    await loadData()
    return { error: null }
  }

  // ── Editar pago recurrente ─────────────────────────────────────────────────
  async function updateRecurring(id: string, data: Partial<RecurringFormData>): Promise<{ error: string | null }> {
    const { error: sbError } = await supabase
      .from('recurring_payments')
      .update(data)
      .eq('id', id)

    if (sbError) return { error: traducirError(sbError.message) }

    await loadData()
    return { error: null }
  }

  // ── Eliminar pago recurrente ───────────────────────────────────────────────
  async function deleteRecurring(id: string): Promise<{ error: string | null }> {
    const { error: sbError } = await supabase.from('recurring_payments').delete().eq('id', id)
    if (sbError) return { error: traducirError(sbError.message) }
    await loadData()
    return { error: null }
  }

  // ── Activar / desactivar pago recurrente ───────────────────────────────────
  async function toggleActive(id: string, active: boolean): Promise<{ error: string | null }> {
    const { error: sbError } = await supabase
      .from('recurring_payments')
      .update({ active })
      .eq('id', id)

    if (sbError) return { error: traducirError(sbError.message) }
    await loadData()
    return { error: null }
  }

  // ── Marcar como pagado este mes ────────────────────────────────────────────
  // 1. Crea un gasto en `expenses` con los datos del pago recurrente.
  // 2. Registra en `recurring_payments_log` vinculando el expense creado.
  async function markAsPaid(recurringPaymentId: string): Promise<{ error: string | null }> {
    const payment = recurringPayments.find(p => p.id === recurringPaymentId)
    if (!payment) return { error: 'Pago recurrente no encontrado.' }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Debes iniciar sesión.' }

    // Paso 1: crear el gasto automáticamente en expenses
    const { data: expense, error: e1 } = await supabase
      .from('expenses')
      .insert({
        user_id:        user.id,
        amount:         payment.amount,
        category:       payment.category,
        date:           getLocalDateString(),
        description:    payment.name,
        payment_method: 'debito',
      })
      .select().single()

    if (e1) return { error: traducirError(e1.message) }

    // Paso 2: registrar en el log del mes actual
    const { error: e2 } = await supabase
      .from('recurring_payments_log')
      .insert({
        recurring_payment_id: recurringPaymentId,
        user_id:              user.id,
        paid_month:           currentMonthStart(),
        expense_id:           expense?.id ?? null,
      })

    if (e2) return { error: traducirError(e2.message) }

    // Recargar log para reflejar el nuevo estado de pago
    await loadData()
    return { error: null }
  }

  // ── Desmarcar como pagado ──────────────────────────────────────────────────
  // Elimina el log del mes actual y el gasto asociado (si existe).
  async function markAsUnpaid(recurringPaymentId: string): Promise<{ error: string | null }> {
    const logEntry = logEntries.find(e => e.recurring_payment_id === recurringPaymentId)
    if (!logEntry) return { error: 'No se encontró el registro de pago.' }

    const { error: e1 } = await supabase.from('recurring_payments_log').delete().eq('id', logEntry.id)
    if (e1) return { error: traducirError(e1.message) }

    // Eliminar el gasto vinculado si existe
    if (logEntry.expense_id) {
      await supabase.from('expenses').delete().eq('id', logEntry.expense_id)
    }

    await loadData()
    return { error: null }
  }

  // ── API pública del hook ───────────────────────────────────────────────────
  return {
    recurringPayments,
    paidThisMonth,
    totalMonthly,
    loading,
    error,
    refresh: loadData, // expuesto para que los consumidores puedan forzar recarga
    createRecurring,
    updateRecurring,
    deleteRecurring,
    toggleActive,
    markAsPaid,
    markAsUnpaid,
  }
}
