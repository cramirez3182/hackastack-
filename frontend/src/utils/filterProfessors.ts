import type { Filters, Professor } from '../types/professor'

export function filterProfessors(professors: Professor[], filters: Filters): Professor[] {
  let result = [...professors]

  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      p =>
        p.full_name.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q),
    )
  }

  if (filters.department) {
    const d = filters.department.toLowerCase()
    result = result.filter(p => p.department.toLowerCase().includes(d))
  }

  if (filters.school) {
    const s = filters.school.toLowerCase()
    result = result.filter(p => p.school.toLowerCase().includes(s))
  }

  if (filters.minRating > 0) {
    result = result.filter(p => p.avg_rating >= filters.minRating)
  }

  if (filters.maxDifficulty < 5) {
    result = result.filter(p => p.avg_difficulty <= filters.maxDifficulty || p.num_ratings === 0)
  }

  if (filters.minWouldTakeAgain > 0) {
    result = result.filter(
      p => p.would_take_again_percent >= filters.minWouldTakeAgain || p.would_take_again_percent < 0,
    )
  }

  if (filters.tenureTrack === 'yes') {
    result = result.filter(p => p.tenure_track)
  } else if (filters.tenureTrack === 'no') {
    result = result.filter(p => !p.tenure_track)
  }

  if (filters.course) {
    const c = filters.course.toLowerCase()
    result = result.filter(p =>
      p.courses_taught.some(course => course.toLowerCase().includes(c)),
    )
  }

  if ((filters as any).hasSchedule === 'yes') {
    result = result.filter(p => (p.schedule?.length ?? 0) > 0)
  } else if ((filters as any).hasSchedule === 'no') {
    result = result.filter(p => (p.schedule?.length ?? 0) === 0)
  }

  for (const tag of filters.tags) {
    const t = tag.toLowerCase()
    result = result.filter(p => p.tags.some(pt => pt.toLowerCase().includes(t)))
  }

  const sortKey = filters.sortBy
  const dir = filters.sortDir === 'asc' ? 1 : -1
  result.sort((a, b) => {
    const av = (a[sortKey as keyof Professor] as number | string) ?? 0
    const bv = (b[sortKey as keyof Professor] as number | string) ?? 0
    if (av < bv) return -1 * dir
    if (av > bv) return 1 * dir
    return 0
  })

  return result
}
