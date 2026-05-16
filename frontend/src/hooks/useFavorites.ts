import { useCallback, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'scu-professor-favorites'

export interface FavoriteEntry {
  id: string
  full_name: string
}

export function useFavorites() {
  const [entries, setEntries] = useState<FavoriteEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []

      const seen = new Set<string>()
      return parsed
        .map(item => {
          if (typeof item === 'string') {
            return { id: item, full_name: '' }
          }
          if (item && typeof item === 'object' && typeof item.id === 'string') {
            return { id: item.id, full_name: typeof item.full_name === 'string' ? item.full_name : '' }
          }
          return null
        })
        .filter((item): item is FavoriteEntry => {
          if (!item) return false
          if (seen.has(item.id)) return false
          seen.add(item.id)
          return true
        })
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const toggle = useCallback((prof: FavoriteEntry) => {
    setEntries(prev => {
      if (prev.some(item => item.id === prof.id)) {
        return prev.filter(item => item.id !== prof.id)
      }
      return [...prev, prof]
    })
  }, [])

  const isFavorite = useCallback((id: string) => entries.some(item => item.id === id), [entries])

  const favoriteIds = useMemo(() => entries.map(item => item.id), [entries])
  const favoriteNames = useMemo(
    () => entries.map(item => item.full_name).filter(name => name.length > 0),
    [entries],
  )

  return { favoriteIds, favoriteNames, toggle, isFavorite }
}
