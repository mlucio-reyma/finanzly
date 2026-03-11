export const CATEGORIES = [
  { id: 'alimentacion',    label: 'ALIMENTACIÓN',      emoji: '🍔' },
  { id: 'vivienda',        label: 'VIVIENDA',           emoji: '🏠' },
  { id: 'transporte',      label: 'TRANSPORTE / GAS',   emoji: '🚗' },
  { id: 'salud',           label: 'SALUD',              emoji: '💊' },
  { id: 'entretenimiento', label: 'ENTRETENIMIENTO',    emoji: '🎮' },
  { id: 'ropa',            label: 'ROPA',               emoji: '👕' },
  { id: 'educacion',       label: 'EDUCACIÓN',          emoji: '📚' },
  { id: 'trabajo',         label: 'TRABAJO',            emoji: '💼' },
  { id: 'mascotas',        label: 'MASCOTAS',           emoji: '🐾' },
  { id: 'regalos',         label: 'REGALOS',            emoji: '🎁' },
  { id: 'deudas',          label: 'DEUDAS / CRÉDITOS', emoji: '💳' },
  { id: 'otros',           label: 'OTROS',              emoji: '📦' },
] as const

export type CategoryId = typeof CATEGORIES[number]['id']

export type CustomCategory = {
  id: string
  user_id: string
  label: string
  emoji: string
  color: string
  active: boolean
  created_at: string
}
