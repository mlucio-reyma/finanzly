import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function LoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: authError } = await signIn(email, password)

    if (authError) {
      setError(authError)
      setLoading(false)
      return
    }

    navigate('/dashboard', { replace: true })
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

      <div className="form-control mb-2">
        <label className="label" htmlFor="password">
          <span className="label-text">Contraseña</span>
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className="input input-bordered w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          aria-label="Contraseña"
        />
        <label className="label">
          <Link to="/forgot-password" className="label-text-alt link link-hover">
            ¿Olvidaste tu contraseña?
          </Link>
        </label>
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
        aria-label="Iniciar sesión"
      >
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>

      <p className="text-center text-sm mt-6 text-base-content/70">
        ¿No tienes cuenta?{' '}
        <Link to="/register" className="link link-primary font-medium">
          Regístrate
        </Link>
      </p>
    </form>
  )
}
