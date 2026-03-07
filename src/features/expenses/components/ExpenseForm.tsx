import { useState } from 'react'
import { useExpenses } from '../hooks/useExpenses'
import type { Database } from '../../../lib/database.types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ExpenseRow = Database['public']['Tables']['expenses']['Row']

interface Props {
  expense?: ExpenseRow  // Si se recibe, el formulario opera en modo edición
  onSuccess: () => void
  onCancel: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getLocalDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ── Constantes ────────────────────────────────────────────────────────────────

const today = getLocalDateString()

const PAYMENT_METHODS = [
  { id: 'efectivo',      label: 'Efectivo' },
  { id: 'debito',        label: 'Débito' },
  { id: 'credito',       label: 'Crédito' },
  { id: 'transferencia', label: 'Transferencia' },
] as const

const DESC_MAX = 200

// ── Componente ────────────────────────────────────────────────────────────────

export function ExpenseForm({ expense, onSuccess, onCancel }: Props) {
  const { createExpense, updateExpense, allCategories } = useExpenses()
  const isEditing = !!expense

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [amount, setAmount]           = useState(expense?.amount?.toString() ?? '')
  const [category, setCategory]       = useState(expense?.category ?? allCategories[0]?.value ?? 'alimentacion')
  const [date, setDate]               = useState(expense?.date ?? today)
  const [description, setDescription] = useState(expense?.description ?? '')
  const [establishment, setEstablishment] = useState(expense?.establishment ?? '')
  const [paymentMethod, setPaymentMethod] = useState(expense?.payment_method ?? 'efectivo')
  const [formError, setFormError]     = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('El monto debe ser un número positivo.')
      return
    }

    const formData = {
      amount: parsedAmount,
      category,
      date,
      description: description.trim() || null,
      establishment: establishment.trim() || null,
      payment_method: paymentMethod,
    }

    setLoading(true)
    const result = isEditing
      ? await updateExpense(expense.id, formData)
      : await createExpense(formData)
    setLoading(false)

    if (result.error) {
      setFormError(result.error)
      return
    }

    onSuccess()
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>

      {/* Error general */}
      {formError && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{formError}</span>
        </div>
      )}

      {/* Monto */}
      <label className="form-control w-full">
        <div className="label"><span className="label-text font-medium">Monto *</span></div>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          placeholder="0.00"
          className="input input-bordered w-full"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </label>

      {/* Categoría */}
      <label className="form-control w-full">
        <div className="label"><span className="label-text font-medium">Categoría *</span></div>
        <select
          required
          className="select select-bordered w-full"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <optgroup label="Categorías">
            {allCategories.filter(c => !c.isCustom).map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </optgroup>
          {allCategories.some(c => c.isCustom) && (
            <optgroup label="— Mis categorías —">
              {allCategories.filter(c => c.isCustom).map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </label>

      {/* Fecha */}
      <label className="form-control w-full">
        <div className="label"><span className="label-text font-medium">Fecha *</span></div>
        <input
          type="date"
          required
          className="input input-bordered w-full"
          max={getLocalDateString()}
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </label>

      {/* Establecimiento */}
      <label className="form-control w-full">
        <div className="label"><span className="label-text font-medium">Establecimiento</span></div>
        <input
          type="text"
          className="input input-bordered w-full uppercase"
          placeholder="Ej: Walmart, Netflix, OXXO"
          value={establishment}
          onChange={e => setEstablishment(e.target.value.toUpperCase())}
        />
      </label>

      {/* Método de pago */}
      <label className="form-control w-full">
        <div className="label"><span className="label-text font-medium">Método de pago *</span></div>
        <select
          required
          className="select select-bordered w-full"
          value={paymentMethod}
          onChange={e => setPaymentMethod(e.target.value)}
        >
          {PAYMENT_METHODS.map(pm => (
            <option key={pm.id} value={pm.id}>{pm.label}</option>
          ))}
        </select>
      </label>

      {/* Descripción con contador */}
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text font-medium">Descripción</span>
          <span className={`label-text-alt ${description.length >= DESC_MAX ? 'text-error' : 'text-base-content/50'}`}>
            {description.length}/{DESC_MAX}
          </span>
        </div>
        <textarea
          className="textarea textarea-bordered w-full resize-none uppercase"
          placeholder="Opcional..."
          maxLength={DESC_MAX}
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value.toUpperCase())}
        />
      </label>

      {/* Acciones */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          className="bg-transparent border border-[#334155] text-[#94A3B8] hover:border-[#10B981] hover:text-[#10B981] rounded-lg px-4 py-2 transition-all duration-200 flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold border-none rounded-lg px-4 py-2 transition-all duration-200 flex-1"
          disabled={loading}
          aria-busy={loading}
        >
          {loading && <span className="loading loading-spinner loading-sm" />}
          {isEditing ? 'Guardar cambios' : 'Registrar gasto'}
        </button>
      </div>

    </form>
  )
}
