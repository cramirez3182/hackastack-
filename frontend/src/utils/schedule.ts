import type { TimeSlot } from '../types/professor'

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_ABBR: Record<string, string> = {
  Monday: 'M',
  Tuesday: 'T',
  Wednesday: 'W',
  Thursday: 'R',
  Friday: 'F',
  Saturday: 'Sa',
  Sunday: 'Su',
}
const PATTERN_ALIAS: Record<string, string> = { MWF: 'MWF', TR: 'TR', MW: 'MW', MTWRF: 'Daily' }

export type GroupedTimeSlot = TimeSlot & { dayPattern: string }

function getDayPattern(days: string[]): string {
  const sorted = [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
  const abbr = sorted.map(d => DAY_ABBR[d] ?? d[0]).join('')
  return PATTERN_ALIAS[abbr] ?? abbr
}

export function groupSchedule(schedule: TimeSlot[]): GroupedTimeSlot[] {
  const map = new Map<string, { days: string[]; slot: TimeSlot }>()
  for (const slot of schedule) {
    const key = `${slot.course_code}|${slot.start_time}|${slot.end_time}|${slot.course_name}`
    if (!map.has(key)) map.set(key, { days: [], slot })
    map.get(key)!.days.push(slot.day)
  }
  return [...map.values()].map(({ days, slot }) => ({
    ...slot,
    dayPattern: getDayPattern(days),
  }))
}

export function formatTime12h(t: string): string {
  const [hStr, m] = t.split(':')
  const h = parseInt(hStr, 10)
  return `${h > 12 ? h - 12 : h || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`
}

export function formatTimeRange(start: string, end: string): string {
  return `${formatTime12h(start)}–${formatTime12h(end)}`
}
