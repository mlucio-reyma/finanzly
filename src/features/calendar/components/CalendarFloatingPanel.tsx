import { useState, useMemo, useEffect } from 'react'
import Calendar from 'react-calendar'
import { useCalendarData } from '../hooks/useCalendarData'
import { CalendarHeader } from './CalendarHeader'
import { CalendarDayCell } from './CalendarDayCell'
import { CalendarDayModal } from './CalendarDayModal'
import { CalendarLegend } from './CalendarLegend'
import type { DayData } from '../types/calendar.types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function checkIsToday(date: Date): boolean {
  const t = new Date()
  return (
    date.getDate()     === t.getDate()     &&
    date.getMonth()    === t.getMonth()    &&
    date.getFullYear() === t.getFullYear()
  )
}

function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-px mt-2">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="h-[60px] bg-[#1E293B]/60 animate-pulse rounded-sm" />
      ))}
    </div>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void
}

export function CalendarFloatingPanel({ onClose }: Props) {
  // Bloquear scroll del body mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const [activeDate, setActiveDate] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  )
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const year  = activeDate.getFullYear()
  const month = activeDate.getMonth()

  const { dataMap, loading, error } = useCalendarData(year, month)

  const totalMonth = useMemo(
    () => Object.values(dataMap).reduce((sum, d) => sum + d.totalExpenses, 0),
    [dataMap]
  )
  const totalRecurrents = useMemo(
    () => Object.values(dataMap).reduce((sum, d) => sum + d.totalRecurrents, 0),
    [dataMap]
  )

  function handlePrev() {
    setActiveDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }
  function handleNext() {
    setActiveDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  const selectedDayData: DayData | null =
    selectedDay ? (dataMap[selectedDay] ?? null) : null

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/60"
      onClick={onClose}
    >
      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Calendario"
        className="bg-[#0F172A] border-t border-[#10B981]/20 rounded-t-2xl w-full max-h-[90vh] overflow-y-auto fn-animate-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle + header */}
        <div className="relative flex items-center justify-between px-4 pt-4 pb-2">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-[#10B981]/30 rounded-full" />
          <span className="text-sm font-semibold text-[#F1F5F9]">Calendario</span>
          <button
            onClick={onClose}
            aria-label="Cerrar calendario"
            className="btn btn-ghost btn-xs btn-square text-[#94A3B8] hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="px-4 pb-10">
          {error ? (
            <p className="text-center text-red-400 text-sm py-6">{error}</p>
          ) : (
            <div className="fn-card p-4">
              <CalendarHeader
                year={year}
                month={month}
                onPrev={handlePrev}
                onNext={handleNext}
                totalMonth={totalMonth}
                totalRecurrents={totalRecurrents}
              />

              {loading ? (
                <CalendarSkeleton />
              ) : (
                <>
                  <Calendar
                    value={activeDate}
                    activeStartDate={activeDate}
                    showNavigation={false}
                    locale="es-ES"
                    formatDay={() => ''}
                    onClickDay={(date: Date) => {
                      const key  = toDateKey(date)
                      const data = dataMap[key]
                      if (data?.hasExpenses || data?.hasRecurrents) setSelectedDay(key)
                    }}
                    tileContent={({ date }: { date: Date }) => (
                      <CalendarDayCell
                        date={date}
                        dayData={dataMap[toDateKey(date)] ?? null}
                        isToday={checkIsToday(date)}
                        isCurrentMonth={date.getMonth() === month}
                      />
                    )}
                    tileClassName={() => 'fn-cal-tile'}
                  />
                  <CalendarLegend />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de día — renderizado dentro del mismo z-context */}
      {selectedDay && selectedDayData && (
        <CalendarDayModal
          dayData={selectedDayData}
          date={new Date(`${selectedDay}T12:00:00`)}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}
