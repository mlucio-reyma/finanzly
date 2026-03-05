import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabase'

export function ResetPasswordForm() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError('No se pudo actualizar la contraseña. El enlace puede haber expirado.')
      return
    }

    setSuccess(true)
    setTimeout(() => navigate('/login', { replace: true }), 2500)
  }

  if (success) {
    return (
      <div role="alert" className="alert alert-success text-sm">
        <span>
          Contraseña actualizada correctamente. Redirigiendo al inicio de sesión...
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-control mb-4">
        <label className="label" htmlFor="password">
          <span className="label-text">Nueva contraseña</span>
        </label>
        <input
          id="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          aria-label="Nueva contraseña"
        />
      </div>

      <div className="form-control mb-2">
        <label className="label" htmlFor="confirm-password">
          <span className="label-text">Confirmar nueva contraseña</span>
        </label>
        <input
          id="confirm-password"
          type="password"
          placeholder="Repite tu nueva contraseña"
          className="input input-bordered w-full"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          aria-label="Confirmar nueva contraseña"
        />
      </div>

      {error && (
        <div role="alert" className="alert alert-error mb-4 py-2 text-sm">
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
        aria-label="Guardar nueva contraseña"
      >
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
      </button>
    </form>
  )
}
