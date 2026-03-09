import { useAuth } from '../../auth/hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { ProfileForm } from '../components/ProfileForm'

// ── Icono User ────────────────────────────────────────────────────────────────

const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

// ── Componente ────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const { user }    = useAuth()
  const { profile } = useProfile()

  return (
    <div className="px-4 pt-6 pb-28 max-w-lg mx-auto flex flex-col gap-6">

      {/* Header — fuera de la card */}
      <div className="flex items-center gap-3">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover border border-[#10B981]/40"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
            <IconUser />
          </div>
        )}

        <div>
          <h1 className="text-xl font-bold text-white">Mi Perfil</h1>
          <p className="text-sm text-[#94A3B8]">{user?.email}</p>
        </div>
      </div>

      {/* Formulario — dentro de fn-card */}
      <ProfileForm />

    </div>
  )
}
