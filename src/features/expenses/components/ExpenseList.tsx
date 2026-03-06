import { useState } from 'react'
import { useExpenses } from '../hooks/useExpenses'
import { ExpenseItem } from './ExpenseItem'
import { ExpenseFilters } from './ExpenseFilters'
import { ExpenseForm } from './ExpenseForm'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import type { Database } from '../../../lib/database.types'
import type { ExpenseFilters as Filters } from '../hooks/useExpenses'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ExpenseRow = Database['public']['Tables']['expenses']['Row']

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="card card-bordered bg-base-100 animate-pulse">
      <div className="card-body p-4 gap-3">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <div className="w-9 h-9 bg-base-300 rounded-full" />
            <div className="flex flex-col gap-1">
              <div className="w-24 h-4 bg-base-300 rounded" />
              <div className="w-16 h-3 bg-base-300 rounded" />
            </div>
          </div>
          <div className="w-16 h-5 bg-base-300 rounded" />
        </div>
        <div className="w-36 h-3 bg-base-300 rounded" />
      </div>
    </div>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function ExpenseList() {
  const {
    expenses, loading, error,
    hasMore, loadMore,
    activeFilters, applyFilters, deleteExpense,
  } = useExpenses()

  // Gasto seleccionado para editar (null = modal cerrado)
  const [editingExpense, setEditingExpense] = useState<ExpenseRow | null>(null)

  // ID del gasto pendiente de eliminar (null = modal cerrado)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Total calculado a partir de los gastos cargados en el período
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)

  // ── Eliminar ───────────────────────────────────────────────────────────────
  async function handleConfirmDelete() {
    if (!deletingId) return
    setDeleteLoading(true)
    await deleteExpense(deletingId)
    setDeleteLoading(false)
    setDeletingId(null)
  }

  // ── Filtros ────────────────────────────────────────────────────────────────
  function handleClearFilters() {
    applyFilters({} as Filters)
  }

  // Tras editar exitosamente, cierra el modal y recarga la lista con los filtros activos
  function handleEditSuccess() {
    setEditingExpense(null)
    applyFilters(activeFilters)
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Filtros */}
      <ExpenseFilters onApplyFilters={applyFilters} onClearFilters={handleClearFilters} />

      {/* Resumen del período */}
      {!loading && expenses.length > 0 && (
        <div className="flex justify-between items-center px-1">
          <span className="text-sm text-base-content/60">
            {expenses.length} transacción{expenses.length !== 1 ? 'es' : ''}
          </span>
          <span className="font-bold text-lg text-primary">
            {formatCurrency(total)}
          </span>
        </div>
      )}

      {/* Estado: cargando */}
      {loading && (
        <div className="flex flex-col gap-3">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      )}

      {/* Estado: error */}
      {!loading && error && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Estado: sin gastos */}
      {!loading && !error && expenses.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="text-6xl" aria-hidden="true">🧾</span>
          <p className="text-base font-medium text-base-content/70">
            Aún no tienes gastos registrados.
          </p>
          <p className="text-sm text-base-content/50">
            ¡Agrega tu primer gasto!
          </p>
        </div>
      )}

      {/* Lista de gastos */}
      {!loading && expenses.length > 0 && (
        <div className="flex flex-col gap-3">
          {expenses.map(expense => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onEdit={setEditingExpense}
              onDelete={setDeletingId}
            />
          ))}
        </div>
      )}

      {/* Paginación: cargar más */}
      {hasMore && !loading && (
        <button
          type="button"
          className="btn btn-ghost btn-sm w-full mt-2"
          onClick={loadMore}
        >
          Cargar más
        </button>
      )}

      {/* Modal de edición */}
      {editingExpense && (
        <div className="modal modal-open">
          <div className="modal-backdrop" onClick={() => setEditingExpense(null)} aria-hidden="true" />
          <div className="modal-box w-full max-w-lg">
            <h3 className="font-bold text-lg mb-4">Editar gasto</h3>
            <ExpenseForm
              expense={editingExpense}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingExpense(null)}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={!!deletingId}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />

    </div>
  )
}
