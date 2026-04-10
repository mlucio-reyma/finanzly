import type { ChatContext, ChatResponse } from '../features/chat/types'

export async function sendChatMessage(message: string, context: ChatContext): Promise<string> {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_CHAT

  if (!webhookUrl) {
    throw new Error('El servicio de chat no está configurado.')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30_000)

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, provider: 'groq' }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const data: ChatResponse = await response.json()
    return data.response
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('La IA tardó demasiado en responder. Inténtalo de nuevo.')
      }
      throw err
    }
    throw new Error('Ocurrió un error inesperado al contactar la IA.')
  } finally {
    clearTimeout(timeoutId)
  }
}
