import { supabase } from './supabase'
import type { ScanResult } from '../types'

// ── Subir imagen al bucket "receipts" de Supabase Storage ─────────────────────

export async function uploadReceiptImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const timestamp = Date.now()
  const path = `${userId}/${timestamp}.${ext}`

  const { error } = await supabase.storage
    .from('receipts')
    .upload(path, file, { upsert: false })

  if (error) {
    throw new Error('No se pudo subir la imagen. Verifica tu conexión e inténtalo de nuevo.')
  }

  const { data } = supabase.storage.from('receipts').getPublicUrl(path)

  const publicUrl = data.publicUrl.replace('http://', 'https://')

  // Cache-busting con timestamp en query string
  return `${publicUrl}?t=${timestamp}`
}

// ── Enviar URL al webhook de n8n para análisis con IA ─────────────────────────

export async function scanReceipt(receiptUrl: string): Promise<ScanResult> {
  const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_RECEIPT_SCAN

  if (!webhookUrl) {
    throw new Error('El servicio de escaneo no está configurado.')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30_000)

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receipt_url: receiptUrl }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`)
    }

    const data = await response.json()
    return data as ScanResult
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new Error('El análisis tardó demasiado. Inténtalo de nuevo.')
      }
      if (err.message.startsWith('Error del servidor')) {
        throw new Error('El servicio de análisis no está disponible. Inténtalo más tarde.')
      }
      throw err
    }
    throw new Error('Ocurrió un error inesperado al analizar el recibo.')
  } finally {
    clearTimeout(timeoutId)
  }
}
