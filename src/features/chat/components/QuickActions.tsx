import { Sparkles } from 'lucide-react'

interface QuickActionsProps {
  onActionClick: (message: string) => void
}

const SUGGESTIONS = [
  { label: '¿En qué gasté más?',         emoji: '📊' },
  { label: '¿Cómo van mis finanzas?',     emoji: '💰' },
  { label: 'Dame consejos para ahorrar',  emoji: '💡' },
  { label: 'Compara con el mes anterior', emoji: '📅' },
] as const

export function QuickActions({ onActionClick }: QuickActionsProps) {
  return (
    <div className="flex flex-col gap-3 py-4 px-1">
      <div className="flex items-center gap-2 text-fn-text-muted">
        <Sparkles size={14} />
        <span className="text-xs font-medium">Sugerencias rápidas</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map(({ label, emoji }) => (
          <button
            key={label}
            onClick={() => onActionClick(label)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-fn-navy-600 bg-fn-navy-800 text-fn-text-muted hover:border-fn-emerald/50 hover:text-fn-emerald hover:bg-fn-emerald/5 transition-all duration-150"
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
