import { useState } from 'react'
import { CATEGORIES }    from '../../../types/categories'
import type { RecurringFormData } from '../hooks/useRecurring'
import type { Database } from '../../../lib/database.types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type RecurringPaymentRow = Database['public']['Tables']['recurring_payments']['Row']

interface Props {
  recurring?:       RecurringPaymentRow // si se recibe, modo edición
  onSuccess:        () => void
  onCancel:         () => void
  createRecurring:  (data: RecurringFormData) => Promise<{ error: string | null }>
  updateRecurring:  (id: string, data: Partial<RecurringFormData>) => Promise<{ error: string | null }>
}

// ── Constantes ────────────────────────────────────────────────────────────────

const REMINDER_OPTIONS = [1, 2, 3, 5, 7] as const

// ── Componente ────────────────────────────────────────────────────────────────

export function RecurringForm({ recurring, onSuccess, onCancel, createRecurring, updateRecurring }: Props) {
  const isEditing = !!recurring

  // Estado del formulario
  const [name, setName]               = useState(recurring?.name ?? '')
  const [amount, setAmount]           = useState(recurring?.amount?.toString() ?? '')
  const [dueDay, setDueDay]           = useState(recurring?.due_day?.toString() ?? '1')
  const [category, setCategory]       = useState(recurring?.category ?? CATEGORIES[0].id)
  const [reminderDays, setReminder]   = useState(recurring?.reminder_days ?? 3)
  const [active, setActive]           = useState(recurring?.active ?? true)
  const [formError, setFormError]     = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const parsedAmount = parseFloat(amount)
    const parsedDueDay = parseInt(dueDay, 10)

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('El monto debe ser un número positivo.')
      return
    }
    if (isNaN(parsedDueDay) || parsedDueDay < 1 || parsedDueDay > 31) {
      setFormError('El día de vencimiento debe estar entre 1 y 31.')
      return
    }

    const formData = {
      name: name.trim(),
      amount: parsedAmount,
      due_day: parsedDueDay,
      category,
      reminder_days: reminderDays,
      active,
    }

    setLoading(true)
    const result = isEditing
      ? await updateRecurring(recurring.id, formData)
      : await createRecurring(formData)
    setLoading(false)

    if (result.error) { setFormError(result.error); return }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full" noValidate>

      {formError && (
        <div role="alert" className="alert alert-error text-sm"><span>{formError}</span></div>
      )}

      {/* Nombre */}
      <label className="form-control w-full">
        <div className="label"><span className="label-text font-medium">Nombre *</span></div>
        <input type="text" required placeholder="Netflix, Renta, Gimnasio..."
          className="input input-bordered w-full uppercase" value={name} onChange={e => setName(e.target.value.toUpperCase())} />
      </label>

      {/* Monto */}
      <label className="form-control w-full">
        <div className="label"><span className="label-text font-medium">Monto *</span></div>
        <input type="number" inputMode="decimal" step="0.01" min="0.01" required placeholder="0.00"
          className="input input-bordered w-full" value={amount} onChange={e => setAmount(e.target.value)} />
      </label>

      {/* Día de vencimiento + Recordatorio */}
      <div className="flex gap-3">
        <label className="form-control flex-1">
          <div className="label"><span className="label-text font-medium">Día de vencimiento *</span></div>
          <input type="number" min="1" max="31" required
            className="input input-bordered w-full" value={dueDay} onChange={e => setDueDay(e.target.value)} />
        </label>
        <label className="form-control flex-1">
          <div className="label"><span className="label-text font-medium">Recordatorio</span></div>
          <select className="select select-bordered w-full"
            value={reminderDays} onChange={e => setReminder(Number(e.target.value))}>
            {REMINDER_OPTIONS.map(d => (
              <option key={d} value={d}>{d} día{d !== 1 ? 's' : ''} antes</option>
            ))}
          </select>
        </label>
      </div>

      {/* Categoría */}
      <label className="form-control w-full">
        <div className="label"><span className="label-text font-medium">Categoría *</span></div>
        <select required className="select select-bordered w-full"
          value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
          ))}
        </select>
      </label>

      {/* Toggle activo */}
      <label className="flex items-center gap-3 cursor-pointer py-1">
        <input type="checkbox" className="toggle toggle-primary"
          checked={active} onChange={e => setActive(e.target.checked)} />
        <span className="label-text font-medium">Pago activo</span>
      </label>

      {/* Acciones */}
      <div className="flex gap-3 pt-2">
        <button type="button" className="btn btn-ghost flex-1" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary flex-1" disabled={loading} aria-busy={loading}>
          {loading && <span className="loading loading-spinner loading-sm" />}
          {isEditing ? 'Guardar cambios' : 'Crear pago'}
        </button>
      </div>

    </form>
  )
}
