import type { DayData } from '../types/calendar.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  const raw = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
  // Capitalizar solo el primer carácter; el resto en minúsculas
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', minimumFractionDigits: 0,
  }).format(n)

// ── Componente ────────────────────────────────────────────────────────────────

interface Props {
  dayData: DayData
  date: Date
  onClose: () => void
}

export function CalendarDayModal({ dayData, date, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="fn-card fn-animate-in w-[90vw] max-w-[480px] max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#10B981]/10">
          <h2 className="text-sm font-semibold text-[#F1F5F9]">
            {formatDate(date)}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="btn btn-ghost btn-xs btn-square text-[#94A3B8] hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-4 flex flex-col gap-5">

          {/* Sección de gastos */}
          {dayData.hasExpenses && (
            <section>
              <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                💳 Gastos
              </h3>
              <ul className="flex flex-col gap-2">
                {dayData.expenses.map(exp => (
                  <li key={exp.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-[#F1F5F9] min-w-0">
                      <span>{exp.category.icon}</span>
                      <span className="truncate">{exp.description || exp.category.name}</span>
                    </span>
                    <span className="text-[#10B981] font-medium whitespace-nowrap shrink-0">
                      {fmt(exp.amount)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 pt-2 border-t border-[#10B981]/10 flex justify-between text-sm">
                <span className="text-[#94A3B8]">Total</span>
                <span className="text-[#10B981] font-semibold">{fmt(dayData.totalExpenses)}</span>
              </div>
            </section>
          )}

          {/* Sección de recurrentes */}
          {dayData.hasRecurrents && (
            <section>
              <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">
                🔄 Pagos Recurrentes
              </h3>
              <ul className="flex flex-col gap-2">
                {dayData.recurrents.map(rec => (
                  <li key={rec.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#F1F5F9] min-w-0 truncate">{rec.name}</span>
                    <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
                      <span className="text-[#94A3B8]">{fmt(rec.amount)}</span>
                      {rec.isPaid ? (
                        <span className="badge badge-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ✓ Pagado
                        </span>
                      ) : (
                        <span className="badge badge-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                          ● Pendiente
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>
      </div>
    </div>
  )
}
