export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          amount: number
          category: string
          date: string
          description: string | null
          establishment: string | null
          payment_method: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          category: string
          date: string
          description?: string | null
          establishment?: string | null
          payment_method: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          category?: string
          date?: string
          description?: string | null
          establishment?: string | null
          payment_method?: string
          created_at?: string
          updated_at?: string
        }
      }
      recurring_payments: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          due_day: number
          category: string
          reminder_days: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          due_day: number
          category: string
          reminder_days: number
          active: boolean
          created_at?: string
        }
        Update: {
          id: string
          user_id?: string
          name?: string
          amount?: number
          due_day?: number
          category?: string
          reminder_days?: number
          active?: boolean
          created_at?: string
        }
      }
      recurring_payments_log: {
        Row: {
          id: string
          recurring_payment_id: string
          user_id: string
          paid_month: string
          expense_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recurring_payment_id: string
          user_id: string
          paid_month: string
          expense_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recurring_payment_id?: string
          user_id?: string
          paid_month?: string
          expense_id?: string | null
          created_at?: string
        }
      }
      monthly_scores: {
        Row: {
          id: string
          user_id: string
          month: string
          score: number | null
          factors: Record<string, number> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          month: string
          score?: number | null
          factors?: Record<string, number> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          month?: string
          score?: number | null
          factors?: Record<string, number> | null
          created_at?: string
        }
      }
    }
  }
}
