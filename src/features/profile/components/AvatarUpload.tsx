import { useRef, useState } from 'react'
import { User } from 'lucide-react'

// ── Props ─────────────────────────────────────────────────────────────────────

interface AvatarUploadProps {
  avatarUrl:    string | null
  fullName:     string | null
  onUpload:     (file: File) => Promise<{ error: string | null }>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string | null): string | null {
  if (!name?.trim()) return null
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

// ── Componente ────────────────────────────────────────────────────────────────

export function AvatarUpload({ avatarUrl, fullName, onUpload }: AvatarUploadProps) {
  const inputRef                  = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)

  const initials = getInitials(fullName)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setSizeError(null)

    if (file.size > 2 * 1024 * 1024) {
      setSizeError('La imagen no puede superar 2 MB.')
      e.target.value = ''
      return
    }

    setUploading(true)
    await onUpload(file)
    setUploading(false)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-24 h-24 rounded-full cursor-pointer group"
        onClick={() => !uploading && inputRef.current?.click()}
        role="button"
        aria-label="Cambiar foto de perfil"
      >
        {/* Avatar, iniciales o ícono User */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-2 border-[#10B981]"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#10B981] border-2 border-[#10B981] flex items-center justify-center">
            {initials ? (
              <span className="text-white font-bold text-2xl select-none">{initials}</span>
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
        )}

        {/* Overlay hover / loading */}
        {uploading ? (
          <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
            <span className="loading loading-spinner loading-sm text-white" />
          </div>
        ) : (
          <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium text-center leading-tight px-1">
              Cambiar<br />foto
            </span>
          </div>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Seleccionar foto de perfil"
      />

      {/* Error de tamaño */}
      {sizeError && (
        <p className="text-red-400 text-xs text-center">{sizeError}</p>
      )}
    </div>
  )
}
