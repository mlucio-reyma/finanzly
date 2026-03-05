import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function RegisterForm() {
  const { signUp } = useAuth()

  const [email, setEmail] = useState('')
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
    const { error: authError } = await signUp(email, password)
    setLoading(false)

    if (authError) {
      setError(authError)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div role="alert" className="alert alert-success text-sm">
        <span>
          Revisa tu correo <strong>{email}</strong> y confirma tu cuenta para continuar.
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-control mb-4">
        <label className="label" htmlFor="email">
          <span className="label-text">Correo electrónico</span>
        </label>
        <input
          id="email"
          type="email"
          placeholder="tu@email.com"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          aria-label="Correo electrónico"
        />
      </div>

      <div className="form-control mb-4">
        <label className="label" htmlFor="password">
          <span className="label-text">Contraseña</span>
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
          aria-label="Contraseña"
        />
      </div>

      <div className="form-control mb-2">
        <label className="label" htmlFor="confirm-password">
          <span className="label-text">Confirmar contraseña</span>
        </label>
        <input
          id="confirm-password"
          type="password"
          placeholder="Repite tu contraseña"
          className="input input-bordered w-full"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          aria-label="Confirmar contraseña"
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
        aria-label="Crear cuenta"
      >
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className="text-center text-sm mt-6 text-base-content/70">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="link link-primary font-medium">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
