import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../../../lib/supabase'

// ── Tipos ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  loading: boolean
}

interface AuthResult {
  error: string | null
}

// ── Traducción de errores de Supabase al español ──────────────────────────────

function traducirError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'Credenciales incorrectas. Verifica tu email y contraseña.'
  if (message.includes('Email not confirmed'))
    return 'Debes confirmar tu email antes de iniciar sesión.'
  if (message.includes('User already registered'))
    return 'Este email ya está registrado. Intenta iniciar sesión.'
  if (message.includes('Password should be at least'))
    return 'La contraseña debe tener al menos 6 caracteres.'
  if (message.includes('Unable to validate email address'))
    return 'El formato del email no es válido.'
  if (message.includes('Email rate limit exceeded'))
    return 'Demasiados intentos. Espera unos minutos antes de volver a intentarlo.'
  if (message.includes('For security purposes'))
    return 'Por seguridad, espera unos segundos antes de volver a intentarlo.'
  return 'Ocurrió un error inesperado. Inténtalo de nuevo.'
}

// ── Hook principal ────────────────────────────────────────────────────────────

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true, // true al inicio: esperamos que Supabase restaure la sesión
  })

  // ── Escucha cambios de sesión ─────────────────────────────────────────────
  // onAuthStateChange dispara en: login, logout, registro, refresco de token
  // y también al cargar la app si ya hay sesión persistida en localStorage.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState({
          user: session?.user ?? null,
          loading: false,
        })
      }
    )

    // Limpieza: cancelar la suscripción al desmontar
    return () => subscription.unsubscribe()
  }, [])

  // ── Registro ──────────────────────────────────────────────────────────────
  async function signUp(email: string, password: string): Promise<AuthResult> {
    console.log('[useAuth] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL)
    console.log('[useAuth] VITE_SUPABASE_ANON_KEY exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
    const { error } = await supabase.auth.signUp({ email, password })
    return { error: error ? traducirError(error.message) : null }
  }

  // ── Inicio de sesión ──────────────────────────────────────────────────────
  async function signIn(email: string, password: string): Promise<AuthResult> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? traducirError(error.message) : null }
  }

  // ── Cierre de sesión ──────────────────────────────────────────────────────
  async function signOut(): Promise<AuthResult> {
    const { error } = await supabase.auth.signOut()
    return { error: error ? traducirError(error.message) : null }
  }

  // ── Recuperación de contraseña ────────────────────────────────────────────
  // Envía un email con link de reset. No revela si el email existe o no.
  async function resetPassword(email: string): Promise<AuthResult> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error: error ? traducirError(error.message) : null }
  }

  return {
    user: state.user,
    loading: state.loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }
}
