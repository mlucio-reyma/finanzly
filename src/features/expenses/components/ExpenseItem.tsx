import { CATEGORIES } from '../../../types/categories'
import type { Database } from '../../../lib/database.types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ExpenseRow = Database['public']['Tables']['expenses']['Row']

interface Props {
  expense: ExpenseRow
  onEdit: (expense: ExpenseRow) => void
  onDelete: (id: string) => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Parsea YYYY-MM-DD como fecha local para evitar desfase de zona horaria
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)
}

const PAYMENT_LABELS: Record<string, string> = {
  efectivo:      'Efectivo',
  debito:        'Débito',
  credito:       'Crédito',
  transferencia: 'Transferencia',
}

// ── Íconos ────────────────────────────────────────────────────────────────────

function IconEdit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.5 8.5A2 2 0 0 1 6.5 15.5H5a1 1 0 01-1-1v-1.5a2 2 0 01.586-1.414l8.5-8.5z" />
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

export function ExpenseItem({ expense, onEdit, onDelete }: Props) {
  const category = CATEGORIES.find(c => c.id === expense.category)
  const paymentLabel = PAYMENT_LABELS[expense.payment_method] ?? expense.payment_method

  const shortDescription = expense.description && expense.description.length > 50
    ? expense.description.slice(0, 50) + '…'
    : expense.description

  return (
    <div className="card card-bordered bg-base-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body p-4 gap-2">

        {/* Fila principal: categoría + monto + acciones */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl leading-none" aria-hidden="true">
              {category?.emoji ?? '📦'}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-base leading-tight truncate">
                {category?.label ?? expense.category}
              </p>
              <p className="text-xs text-base-content/50 mt-0.5">
                {formatDate(expense.date)}
              </p>
            </div>
          </div>

          {/* Monto */}
          <span className="font-bold text-lg text-primary whitespace-nowrap">
            {formatAmount(expense.amount)}
          </span>
        </div>

        {/* Establecimiento */}
        {expense.establishment && (
          <p className="text-sm text-base-content/60 leading-tight">
            {expense.establishment}
          </p>
        )}

        {/* Descripción */}
        {shortDescription && (
          <p className="text-sm text-base-content/80 leading-snug">
            {shortDescription}
          </p>
        )}

        {/* Fila inferior: badge + botones */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="badge badge-ghost badge-sm">
            {paymentLabel}
          </span>

          <div className="flex gap-1">
            <button
              type="button"
              className="btn btn-ghost btn-xs text-base-content/60 hover:text-primary"
              onClick={() => onEdit(expense)}
              aria-label="Editar gasto"
            >
              <IconEdit />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs text-base-content/60 hover:text-error"
              onClick={() => onDelete(expense.id)}
              aria-label="Eliminar gasto"
            >
              <IconTrash />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
