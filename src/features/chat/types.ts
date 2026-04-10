export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatContext {
  userId: string
  includeGreeting?: boolean
  currentMonth: {
    total: number
    byCategory: { category: string; amount: number }[]
    topExpenses: { description: string; amount: number }[]
  }
  comparison?: {
    currentMonth: number
    previousMonth: number
    change: number
    changePercent: number
  }
}

export interface ChatResponse {
  response: string
  provider: string
  model: string
  timestamp: string
}
