// ── CalendarLegend — indicadores de tipo de movimiento ───────────────────────

export function CalendarLegend() {
  return (
    <div className="flex items-center justify-center gap-5 mt-3 text-xs text-[#94A3B8]">
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" aria-hidden />
        Gastos
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0" aria-hidden />
        Recurrentes
      </span>
    </div>
  )
}
