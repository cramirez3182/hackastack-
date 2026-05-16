import { useState } from 'react'
import type { Professor } from '../types/professor'
import { SCHOOL_COLORS } from '../types/professor'
import { formatTimeRange } from '../utils/schedule'
import { ProfessorCard } from './ProfessorCard'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8am–8pm

function formatHour(h: number) {
  return h <= 12 ? `${h}:00 ${h < 12 ? 'AM' : 'PM'}` : `${h - 12}:00 PM`
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

interface Props {
  professors: Professor[]
  onSelect: (prof: Professor) => void
}

export function CalendarGrid({ professors, onSelect }: Props) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  // Build a map: day -> hour -> professors teaching then
  const grid: Record<string, Record<number, Professor[]>> = {}
  DAYS.forEach(day => {
    grid[day] = {}
    HOURS.forEach(h => { grid[day][h] = [] })
  })

  for (const prof of professors) {
    for (const slot of prof.schedule) {
      const day = slot.day as typeof DAYS[number]
      if (!DAYS.includes(day)) continue
      const startH = Math.floor(parseTime(slot.start_time))
      const endH = Math.ceil(parseTime(slot.end_time))
      for (let h = startH; h < endH && h <= 20; h++) {
        if (grid[day]?.[h] !== undefined) {
          grid[day][h].push(prof)
        }
      }
    }
  }

  const hasAnySchedule = professors.some(p => p.schedule.length > 0)

  if (!hasAnySchedule) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-lg font-semibold text-gray-500 mb-2">No Schedule Data Yet</h3>
        <p className="text-sm text-center max-w-sm">
          Schedule data comes from SCU's course system. Run the scraper and check back, or switch to{' '}
          <strong>Grid view</strong> to browse all professors now.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-auto h-full">
      <div className="min-w-[700px]">
        {/* Header row */}
        <div className="grid grid-cols-6 sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
          <div className="p-2 text-xs text-gray-400 font-medium border-r border-gray-100" />
          {DAYS.map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-100 last:border-r-0">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Time rows */}
        {HOURS.map(hour => (
          <div key={hour} className="grid grid-cols-6 border-b border-gray-100 min-h-[80px]">
            {/* Time label */}
            <div className="p-2 text-xs text-gray-400 border-r border-gray-100 flex items-start pt-2 justify-end pr-3">
              {formatHour(hour)}
            </div>

            {/* Day cells */}
            {DAYS.map(day => {
              const cellKey = `${day}-${hour}`
              const cellProfs = grid[day][hour]
              const isHovered = hoveredCell === cellKey

              return (
                <div
                  key={day}
                  className={`border-r border-gray-100 last:border-r-0 p-1 min-h-[80px] transition-colors ${
                    isHovered ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHoveredCell(cellKey)}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {cellProfs.map(prof => {
                    const dotColor = SCHOOL_COLORS[prof.school] ?? 'bg-gray-400'
                    const slot = prof.schedule.find(s => {
                      if (s.day !== day) return false
                      const start = parseTime(s.start_time)
                      const end = parseTime(s.end_time)
                      return hour >= Math.floor(start) && hour < Math.ceil(end)
                    })
                    const tooltip = slot
                      ? `${prof.full_name} — ${slot.course_code} ${slot.course_name} (${slot.day} ${formatTimeRange(slot.start_time, slot.end_time)})`
                      : `${prof.full_name} — ${prof.department}`
                    return (
                      <button
                        key={prof.id}
                        onClick={() => onSelect(prof)}
                        className={`w-full text-left mb-1 rounded px-1.5 py-1 text-xs font-medium text-white ${dotColor} hover:opacity-90 transition-opacity shadow-sm`}
                        title={tooltip}
                      >
                        <div className="truncate">{prof.last_name}</div>
                        {slot ? (
                          <div className="opacity-90 text-[10px] truncate font-normal">{slot.course_code}</div>
                        ) : prof.avg_rating > 0 ? (
                          <div className="opacity-80 text-[10px]">{prof.avg_rating.toFixed(1)}★</div>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

interface GridViewProps {
  professors: Professor[]
  onSelect: (prof: Professor) => void
  onTagClick?: (tag: string) => void
  onCompareToggle?: (prof: Professor) => void
  isComparing?: (id: string) => boolean
  isFavorite?: (id: string) => boolean
  onFavoriteToggle?: (prof: Professor) => void
}

export function GridView({
  professors,
  onSelect,
  onTagClick,
  onCompareToggle,
  isComparing,
  isFavorite,
  onFavoriteToggle,
}: GridViewProps) {
  if (professors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-gray-400">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-500 mb-2">No professors found</h3>
        <p className="text-sm">Try adjusting your filters or run the scraper to populate data.</p>
      </div>
    )
  }

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
      {professors.map(prof => (
        <ProfessorCard
          key={prof.id}
          professor={prof}
          onClick={onSelect}
          onTagClick={onTagClick}
          onCompareToggle={onCompareToggle}
          isComparing={isComparing?.(prof.id)}
          isFavorite={isFavorite?.(prof.id)}
          onFavoriteToggle={onFavoriteToggle ? () => onFavoriteToggle(prof) : undefined}
        />
      ))}
    </div>
  )
}
