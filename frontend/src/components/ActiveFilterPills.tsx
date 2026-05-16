import { X } from 'lucide-react'
import type { Filters } from '../types/professor'

interface Props {
  filters: Filters
  onChange: (partial: Partial<Filters>) => void
  showFavoritesOnly?: boolean
  onToggleFavorites?: () => void
}

export function ActiveFilterPills({ filters, onChange, showFavoritesOnly, onToggleFavorites }: Props) {
  const pills: { label: string; clear: () => void }[] = []

  if (filters.search) pills.push({ label: `"${filters.search}"`, clear: () => onChange({ search: '' }) })
  if (filters.school) pills.push({ label: filters.school, clear: () => onChange({ school: '', department: '' }) })
  if (filters.department) pills.push({ label: filters.department, clear: () => onChange({ department: '' }) })
  if (filters.minRating > 0) pills.push({ label: `${filters.minRating}+ stars`, clear: () => onChange({ minRating: 0 }) })
  if (filters.maxDifficulty < 5) pills.push({ label: `Difficulty ≤${filters.maxDifficulty}`, clear: () => onChange({ maxDifficulty: 5 }) })
  if (filters.minWouldTakeAgain > 0) pills.push({ label: `${filters.minWouldTakeAgain}%+ take again`, clear: () => onChange({ minWouldTakeAgain: 0 }) })
  if (filters.tenureTrack === 'yes') pills.push({ label: 'Tenure track', clear: () => onChange({ tenureTrack: 'all' }) })
  if (filters.tenureTrack === 'no') pills.push({ label: 'Non-tenure', clear: () => onChange({ tenureTrack: 'all' }) })
  if (filters.course) pills.push({ label: filters.course, clear: () => onChange({ course: '' }) })
  filters.tags.forEach(tag => {
    pills.push({
      label: tag,
      clear: () => onChange({ tags: filters.tags.filter(t => t !== tag) }),
    })
  })

  if (pills.length === 0 && !onToggleFavorites) return null

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-gray-100 bg-white/80">
      <span className="text-xs text-gray-400 font-medium">Active:</span>
      {onToggleFavorites && (
        <button
          type="button"
          onClick={onToggleFavorites}
          className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${
            showFavoritesOnly
              ? 'bg-amber-100 border-amber-300 text-amber-800'
              : 'border-gray-200 text-gray-500 hover:border-amber-300'
          }`}
        >
          {showFavoritesOnly ? '★ Saved only' : '☆ My saved'}
        </button>
      )}
      {pills.map((pill, i) => (
        <button
          key={i}
          type="button"
          onClick={pill.clear}
          className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors"
        >
          {pill.label}
          <X size={11} />
        </button>
      ))}
      {pills.length > 1 && (
        <button
          type="button"
          onClick={() =>
            onChange({
              search: '',
              department: '',
              school: '',
              minRating: 0,
              maxDifficulty: 5,
              minWouldTakeAgain: 0,
              tenureTrack: 'all',
              course: '',
              tags: [],
            })
          }
          className="text-xs text-gray-400 hover:text-red-500 ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
