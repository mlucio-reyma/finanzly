import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { X, Send, Trash2, MessageCircle } from 'lucide-react'
import { useChat } from '../hooks/useChat'
import { Message } from './Message'
import { TypingIndicator } from './TypingIndicator'
import { QuickActions } from './QuickActions'

interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
  const [input, setInput] = useState('')
  const { messages, isLoading, error, sendMessage, clearHistory } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef    = useRef<HTMLTextAreaElement>(null)

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus en el input cuando se abre; limpiar historial cuando se cierra
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 250)
    } else {
      clearHistory()
      setInput('')
    }
  // clearHistory es estable (useCallback sin deps), no necesita estar en deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Auto-resize del textarea
  function handleInput() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await sendMessage(text)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasMessages = messages.length > 0

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[59] backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Chat financiero"
        aria-modal="true"
        className={`
          fixed top-0 right-0 h-full z-[60] flex flex-col
          w-full md:w-[400px]
          bg-fn-navy border-l border-fn-navy-700
          shadow-2xl transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-fn-navy-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-fn-emerald/10 flex items-center justify-center">
              <MessageCircle size={16} className="text-fn-emerald" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-fn-text">Chat Financiero</h2>
              <p className="text-[11px] text-fn-text-muted">IA · Solo esta sesión</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {hasMessages && (
              <button
                onClick={clearHistory}
                aria-label="Limpiar historial"
                className="p-1.5 rounded-lg text-fn-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Cerrar chat"
              className="p-1.5 rounded-lg text-fn-text-muted hover:text-fn-text hover:bg-fn-navy-700 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Cuerpo ── */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {!hasMessages && !isLoading && (
            <QuickActions onActionClick={(msg) => sendMessage(msg)} />
          )}

          {messages.map(msg => (
            <Message key={msg.id} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}

          {error && (
            <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Footer / Input ── */}
        <div className="px-4 py-3 border-t border-fn-navy-700 shrink-0">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Pregunta sobre tus finanzas..."
              className="flex-1 resize-none text-sm px-3 py-2 rounded-xl bg-fn-navy-800 border border-fn-navy-600 text-fn-text placeholder:text-fn-text-muted outline-none focus:border-fn-emerald/50 focus:ring-1 focus:ring-fn-emerald/20 disabled:opacity-50 transition overflow-hidden"
              style={{ minHeight: '38px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Enviar mensaje"
              className="flex-shrink-0 p-2.5 rounded-xl bg-fn-emerald hover:bg-fn-emerald-dark text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={15} />
            </button>
          </div>
          <p className="text-[10px] text-fn-text-muted mt-1.5 text-center">
            Enter para enviar · Shift+Enter para nueva línea
          </p>
        </div>
      </div>
    </>
  )
}
