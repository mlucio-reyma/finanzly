// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Props {
  value: number | null // porcentaje de cambio; null = sin datos del mes anterior
}

// ── Componente ────────────────────────────────────────────────────────────────

export function TrendIndicator({ value }: Props) {
  // Sin datos del mes anterior: no hay base para comparar
  if (value === null) {
    return (
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-sm font-medium text-base-content/40">—</span>
        <span className="text-xs text-base-content/40">vs mes anterior</span>
      </div>
    )
  }

  const isUp   = value > 0
  const isZero = value === 0

  const color = isZero ? 'text-base-content/50'
    : isUp   ? 'text-error'    // gastaste más → rojo
    :           'text-success'  // gastaste menos → verde

  const symbol = isZero ? '=' : isUp ? '↑' : '↓'
  const display = isZero
    ? '='
    : `${symbol} ${Math.abs(value).toFixed(1)}%`

  return (
    <div className="flex flex-col items-start gap-0.5">
      <span className={`text-sm font-semibold ${color}`}>{display}</span>
      <span className="text-xs text-base-content/50">vs mes anterior</span>
    </div>
  )
}
