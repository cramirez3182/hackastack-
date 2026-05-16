import { useQuery } from '@tanstack/react-query'
import { fetchProfessors, fetchDepartments, fetchTags } from '../api/professors'
import { DEMO_PROFESSORS } from '../data/demoProfessors'
import { filterProfessors } from '../utils/filterProfessors'
import type { Filters } from '../types/professor'

export function useProfessors(filters: Filters) {
  return useQuery({
    queryKey: ['professors', filters],
    queryFn: async () => {
      try {
        const result = await fetchProfessors(filters)
        if (result.professors.length === 0 && !filters.search && !filters.department) {
          const demo = filterProfessors(DEMO_PROFESSORS, filters)
          if (demo.length > 0) {
            return { professors: demo, total: demo.length, isDemo: true as const }
          }
        }
        return { ...result, isDemo: false as const }
      } catch {
        const professors = filterProfessors(DEMO_PROFESSORS, filters)
        return { professors, total: professors.length, isDemo: true as const }
      }
    },
    staleTime: 30_000,
    placeholderData: prev => prev,
  })
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      try {
        return await fetchDepartments()
      } catch {
        const seen = new Set<string>()
        const list: { department: string; school: string }[] = []
        for (const p of DEMO_PROFESSORS) {
          const key = `${p.school}|${p.department}`
          if (!seen.has(key)) {
            seen.add(key)
            list.push({ department: p.department, school: p.school })
          }
        }
        return list
      }
    },
    staleTime: 300_000,
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      try {
        return await fetchTags()
      } catch {
        const counts: Record<string, number> = {}
        for (const p of DEMO_PROFESSORS) {
          for (const tag of p.tags) {
            counts[tag] = (counts[tag] ?? 0) + 1
          }
        }
        return Object.entries(counts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count)
      }
    },
    staleTime: 300_000,
  })
}
