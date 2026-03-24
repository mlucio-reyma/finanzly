// ── CalendarHeader — navegación mensual y total del mes ──────────────────────

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', minimumFractionDigits: 0,
  }).format(n)

interface Props {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  totalMonth: number
  totalRecurrents: number
}

export function CalendarHeader({ year, month, onPrev, onNext, totalMonth, totalRecurrents }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 mb-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onPrev}
          aria-label="Mes anterior"
          className="btn btn-ghost btn-sm w-8 h-8 min-h-0 text-[#94A3B8] hover:text-white text-xl"
        >
          ‹
        </button>

        <span className="text-lg font-semibold text-[#F1F5F9] min-w-[168px] text-center">
          {MONTHS_ES[month]} {year}
        </span>

        <button
          onClick={onNext}
          aria-label="Mes siguiente"
          className="btn btn-ghost btn-sm w-8 h-8 min-h-0 text-[#94A3B8] hover:text-white text-xl"
        >
          ›
        </button>
      </div>

      {(totalMonth === 0 && totalRecurrents === 0) ? (
        <p className="text-sm font-medium text-[#94A3B8]">Sin movimientos este mes</p>
      ) : (
        <div className="flex flex-col items-center gap-0.5">
          {totalMonth > 0 ? (
            <p className="text-sm font-medium text-[#10B981]">
              Total del mes: {fmt(totalMonth)}
            </p>
          ) : (
            <p className="text-sm font-medium text-[#94A3B8]">Sin gastos registrados</p>
          )}
          {totalRecurrents > 0 && (
            <p className="text-sm font-medium text-[#3B82F6]">
              Recurrentes del mes: {fmt(totalRecurrents)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
