import { Bot } from 'lucide-react'

export function TypingIndicator() {
  return (
    <div className="flex gap-2 mb-4">
      {/* Avatar */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-fn-navy-600 text-fn-text-muted mt-0.5">
        <Bot size={14} />
      </div>

      {/* Bubble con puntos */}
      <div className="bg-fn-navy-800 border border-fn-navy-600 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 rounded-full bg-fn-text-muted animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-fn-text-muted animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-fn-text-muted animate-bounce" />
        </div>
      </div>
    </div>
  )
}
