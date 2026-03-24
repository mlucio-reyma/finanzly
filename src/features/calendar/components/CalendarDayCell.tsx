import type { DayData } from '../types/calendar.types'

// ── Helper de formato ─────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency', currency: 'MXN', minimumFractionDigits: 0,
  }).format(n)

// ── Componente ────────────────────────────────────────────────────────────────

interface Props {
  date: Date
  dayData: DayData | null
  isToday: boolean
  isCurrentMonth: boolean
}

export function CalendarDayCell({ date, dayData, isToday, isCurrentMonth }: Props) {
  const day     = date.getDate()
  const hasData = dayData?.hasExpenses || dayData?.hasRecurrents

  return (
    <div
      className={[
        'relative flex flex-col h-full min-h-[60px] p-1 rounded-sm select-none',
        isToday
          ? 'bg-emerald-500/20 border border-[#10B981]'
          : 'border border-[#10B981]/10',
        !isCurrentMonth ? 'opacity-30' : '',
        hasData ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      {/* Número del día */}
      <span
        className={`text-xs font-medium leading-none ${
          isToday ? 'text-[#10B981]' : 'text-[#94A3B8]'
        }`}
      >
        {day}
      </span>

      {/* Monto de gastos (verde) */}
      {dayData?.hasExpenses && (
        <span className="text-[11px] text-[#10B981] font-medium leading-tight mt-0.5">
          {fmt(dayData.totalExpenses)}
        </span>
      )}

      {/* Monto de recurrentes (azul) */}
      {dayData?.hasRecurrents && (
        <span className="text-[11px] text-[#3B82F6] font-medium leading-tight">
          {fmt(dayData.totalRecurrents)}
        </span>
      )}

      {/* Dots indicadores en la parte inferior */}
      {(dayData?.hasExpenses || dayData?.hasRecurrents) && (
        <div className="absolute bottom-1 left-1 flex gap-0.5">
          {dayData.hasExpenses && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" aria-hidden />
          )}
          {dayData.hasRecurrents && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" aria-hidden />
          )}
        </div>
      )}
    </div>
  )
}
