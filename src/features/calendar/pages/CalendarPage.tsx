import { useState, useMemo } from 'react'
import Calendar from 'react-calendar'
import { useCalendarData } from '../hooks/useCalendarData'
import { CalendarHeader } from '../components/CalendarHeader'
import { CalendarDayCell } from '../components/CalendarDayCell'
import { CalendarDayModal } from '../components/CalendarDayModal'
import { CalendarLegend } from '../components/CalendarLegend'
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

// ── Skeleton ──────────────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="grid grid-cols-7 gap-px mt-2">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="h-[60px] bg-[#1E293B]/60 animate-pulse rounded-sm" />
      ))}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

export function CalendarPage() {
  // Primer día del mes activo (día siempre = 1 para react-calendar)
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

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn bg-[#10B981] hover:bg-[#059669] text-white border-none btn-sm"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-6 pb-12">
      <h1 className="text-2xl font-bold text-[#F1F5F9] mb-4">Calendario</h1>

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

      {selectedDay && selectedDayData && (
        <CalendarDayModal
          dayData={selectedDayData}
          // T12:00:00 evita desfases por zona horaria al construir la fecha
          date={new Date(`${selectedDay}T12:00:00`)}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}
