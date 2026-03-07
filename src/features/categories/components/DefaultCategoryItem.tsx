// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  emoji: string
  label: string
}

// ── Componente ────────────────────────────────────────────────────────────────

export function DefaultCategoryItem({ emoji, label }: Props) {
  return (
    <div className="fn-card p-4 opacity-75">
      <div className="flex items-center gap-3">
        <span className="text-2xl leading-none" aria-hidden="true">{emoji}</span>
        <p className="flex-1 font-medium text-sm uppercase">{label}</p>
        <span className="badge badge-ghost badge-sm text-base-content/50">Sistema</span>
      </div>
    </div>
  )
}
