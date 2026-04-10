import { useState, useCallback } from 'react'
import { sendChatMessage } from '../../../lib/ai-chat'
import { useChatContext } from './useChatContext'
import type { ChatMessage } from '../types'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getChatContext } = useChatContext()

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const isFirstMessage = messages.length === 1 // el mensaje del user ya fue agregado
      const context = await getChatContext(isFirstMessage)
      if (!context) {
        setError('No se pudo obtener tu información financiera. Intenta de nuevo.')
        return
      }

      const response = await sendChatMessage(message.trim(), context)

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al contactar la IA. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }, [getChatContext])

  const clearHistory = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, clearHistory }
}
