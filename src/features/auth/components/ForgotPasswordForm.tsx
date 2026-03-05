import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: authError } = await resetPassword(email)
    setLoading(false)

    if (authError) {
      setError(authError)
      return
    }

    // Mensaje genérico: no revelamos si el email existe o no
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="space-y-4">
        <div role="alert" className="alert alert-success text-sm">
          <span>
            Si ese correo está registrado, recibirás un enlace para restablecer tu contraseña en breve.
          </span>
        </div>
        <div className="text-center">
          <Link to="/login" className="link link-primary text-sm font-medium">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p className="text-sm text-base-content/70 mb-6">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>

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

      {error && (
        <div role="alert" className="alert alert-error mb-4 py-2 text-sm">
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={loading}
        aria-label="Enviar enlace de recuperación"
      >
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
      </button>

      <p className="text-center text-sm mt-6">
        <Link to="/login" className="link link-primary font-medium">
          Volver al inicio de sesión
        </Link>
      </p>
    </form>
  )
}
