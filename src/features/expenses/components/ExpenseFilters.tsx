import { useState } from 'react'
import { CATEGORIES } from '../../../types/categories'
import type { ExpenseFilters } from '../hooks/useExpenses'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  onApplyFilters: (filters: ExpenseFilters) => void
  onClearFilters: () => void
}

// ── Helpers para fechas por defecto ───────────────────────────────────────────

function firstDayOfMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

// ── Constantes ────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = [
  { id: '',              label: 'Todos' },
  { id: 'efectivo',      label: 'Efectivo' },
  { id: 'debito',        label: 'Débito' },
  { id: 'credito',       label: 'Crédito' },
  { id: 'transferencia', label: 'Transferencia' },
]

// ── Componente ────────────────────────────────────────────────────────────────

export function ExpenseFilters({ onApplyFilters, onClearFilters }: Props) {
  // Visibilidad del panel en móvil
  const [isOpen, setIsOpen] = useState(false)

  // Estado de los filtros
  const [startDate, setStartDate]           = useState(firstDayOfMonth())
  const [endDate, setEndDate]               = useState(today())
  const [selectedCategories, setCategories] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod]   = useState('')

  // ── Manejo de categorías (selección múltiple) ──────────────────────────────
  function toggleCategory(id: string) {
    setCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  // ── Aplicar ────────────────────────────────────────────────────────────────
  function handleApply() {
    onApplyFilters({
      startDate:     startDate || undefined,
      endDate:       endDate || undefined,
      categories:    selectedCategories.length > 0 ? selectedCategories : undefined,
      paymentMethod: paymentMethod || undefined,
    })
    setIsOpen(false)
  }

  // ── Limpiar ────────────────────────────────────────────────────────────────
  function handleClear() {
    setStartDate(firstDayOfMonth())
    setEndDate(today())
    setCategories([])
    setPaymentMethod('')
    onClearFilters()
    setIsOpen(false)
  }

  return (
    <div className="w-full">

      {/* Botón toggle — solo visible en móvil */}
      <button
        type="button"
        className="btn btn-ghost btn-sm w-full justify-between md:hidden mb-2"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        aria-controls="expense-filters-panel"
      >
        <span>Filtros</span>
        <span aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Panel — oculto en móvil si isOpen=false, siempre visible en md+ */}
      <div
        id="expense-filters-panel"
        className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col gap-4 p-4 bg-base-200 rounded-box`}
      >

        {/* Rango de fechas */}
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="form-control flex-1">
            <div className="label"><span className="label-text">Desde</span></div>
            <input
              type="date"
              className="input input-bordered input-sm w-full"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </label>
          <label className="form-control flex-1">
            <div className="label"><span className="label-text">Hasta</span></div>
            <input
              type="date"
              className="input input-bordered input-sm w-full"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </label>
        </div>

        {/* Método de pago */}
        <label className="form-control">
          <div className="label"><span className="label-text">Método de pago</span></div>
          <select
            className="select select-bordered select-sm w-full"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
          >
            {PAYMENT_METHODS.map(pm => (
              <option key={pm.id} value={pm.id}>{pm.label}</option>
            ))}
          </select>
        </label>

        {/* Categorías — selección múltiple con checkboxes en grid */}
        <fieldset>
          <legend className="label-text mb-2">Categorías</legend>
          <div className="grid grid-cols-2 gap-1">
            {CATEGORIES.map(cat => (
              <label
                key={cat.id}
                className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-base-300 transition-colors"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-success"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  aria-label={cat.label}
                />
                <span className="text-sm truncate">{cat.emoji} {cat.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Acciones */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            className="bg-transparent border border-[#334155] text-[#94A3B8] hover:border-[#10B981] hover:text-[#10B981] rounded-lg px-4 py-2 transition-all duration-200 flex-1"
            onClick={handleClear}
          >
            Limpiar filtros
          </button>
          <button
            type="button"
            className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold border-none rounded-lg px-4 py-2 transition-all duration-200 flex-1"
            onClick={handleApply}
          >
            Aplicar filtros
          </button>
        </div>

      </div>
    </div>
  )
}
