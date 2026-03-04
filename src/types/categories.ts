export const CATEGORIES = [
  { id: 'alimentacion',    label: 'Alimentación',      emoji: '🍔' },
  { id: 'vivienda',        label: 'Vivienda',           emoji: '🏠' },
  { id: 'transporte',      label: 'Transporte / Gas',   emoji: '🚗' },
  { id: 'salud',           label: 'Salud',              emoji: '💊' },
  { id: 'entretenimiento', label: 'Entretenimiento',    emoji: '🎮' },
  { id: 'ropa',            label: 'Ropa',               emoji: '👕' },
  { id: 'educacion',       label: 'Educación',          emoji: '📚' },
  { id: 'trabajo',         label: 'Trabajo',            emoji: '💼' },
  { id: 'mascotas',        label: 'Mascotas',           emoji: '🐾' },
  { id: 'regalos',         label: 'Regalos',            emoji: '🎁' },
  { id: 'deudas',          label: 'Deudas / Créditos', emoji: '💳' },
  { id: 'otros',           label: 'Otros',              emoji: '📦' },
] as const

export type CategoryId = typeof CATEGORIES[number]['id']
