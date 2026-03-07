import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { CATEGORIES } from '../../../types/categories'
import type { CustomCategory } from '../../../types/categories'

// ── Tipos públicos ─────────────────────────────────────────────────────────────

export type UnifiedCategory = {
  value:    string
  label:    string
  emoji:    string
  color?:   string
  isCustom: boolean
}

export type CategoryFormData = {
  label: string
  emoji: string
  color: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function traducirError(msg: string): string {
  if (msg.includes('JWT') || msg.includes('session')) return 'Tu sesión ha expirado.'
  if (msg.includes('network') || msg.includes('fetch'))  return 'Error de conexión.'
  return 'Ocurrió un error inesperado.'
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCategories() {
  const [categories, setCategories] = useState<CustomCategory[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  // Combinación de predefinidas + custom activas
  const allCategories: UnifiedCategory[] = [
    ...CATEGORIES.map(c => ({ value: c.id, label: c.label, emoji: c.emoji, isCustom: false })),
    ...categories
      .filter(c => c.active)
      .map(c => ({ value: `custom_${c.id}`, label: c.label, emoji: c.emoji, color: c.color, isCustom: true })),
  ]

  // ── Carga ────────────────────────────────────────────────────────────────────

  async function fetchCategories() {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data, error: sbError } = await supabase
      .from('custom_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (sbError) {
      setError(traducirError(sbError.message))
    } else {
      setCategories(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  async function createCategory(data: CategoryFormData): Promise<{ error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Debes iniciar sesión.' }

    const { error: sbError } = await supabase
      .from('custom_categories')
      .insert({ ...data, user_id: user.id, active: true })

    if (sbError) return { error: 'Error al crear la categoría.' }
    await fetchCategories()
    return { error: null }
  }

  async function updateCategory(
    id: string,
    data: Partial<CategoryFormData>
  ): Promise<{ error: string | null }> {
    const { error: sbError } = await supabase
      .from('custom_categories')
      .update(data)
      .eq('id', id)

    if (sbError) return { error: 'Error al actualizar la categoría.' }
    await fetchCategories()
    return { error: null }
  }

  async function deleteCategory(id: string): Promise<{ error: string | null }> {
    const { error: sbError } = await supabase
      .from('custom_categories')
      .delete()
      .eq('id', id)

    if (sbError) return { error: 'Error al eliminar la categoría.' }
    setCategories(prev => prev.filter(c => c.id !== id))
    return { error: null }
  }

  async function toggleActive(id: string, active: boolean): Promise<{ error: string | null }> {
    const { error: sbError } = await supabase
      .from('custom_categories')
      .update({ active })
      .eq('id', id)

    if (sbError) return { error: 'Error al actualizar la categoría.' }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active } : c))
    return { error: null }
  }

  // ── API pública ───────────────────────────────────────────────────────────────

  return {
    categories,
    allCategories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleActive,
  }
}
