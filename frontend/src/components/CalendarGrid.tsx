import { useState } from 'react'
import type { Professor, SavedSlot } from '../types/professor'
import { SCHOOL_COLORS } from '../types/professor'
import { formatTimeRange } from '../utils/schedule'
import { ProfessorCard } from './ProfessorCard'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8am–8pm
const ROW_HEIGHT = 80 // px — matches min-h-[80px]

function formatHour(h: number) {
  return h <= 12 ? `${h}:00 ${h < 12 ? 'AM' : 'PM'}` : `${h - 12}:00 PM`
}

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}

interface Props {
  professors: Professor[]
  savedSlots?: SavedSlot[]
  onSelect: (prof: Professor) => void
}

export function CalendarGrid({ professors, savedSlots, onSelect }: Props) {
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  // Build mergedProfessors so that if a professor has saved slots, we only
  // render those saved slots (hide their other times). Saved slots are
  // represented as pseudo-professors with id prefixed by `saved-` and a
  // `__saved` flag for styling.
  const mergedProfessors: Professor[] = []
  const savedByProf = new Map<string, SavedSlot[]>()
  if (savedSlots && savedSlots.length > 0) {
    for (const s of savedSlots) {
      const list = savedByProf.get(s.professor_id) ?? []
      list.push(s)
      savedByProf.set(s.professor_id, list)
    }
  }

  for (const prof of professors) {
    const savedForProf = savedByProf.get(prof.id)
    if (savedForProf && savedForProf.length > 0) {
      // create pseudo entries only for the saved times (one per saved slot)
      for (const s of savedForProf) {
        const lastName = s.professor_name.split(' ').slice(-1)[0]
        const pseudo: any = {
          id: `saved-${s.id}`,
          first_name: '',
          last_name: lastName,
          full_name: s.professor_name,
          department: prof.department ?? '',
          school: prof.school ?? 'Santa Clara University',
          title: prof.title ?? '',
          tenure_track: prof.tenure_track ?? false,
          avg_rating: prof.avg_rating ?? 0,
          avg_difficulty: prof.avg_difficulty ?? 0,
          num_ratings: prof.num_ratings ?? 0,
          would_take_again_percent: prof.would_take_again_percent ?? -1,
          tags: prof.tags ?? [],
          courses_taught: [s.course_code],
          schedule: [
            {
              day: s.day,
              start_time: s.start_time,
              end_time: s.end_time,
              course_code: s.course_code,
              course_name: s.course_name,
              room: s.room,
            },
          ],
          __saved: true,
        }
        mergedProfessors.push(pseudo as Professor)
      }
    } else {
      mergedProfessors.push(prof)
    }
  }

  // Build events keyed by day and start hour. Each event contains the prof and the slot.
  const gridEvents: Record<string, Record<number, Array<{ prof: Professor; slot: any }>>> = {}
  DAYS.forEach(day => {
    gridEvents[day] = {}
    HOURS.forEach(h => { gridEvents[day][h] = [] })
  })

  for (const prof of mergedProfessors) {
    for (const slot of prof.schedule) {
      const day = slot.day as typeof DAYS[number]
      if (!DAYS.includes(day)) continue
      const startH = Math.floor(parseTime(slot.start_time))
      if (gridEvents[day]?.[startH] !== undefined) {
        gridEvents[day][startH].push({ prof, slot })
      }
    }
  }

  const hasAnySchedule = mergedProfessors.some(p => p.schedule.length > 0)

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
              const events = gridEvents[day][hour]
              const isHovered = hoveredCell === cellKey

              return (
                <div
                  key={day}
                  className={`relative border-r border-gray-100 last:border-r-0 p-1 min-h-[80px] transition-colors overflow-visible ${
                    isHovered ? 'bg-red-50' : 'hover:bg-gray-50'
                  }`}
                  onMouseEnter={() => setHoveredCell(cellKey)}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {events.map(({ prof, slot }, idx) => {
                    const n = events.length
                    const isSaved = (prof as any).__saved || String(prof.id).startsWith('saved-')
                    const dotColor = isSaved ? 'bg-scu-red' : (SCHOOL_COLORS[prof.school] ?? 'bg-gray-400')
                    const start = parseTime(slot.start_time)
                    const end = parseTime(slot.end_time)
                    const startH = Math.floor(start)
                    const minuteOffset = start - startH
                    const duration = Math.max(0.0833333, end - start) // minimum 5 minutes (~0.0833h)
                    const heightPx = Math.max(ROW_HEIGHT * 0.1, duration * ROW_HEIGHT)
                    const tooltip = `${prof.full_name} — ${slot.course_code} ${slot.course_name} (${slot.day} ${formatTimeRange(slot.start_time, slot.end_time)})`

                    const widthPct = 100 / n
                    const leftPct = widthPct * idx

                    return (
                      <button
                        key={`${prof.id}-${slot.day}-${slot.start_time}-${slot.end_time}`}
                        onClick={() => onSelect(prof)}
                        title={tooltip}
                        className={`absolute rounded px-2 py-1 text-xs font-medium text-white ${dotColor} ${isSaved ? 'hover:bg-red-900' : 'hover:opacity-90'} transition-colors shadow-sm flex flex-col justify-center`}
                        style={{ height: `${heightPx}px`, zIndex: 10, left: `${leftPct}%`, width: `calc(${widthPct}% - 6px)`, top: `${minuteOffset * ROW_HEIGHT}px` }}
                      >
                        <div className="truncate">{prof.last_name}{isSaved ? ' (Saved)' : ''}</div>
                        <div className="opacity-90 text-[10px] truncate font-normal">{slot.course_code} {formatTimeRange(slot.start_time, slot.end_time)}</div>
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
