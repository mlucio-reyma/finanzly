// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

// ── Componente ────────────────────────────────────────────────────────────────

export function DeleteConfirmModal({ isOpen, onConfirm, onCancel, loading }: Props) {
  if (!isOpen) return null

  return (
    <div className={`modal modal-open`}>
      {/* Backdrop: clic fuera cancela */}
      <div className="modal-backdrop" onClick={onCancel} aria-hidden="true" />

      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <h3 id="delete-modal-title" className="font-bold text-lg">
          ¿Eliminar gasto?
        </h3>
        <p className="py-4 text-base-content/70">
          Esta acción <span className="font-semibold text-error">no se puede deshacer</span>.
        </p>

        <div className="modal-action gap-2">
          <button
            type="button"
            className="btn btn-ghost flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-error flex-1"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
          >
            {loading && <span className="loading loading-spinner loading-sm" />}
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
