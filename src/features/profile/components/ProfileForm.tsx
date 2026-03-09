import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { AvatarUpload } from './AvatarUpload'

// ── Componente ────────────────────────────────────────────────────────────────

export function ProfileForm() {
  const { user, signOut }                                              = useAuth()
  const { profile, currencies, loading, updateProfile, uploadAvatar } = useProfile()
  const navigate                                                       = useNavigate()

  const [fullName, setFullName] = useState('')
  const [currency, setCurrency] = useState('MXN')
  const [saving, setSaving]     = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Sincronizar campos cuando carga el perfil
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      setCurrency(profile.currency)
    }
  }, [profile])

  // Deriva el símbolo según la moneda seleccionada
  function getCurrencySymbol(code: string): string {
    return currencies.find(c => c.code === code)?.symbol ?? '$'
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFeedback(null)

    const { error } = await updateProfile({
      full_name:       fullName.trim() || null,
      currency,
      currency_symbol: getCurrencySymbol(currency),
    })

    setFeedback(
      error
        ? { type: 'error',   msg: error }
        : { type: 'success', msg: 'Perfil guardado correctamente.' }
    )
    setSaving(false)
  }

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="fn-card p-6 flex flex-col gap-4 animate-pulse">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-white/10" />
        </div>
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-10 bg-white/10 rounded" />
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="h-10 bg-white/10 rounded" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="fn-card p-6 flex flex-col gap-4">

      {/* AvatarUpload — centrado dentro de la card */}
      <div className="flex justify-center mb-6">
        <AvatarUpload
          avatarUrl={profile?.avatar_url ?? null}
          fullName={profile?.full_name ?? null}
          onUpload={uploadAvatar}
        />
      </div>

      {/* Nombre completo */}
      <div className="flex flex-col gap-1">
        <label htmlFor="full_name" className="text-sm font-medium text-[#94A3B8]">
          Nombre completo
        </label>
        <input
          id="full_name"
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Tu nombre"
          className="fn-input w-full px-3 py-2 rounded-lg"
        />
      </div>

      {/* Email — solo lectura */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <label htmlFor="email" className="text-sm font-medium text-[#94A3B8]">
            Email
          </label>
          <span className="badge badge-xs bg-white/10 text-[#94A3B8] border-0">
            No editable
          </span>
        </div>
        <input
          id="email"
          type="email"
          value={user?.email ?? ''}
          readOnly
          className="fn-input w-full px-3 py-2 rounded-lg opacity-60 cursor-not-allowed"
          aria-readonly="true"
        />
      </div>

      {/* Moneda preferida */}
      <div className="flex flex-col gap-1">
        <label htmlFor="currency" className="text-sm font-medium text-[#94A3B8]">
          Moneda preferida
        </label>
        <select
          id="currency"
          value={currency}
          onChange={e => setCurrency(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-[#1E293B] border border-[#10B981]/20 text-[#F1F5F9] focus:outline-none focus:border-[#10B981]"
        >
          {currencies.map(c => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.name} ({c.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          role="alert"
          className={`text-sm px-4 py-3 rounded-lg ${
            feedback.type === 'success'
              ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* Guardar */}
      <button
        type="submit"
        disabled={saving}
        className="fn-btn-primary"
        aria-label="Guardar cambios"
      >
        {saving ? <span className="loading loading-spinner loading-sm" /> : 'Guardar cambios'}
      </button>

      {/* Zona de peligro */}
      <div className="border border-red-500/20 rounded-lg p-4 flex flex-col gap-3 mt-8">
        <p className="text-sm font-medium text-red-400">Zona de peligro</p>
        <button
          type="button"
          onClick={handleLogout}
          className="bg-transparent border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-colors rounded-lg px-4 py-2 text-sm font-medium w-full"
          aria-label="Cerrar sesión"
        >
          Cerrar sesión
        </button>
      </div>

    </form>
  )
}
