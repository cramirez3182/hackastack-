import type { Filters, Professor, ChatMessage } from '../types/professor'

const BASE = '/api'

export async function fetchProfessors(filters: Filters): Promise<{ professors: Professor[]; total: number }> {
  const params = new URLSearchParams()

  if (filters.search) params.set('search', filters.search)
  if (filters.department) params.set('department', filters.department)
  if (filters.school) params.set('school', filters.school)
  if (filters.minRating > 0) params.set('min_rating', String(filters.minRating))
  if (filters.maxDifficulty < 5) params.set('max_difficulty', String(filters.maxDifficulty))
  if (filters.minWouldTakeAgain > 0) params.set('min_would_take_again', String(filters.minWouldTakeAgain))
  if (filters.tenureTrack !== 'all') params.set('tenure_track', filters.tenureTrack === 'yes' ? 'true' : 'false')
  if (filters.course) params.set('course', filters.course)
  filters.tags.forEach(tag => params.append('tags', tag))
  params.set('sort_by', filters.sortBy)
  params.set('sort_dir', filters.sortDir)
  params.set('limit', '500')

  const res = await fetch(`${BASE}/professors?${params}`)
  if (!res.ok) throw new Error('Failed to fetch professors')
  return res.json()
}

export async function fetchProfessor(id: string): Promise<Professor> {
  const res = await fetch(`${BASE}/professors/${id}`)
  if (!res.ok) throw new Error('Professor not found')
  return res.json()
}

export async function fetchDepartments(): Promise<{ department: string; school: string }[]> {
  const res = await fetch(`${BASE}/departments`)
  if (!res.ok) return []
  return res.json()
}

export async function fetchTags(): Promise<{ tag: string; count: number }[]> {
  const res = await fetch(`${BASE}/tags`)
  if (!res.ok) return []
  return res.json()
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  filters: Partial<Filters>,
  professors: Professor[],
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, professors, filters }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Chat request failed')
  return data.reply
}
