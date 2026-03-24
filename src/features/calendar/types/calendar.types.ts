// ── Tipos del feature Calendario ─────────────────────────────────────────────

export interface ExpenseEntry {
  id: string
  amount: number
  description: string | null
  category: {
    name: string
    icon: string
    color?: string
  }
}

export interface RecurrentEntry {
  id: string
  name: string
  amount: number
  dueDay: number
  isPaid: boolean
}

export interface DayData {
  date: string           // YYYY-MM-DD
  expenses: ExpenseEntry[]
  recurrents: RecurrentEntry[]
  totalExpenses: number
  totalRecurrents: number
  hasExpenses: boolean
  hasRecurrents: boolean
}

export type CalendarDataMap = Record<string, DayData>
