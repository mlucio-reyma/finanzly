import { useState } from 'react'
import type { CustomCategory } from '../../../types/categories'
import type { CategoryFormData } from '../hooks/useCategories'

// ── Constantes ────────────────────────────────────────────────────────────────

const EMOJIS = [
  '💰','💳','🏠','🚗','✈️','🍔','🎮','📱',
  '💊','🛒','👗','🎓','💼','🏋️','🎬','🐾',
  '⚡','🌮','🍺','☕','🎁','💈','🏥','🚌',
  '💅','🎵','🏦','🧴','🛵','🌱',
]

const COLORS = [
  '#10B981','#3B82F6','#F59E0B','#F87171',
  '#A78BFA','#FB923C','#F472B6','#38BDF8',
]

const LABEL_MAX = 30

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  category?: CustomCategory
  onSuccess: () => void
  onCancel:  () => void
  onCreate:  (data: CategoryFormData) => Promise<{ error: string | null }>
  onUpdate:  (id: string, data: Partial<CategoryFormData>) => Promise<{ error: string | null }>
}

// ── Componente ────────────────────────────────────────────────────────────────

export function CategoryForm({ category, onSuccess, onCancel, onCreate, onUpdate }: Props) {
  const isEditing = !!category

  const [label, setLabel]   = useState(category?.label ?? '')
  const [emoji, setEmoji]   = useState(category?.emoji ?? EMOJIS[0])
  const [color, setColor]   = useState(category?.color ?? COLORS[0])
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (!label.trim()) { setFormError('El nombre es obligatorio.'); return }

    const data: CategoryFormData = { label: label.trim(), emoji, color }

    setLoading(true)
    const result = isEditing
      ? await onUpdate(category.id, data)
      : await onCreate(data)
    setLoading(false)

    if (result.error) { setFormError(result.error); return }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

      {formError && (
        <div role="alert" className="alert alert-error text-sm"><span>{formError}</span></div>
      )}

      {/* Nombre */}
      <label className="form-control w-full">
        <div className="label">
          <span className="label-text font-medium">Nombre *</span>
          <span className="label-text-alt text-base-content/50">{label.length}/{LABEL_MAX}</span>
        </div>
        <input
          type="text"
          required
          maxLength={LABEL_MAX}
          placeholder="Ej: Café, Barbería, Gym..."
          className="fn-input uppercase"
          value={label}
          onChange={e => setLabel(e.target.value.toUpperCase())}
        />
      </label>

      {/* Emoji */}
      <div>
        <p className="label-text font-medium mb-2">Emoji</p>
        <div className="grid grid-cols-8 gap-1 max-h-24 overflow-y-auto p-1 bg-base-200 rounded-lg">
          {EMOJIS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`text-xl p-1 rounded-md transition-colors ${
                emoji === e ? 'bg-[#10B981]/20 ring-2 ring-[#10B981]' : 'hover:bg-base-300'
              }`}
              aria-label={`Emoji ${e}`}
              aria-pressed={emoji === e}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="label-text font-medium mb-2">Color</p>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-transform ${
                color === c ? 'ring-2 ring-offset-2 ring-offset-base-100 ring-white scale-110' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
              aria-pressed={color === c}
            />
          ))}
        </div>
      </div>

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
          {loading && <span className="loading loading-spinner loading-sm mr-1" />}
          {isEditing ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </div>

    </form>
  )
}
