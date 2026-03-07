import { useState, useEffect } from 'react'
import { Link }                from 'react-router-dom'
import { supabase }            from '../../../lib/supabase'
import { CATEGORIES }          from '../../../types/categories'
import type { Database }       from '../../../lib/database.types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ExpenseRow = Database['public']['Tables']['expenses']['Row']

// ── Helpers ───────────────────────────────────────────────────────────────────

// Calcula la diferencia en días entre la fecha del gasto y hoy
function relativeDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const expenseDate = new Date(year, month - 1, day)
  const today = new Date()
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const diffTime = todayNormalized.getTime() - expenseDate.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays === -1) return 'Mañana'
  if (diffDays > 1) return `Hace ${diffDays} días`
  if (diffDays < -1) return `En ${Math.abs(diffDays)} días`
  return 'Hoy'
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonItem() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      <div className="w-9 h-9 bg-base-300 rounded-full flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="h-4 bg-base-300 rounded w-36" />
        <div className="h-3 bg-base-300 rounded w-16" />
      </div>
      <div className="h-4 bg-base-300 rounded w-16 flex-shrink-0" />
    </div>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function RecentExpensesList() {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const { data, error: sbError } = await supabase
        .from('expenses')
        .select('*')
        .order('date',       { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5)

      if (sbError) {
        setError('No se pudieron cargar los gastos recientes.')
      } else {
        setExpenses(data ?? [])
      }
      setLoading(false)
    }

    loadData()
  }, [])

  return (
    <div className="fn-card p-6 flex flex-col gap-3">

      {/* Estado: cargando */}
      {loading && [1, 2, 3, 4, 5].map(i => <SkeletonItem key={i} />)}

      {/* Estado: error */}
      {!loading && error && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Estado: sin gastos */}
      {!loading && !error && expenses.length === 0 && (
        <p className="text-center text-sm text-base-content/50 py-6">
          Sin gastos recientes
        </p>
      )}

      {/* Lista de gastos */}
      {!loading && !error && expenses.map(exp => {
        const cat   = CATEGORIES.find(c => c.id === exp.category)
        // Mostrar descripción, luego establecimiento, luego nombre de categoría
        const label = exp.description || exp.establishment || cat?.label || exp.category

        return (
          <div key={exp.id} className="flex items-center gap-3">
            <span className="text-2xl flex-shrink-0" aria-hidden="true">
              {cat?.emoji ?? '📦'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{label}</p>
              <p className="text-xs text-base-content/50">{relativeDate(exp.date)}</p>
            </div>
            <span className="text-sm font-semibold whitespace-nowrap flex-shrink-0 text-[#10B981]">
              {formatCurrency(exp.amount)}
            </span>
          </div>
        )
      })}

      {/* Link a historial completo */}
      {!loading && (
        <Link to="/expenses" className="btn btn-ghost btn-sm w-full mt-1 text-[#10B981]">
          Ver todos →
        </Link>
      )}

    </div>
  )
}
