import { CATEGORIES }    from '../../../types/categories'
import type { Database } from '../../../lib/database.types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type RecurringPaymentRow = Database['public']['Tables']['recurring_payments']['Row']

interface Props {
  recurring:      RecurringPaymentRow
  isPaid:         boolean
  onEdit:         (recurring: RecurringPaymentRow) => void
  onDelete:       (id: string) => void
  onMarkAsPaid:   (id: string) => void
  onMarkAsUnpaid: (id: string) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

// ── Íconos ────────────────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.5 8.5A2 2 0 016.5 15.5H5a1 1 0 01-1-1v-1.5a2 2 0 01.586-1.414l8.5-8.5z" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-1 8a1 1 0 012 0v3a1 1 0 11-2 0v-3zm4 0a1 1 0 012 0v3a1 1 0 11-2 0v-3z" clipRule="evenodd" />
    </svg>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function RecurringItem({ recurring, isPaid, onEdit, onDelete, onMarkAsPaid, onMarkAsUnpaid }: Props) {
  const cat = CATEGORIES.find(c => c.id === recurring.category)

  // "Próximo": vence en los próximos 3 días y aún no está pagado
  const todayDay  = new Date().getDate()
  const isUpcoming = !isPaid && recurring.active &&
    recurring.due_day >= todayDay && recurring.due_day <= todayDay + 3

  return (
    <div className={`card card-bordered bg-base-100 shadow-sm transition-opacity ${!recurring.active ? 'opacity-60' : ''}`}>
      <div className="card-body p-4 gap-2">

        {/* Fila principal: nombre + badges + monto */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold truncate">{recurring.name}</p>
              {!recurring.active && (
                <span className="badge badge-ghost badge-sm">PAUSADO</span>
              )}
              {isUpcoming && (
                <span className="badge badge-warning badge-sm">Próximo</span>
              )}
              {isPaid && (
                <span className="badge badge-success badge-sm">Pagado ✓</span>
              )}
            </div>
            <p className="text-sm text-base-content/60 mt-0.5">
              {cat?.emoji ?? '📦'} {cat?.label ?? recurring.category}
            </p>
          </div>
          <span className="font-bold text-lg text-primary whitespace-nowrap">
            {formatCurrency(recurring.amount)}
          </span>
        </div>

        {/* Día de vencimiento */}
        <p className="text-xs text-base-content/50">
          Vence el día {recurring.due_day} de cada mes
        </p>

        {/* Fila de acciones */}
        <div className="flex items-center justify-between gap-2 pt-1">

          {/* Botón de marcar/desmarcar — solo para pagos activos */}
          {recurring.active ? (
            isPaid ? (
              <button type="button" className="btn btn-ghost btn-xs"
                onClick={() => onMarkAsUnpaid(recurring.id)}>
                Desmarcar
              </button>
            ) : (
              <button type="button" className="btn btn-success btn-outline btn-xs"
                onClick={() => onMarkAsPaid(recurring.id)}>
                Marcar como pagado
              </button>
            )
          ) : (
            <div /> // spacer para mantener layout
          )}

          {/* Editar / Eliminar */}
          <div className="flex gap-1">
            <button type="button" className="btn btn-ghost btn-xs text-base-content/60 hover:text-primary"
              onClick={() => onEdit(recurring)} aria-label="Editar pago">
              <IconEdit />
            </button>
            <button type="button" className="btn btn-ghost btn-xs text-base-content/60 hover:text-error"
              onClick={() => onDelete(recurring.id)} aria-label="Eliminar pago">
              <IconTrash />
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
