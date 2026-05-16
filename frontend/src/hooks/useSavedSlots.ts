import { useCallback, useEffect, useState } from 'react'
import type { SavedSlot } from '../types/professor'

const STORAGE_KEY = 'scu-saved-slots'

export function useSavedSlots() {
  const [slots, setSlots] = useState<SavedSlot[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.filter((s: any) => s && typeof s.id === 'string')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots))
  }, [slots])

  const addSlots = useCallback((newSlots: SavedSlot[]) => {
    setSlots(prev => {
      const map = new Map(prev.map(s => [s.id, s]))
      for (const s of newSlots) map.set(s.id, s)
      return Array.from(map.values())
    })
  }, [])

  const removeById = useCallback((id: string) => {
    setSlots(prev => prev.filter(s => s.id !== id))
  }, [])

  const removeByProfessorAndKey = useCallback((profId: string, course_code: string, start_time: string, end_time: string) => {
    setSlots(prev => prev.filter(s => !(s.professor_id === profId && s.course_code === course_code && s.start_time === start_time && s.end_time === end_time)))
  }, [])

  const isSaved = useCallback((id: string) => slots.some(s => s.id === id), [slots])

  return { slots, addSlots, removeById, removeByProfessorAndKey, isSaved }
}
