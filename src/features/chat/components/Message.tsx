import { User, Bot } from 'lucide-react'
import type { ChatMessage } from '../types'

interface MessageProps {
  message: ChatMessage
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user'
  const time = message.timestamp.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
        isUser
          ? 'bg-fn-emerald/20 text-fn-emerald'
          : 'bg-fn-navy-600 text-fn-text-muted'
      }`}>
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-fn-emerald text-white rounded-tr-sm'
            : 'bg-fn-navy-800 text-fn-text rounded-tl-sm border border-fn-navy-600'
        }`}>
          {message.content}
        </div>
        <span className="text-[11px] text-fn-text-muted px-1">{time}</span>
      </div>
    </div>
  )
}
