import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  currency: string
  currency_symbol: string
  created_at: string
}

export interface SupportedCurrency {
  code: string
  name: string
  symbol: string
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useProfile() {
  const [profile, setProfile]       = useState<Profile | null>(null)
  const [currencies, setCurrencies] = useState<SupportedCurrency[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  // ── Carga inicial ──────────────────────────────────────────────────────────

  async function fetchProfile() {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    // Carga perfil
    const profileRes = await supabase.from('profiles').select('*').eq('id', user.id).single()

    // Si no existe perfil, crearlo con valores default
    if (profileRes.error && profileRes.error.code === 'PGRST116') {
      const defaults = { id: user.id, currency: 'MXN', currency_symbol: '$' }
      const { data: created, error: createErr } = await supabase
        .from('profiles')
        .insert(defaults)
        .select()
        .single()

      if (createErr) {
        setError('No se pudo inicializar el perfil.')
      } else {
        setProfile(created as Profile)
      }
    } else if (profileRes.error) {
      setError('Error al cargar el perfil.')
    } else {
      setProfile(profileRes.data as Profile)
    }

    // Carga monedas
    const { data: currenciesData, error: currenciesError } = await supabase
      .from('supported_currencies')
      .select('*')
      .order('code')

    if (currenciesError) {
      console.error('Error cargando monedas:', currenciesError)
    } else {
      setCurrencies(currenciesData || [])
    }

    setLoading(false)
  }

  useEffect(() => { fetchProfile() }, [])

  // ── updateProfile ──────────────────────────────────────────────────────────

  async function updateProfile(data: Partial<{
    full_name: string | null
    avatar_url: string | null
    currency: string
    currency_symbol: string
  }>): Promise<{ error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Debes iniciar sesión.' }

    const { error: sbError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, email: user.email, ...data }, { onConflict: 'id' })

    if (sbError) {
      console.error('Error upsert profiles:', sbError)
      return { error: 'Error al guardar el perfil.' }
    }
    setProfile(prev => prev ? { ...prev, ...data } : prev)
    return { error: null }
  }

  // ── uploadAvatar ───────────────────────────────────────────────────────────

  async function uploadAvatar(file: File): Promise<{ error: string | null }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Debes iniciar sesión.' }

    const ext  = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadErr) return { error: 'Error al subir la imagen.' }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const urlWithCache = `${publicUrl}?t=${Date.now()}`

    setProfile(prev => prev ? { ...prev, avatar_url: urlWithCache } : prev)
    return updateProfile({ avatar_url: urlWithCache })
  }

  // ── API pública ────────────────────────────────────────────────────────────

  return { profile, currencies, loading, error, updateProfile, uploadAvatar }
}
