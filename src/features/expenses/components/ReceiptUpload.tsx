import { useState } from 'react'
import { uploadReceiptImage, scanReceipt } from '../../../lib/receipt-scan'
import type { ScanResult } from '../../../types'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type UploadState = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

interface Props {
  onScanComplete: (data: ScanResult) => void
  onReceiptUploaded?: (url: string) => void
  onError: (message: string) => void
  userId: string
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

// ── Componente ────────────────────────────────────────────────────────────────

export function ReceiptUpload({ onScanComplete, onReceiptUploaded, onError, userId }: Props) {
  const [state, setState] = useState<UploadState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño
    if (file.size > MAX_SIZE_BYTES) {
      const msg = 'La imagen no puede superar los 10 MB.'
      setErrorMessage(msg)
      setState('error')
      onError(msg)
      return
    }

    setErrorMessage(null)

    try {
      // 1. Subir imagen
      setState('uploading')
      const receiptUrl = await uploadReceiptImage(file, userId)
      setThumbnailUrl(receiptUrl)
      onReceiptUploaded?.(receiptUrl)

      // 2. Analizar con IA
      setState('processing')
      const result = await scanReceipt(receiptUrl)
      setScanResult(result)
      setState('done')
      onScanComplete(result)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error inesperado.'
      setErrorMessage(msg)
      setState('error')
      onError(msg)
    } finally {
      // El input se limpia automáticamente al desmontar (estado cambia a uploading/done/error)
    }
  }

  function handleRetry() {
    setState('idle')
    setErrorMessage(null)
    setThumbnailUrl(null)
    setScanResult(null)
  }

  // ── Render: idle ──────────────────────────────────────────────────────────
  if (state === 'idle') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {/* Botón: Tomar foto */}
        <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-[#10B981]/40 hover:border-[#10B981] rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#10B981]/5">
          <span className="text-2xl">📷</span>
          <span className="text-sm text-[#94A3B8] hover:text-[#10B981]">Tomar foto</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {/* Botón: Subir imagen */}
        <label className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-[#10B981]/40 hover:border-[#10B981] rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#10B981]/5">
          <span className="text-2xl">🖼️</span>
          <span className="text-sm text-[#94A3B8] hover:text-[#10B981]">Subir imagen</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    )
  }

  // ── Render: uploading ─────────────────────────────────────────────────────
  if (state === 'uploading') {
    return (
      <div className="w-full rounded-lg p-4 text-center text-[#94A3B8] border border-[#334155]">
        <span className="loading loading-spinner loading-sm mr-2" />
        Subiendo imagen...
      </div>
    )
  }

  // ── Render: processing ────────────────────────────────────────────────────
  if (state === 'processing') {
    return (
      <div className="w-full rounded-lg p-4 text-center text-[#94A3B8] border border-[#334155]">
        <span className="loading loading-spinner loading-sm mr-2" />
        Analizando recibo con IA...
      </div>
    )
  }

  // ── Render: done ──────────────────────────────────────────────────────────
  if (state === 'done' && thumbnailUrl && scanResult) {
    const confidence = scanResult.confidence

    // Badge de confianza
    const confidenceBadge = confidence >= 0.8
      ? <span className="inline-flex items-center gap-1 text-xs font-medium text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 rounded-full px-2 py-0.5 w-fit">✨ Datos extraídos</span>
      : confidence >= 0.5
        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-2 py-0.5 w-fit">⚠️ Extracción parcial</span>
        : <span className="inline-flex items-center gap-1 text-xs font-medium text-red-400 bg-red-400/10 border border-red-400/30 rounded-full px-2 py-0.5 w-fit">❌ Baja confianza — revisa todo</span>

    // Campos no extraídos
    const missingFields: string[] = []
    if (!scanResult.date)          missingFields.push('Fecha')
    if (!scanResult.establishment) missingFields.push('Establecimiento')
    if (!scanResult.description)   missingFields.push('Descripción')
    if (!scanResult.amount)        missingFields.push('Monto')

    return (
      <div className="flex items-start gap-3">
        <img
          src={thumbnailUrl}
          alt="Recibo escaneado"
          className="w-20 h-20 object-cover rounded-lg border-2 border-[#10B981] shrink-0"
        />
        <div className="flex flex-col gap-1 flex-1">
          {confidenceBadge}
          {missingFields.length > 0 ? (
            <div className="mt-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs text-yellow-400">
              <span className="font-semibold">⚠️ No se pudieron extraer: </span>
              {missingFields.join(', ')}
              <span className="block mt-1 text-yellow-400/70">
                Por favor completa estos campos manualmente.
              </span>
            </div>
          ) : (
            <div className="mt-2 text-xs text-[#10B981]/70">
              ✓ Todos los campos fueron extraídos correctamente
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Render: error ─────────────────────────────────────────────────────────
  return (
    <div className="w-full rounded-lg p-4 border border-red-500/30 bg-red-500/5">
      <p className="text-sm text-red-400 mb-2">{errorMessage}</p>
      <button
        type="button"
        className="text-sm text-[#94A3B8] hover:text-[#10B981] transition-colors"
        onClick={handleRetry}
      >
        Reintentar
      </button>
    </div>
  )
}
