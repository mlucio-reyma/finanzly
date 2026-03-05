import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'

interface Props {
  children: ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth()

  // Esperando a que Supabase restaure la sesión desde localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" aria-label="Cargando" />
      </div>
    )
  }

  // Sin sesión activa → redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Sesión válida → renderizar la ruta protegida
  return children
}
