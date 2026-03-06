import { useState } from 'react'
import { useRecurring }        from '../hooks/useRecurring'
import { RecurringItem }       from './RecurringItem'
import { RecurringForm }       from './RecurringForm'
import { MonthlyCommittedCard } from './MonthlyCommittedCard'
import { DeleteConfirmModal }  from '../../expenses/components/DeleteConfirmModal'
import type { Database }       from '../../../lib/database.types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type RecurringPaymentRow = Database['public']['Tables']['recurring_payments']['Row']

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="card card-bordered bg-base-100 animate-pulse">
      <div className="card-body p-4 gap-3">
        <div className="flex justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="h-4 w-32 bg-base-300 rounded" />
            <div className="h-3 w-24 bg-base-300 rounded" />
          </div>
          <div className="h-6 w-20 bg-base-300 rounded" />
        </div>
        <div className="h-3 w-40 bg-base-300 rounded" />
      </div>
    </div>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function RecurringList() {
  const {
    recurringPayments, paidThisMonth, totalMonthly,
    loading, error,
    deleteRecurring, markAsPaid, markAsUnpaid,
  } = useRecurring()

  const [editingItem, setEditingItem]   = useState<RecurringPaymentRow | null>(null)
  const [deletingId, setDeletingId]     = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Separar activos de pausados (el hook ya los ordena por due_day)
  const active = recurringPayments.filter(p => p.active)
  const paused = recurringPayments.filter(p => !p.active)

  async function handleConfirmDelete() {
    if (!deletingId) return
    setDeleteLoading(true)
    await deleteRecurring(deletingId)
    setDeleteLoading(false)
    setDeletingId(null)
  }

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Resumen de compromisos */}
      <MonthlyCommittedCard totalMonthly={totalMonthly} />

      {/* Estado: cargando */}
      {loading && (
        <div className="flex flex-col gap-3">
          <SkeletonRow /><SkeletonRow /><SkeletonRow />
        </div>
      )}

      {/* Estado: error */}
      {!loading && error && (
        <div role="alert" className="alert alert-error text-sm"><span>{error}</span></div>
      )}

      {/* Estado: vacío */}
      {!loading && !error && recurringPayments.length === 0 && (
        <div className="flex flex-col items-center py-16 gap-3 text-center">
          <span className="text-5xl" aria-hidden="true">🔄</span>
          <p className="text-base font-medium text-base-content/70">
            Aún no tienes pagos recurrentes registrados.
          </p>
        </div>
      )}

      {/* Pagos activos */}
      {!loading && active.length > 0 && (
        <div className="flex flex-col gap-3">
          {active.map(item => (
            <RecurringItem key={item.id} recurring={item}
              isPaid={paidThisMonth.has(item.id)}
              onEdit={setEditingItem}
              onDelete={setDeletingId}
              onMarkAsPaid={markAsPaid}
              onMarkAsUnpaid={markAsUnpaid}
            />
          ))}
        </div>
      )}

      {/* Pagos pausados — separados visualmente */}
      {!loading && paused.length > 0 && (
        <>
          <div className="divider text-xs text-base-content/40">Pausados</div>
          <div className="flex flex-col gap-3">
            {paused.map(item => (
              <RecurringItem key={item.id} recurring={item}
                isPaid={paidThisMonth.has(item.id)}
                onEdit={setEditingItem}
                onDelete={setDeletingId}
                onMarkAsPaid={markAsPaid}
                onMarkAsUnpaid={markAsUnpaid}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal de edición */}
      {editingItem && (
        <div className="modal modal-open">
          <div className="modal-backdrop" onClick={() => setEditingItem(null)} aria-hidden="true" />
          <div className="modal-box w-full max-w-lg">
            <h3 className="font-bold text-lg mb-4">Editar pago recurrente</h3>
            <RecurringForm
              recurring={editingItem}
              onSuccess={() => setEditingItem(null)}
              onCancel={() => setEditingItem(null)}
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
