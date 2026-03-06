import { useState }      from 'react'
import { useRecurring }  from '../hooks/useRecurring'
import { RecurringList } from '../components/RecurringList'
import { RecurringForm } from '../components/RecurringForm'

// ── Componente ────────────────────────────────────────────────────────────────

export function RecurringPage() {
  const {
    recurringPayments, paidThisMonth, totalMonthly,
    loading, error,
    createRecurring, updateRecurring, deleteRecurring,
    toggleActive, markAsPaid, markAsUnpaid,
  } = useRecurring()

  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto max-w-2xl px-4 py-6 pb-12">

        {/* Encabezado */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Pagos Recurrentes</h1>
          <button
            type="button"
            className="btn btn-primary btn-sm whitespace-nowrap"
            onClick={() => setIsFormOpen(true)}
          >
            + Nuevo pago
          </button>
        </div>

        {/* Lista de pagos recurrentes */}
        <RecurringList
          recurringPayments={recurringPayments}
          paidThisMonth={paidThisMonth}
          totalMonthly={totalMonthly}
          loading={loading}
          error={error}
          createRecurring={createRecurring}
          updateRecurring={updateRecurring}
          deleteRecurring={deleteRecurring}
          toggleActive={toggleActive}
          markAsPaid={markAsPaid}
          markAsUnpaid={markAsUnpaid}
        />

        {/* Modal de nuevo pago */}
        {isFormOpen && (
          <div className="modal modal-open">
            <div className="modal-backdrop" onClick={() => setIsFormOpen(false)} aria-hidden="true" />
            <div className="modal-box w-full max-w-lg">
              <h3 className="font-bold text-lg mb-4">Nuevo pago recurrente</h3>
              <RecurringForm
                onSuccess={() => setIsFormOpen(false)}
                onCancel={() => setIsFormOpen(false)}
                createRecurring={createRecurring}
                updateRecurring={updateRecurring}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
