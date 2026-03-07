import { useState } from 'react'
import type { CustomCategory } from '../../../types/categories'

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

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  category:     CustomCategory
  onEdit:       (category: CustomCategory) => void
  onDelete:     (id: string) => Promise<{ error: string | null }>
  onToggle:     (id: string, active: boolean) => Promise<{ error: string | null }>
}

// ── Componente ────────────────────────────────────────────────────────────────

export function CategoryItem({ category, onEdit, onDelete, onToggle }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]           = useState(false)
  const [toggling, setToggling]           = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await onDelete(category.id)
    setDeleting(false)
  }

  async function handleToggle() {
    setToggling(true)
    await onToggle(category.id, !category.active)
    setToggling(false)
  }

  return (
    <div className={`fn-card p-4 transition-opacity ${!category.active ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">

        {/* Emoji + color dot */}
        <span className="text-2xl leading-none" aria-hidden="true">{category.emoji}</span>

        {/* Nombre + badge de color */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm uppercase ${!category.active ? 'line-through text-base-content/50' : ''}`}>
            {category.label}
          </p>
          <span
            className="inline-block w-3 h-3 rounded-full mt-1"
            style={{ backgroundColor: category.color }}
            aria-hidden="true"
          />
        </div>

        {/* Toggle activo/inactivo */}
        <label className="cursor-pointer" aria-label={category.active ? 'Desactivar categoría' : 'Activar categoría'}>
          <input
            type="checkbox"
            className="toggle toggle-success toggle-sm"
            checked={category.active}
            onChange={handleToggle}
            disabled={toggling}
          />
        </label>

        {/* Editar */}
        {!confirmDelete && (
          <button
            type="button"
            className="btn btn-ghost btn-xs text-base-content/60 hover:text-[#10B981]"
            onClick={() => onEdit(category)}
            aria-label="Editar categoría"
          >
            <IconEdit />
          </button>
        )}

        {/* Eliminar / Confirmación inline */}
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-base-content/70">¿Eliminar?</span>
            <button
              type="button"
              className="btn btn-error btn-xs"
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Confirmar eliminación"
            >
              {deleting ? <span className="loading loading-spinner loading-xs" /> : 'Sí'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => setConfirmDelete(false)}
              aria-label="Cancelar eliminación"
            >
              No
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-ghost btn-xs text-base-content/60 hover:text-error"
            onClick={() => setConfirmDelete(true)}
            aria-label="Eliminar categoría"
          >
            <IconTrash />
          </button>
        )}

      </div>
    </div>
  )
}
