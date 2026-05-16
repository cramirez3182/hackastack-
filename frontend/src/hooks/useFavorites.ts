import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'scu-professor-favorites'

export function useFavorites() {
  const [ids, setIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }, [ids])

  const toggle = useCallback((id: string) => {
    setIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }, [])

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids])

  return { favoriteIds: ids, toggle, isFavorite }
}
