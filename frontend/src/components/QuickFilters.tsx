import type { ReactNode } from 'react'
import { Sparkles, Star, Leaf, Zap, Heart } from 'lucide-react'
import type { Filters } from '../types/professor'

export interface QuickPreset {
  id: string
  label: string
  icon: ReactNode
  filters: Partial<Filters>
}

export const QUICK_PRESETS: QuickPreset[] = [
  {
    id: 'top-rated',
    label: 'Top rated',
    icon: <Star size={14} />,
    filters: { minRating: 4.5, sortBy: 'avg_rating', sortDir: 'desc' },
  },
  {
    id: 'easy-a',
    label: 'Easier classes',
    icon: <Leaf size={14} />,
    filters: { maxDifficulty: 2.5, minWouldTakeAgain: 75, sortBy: 'would_take_again_percent', sortDir: 'desc' },
  },
  {
    id: 'engineering',
    label: 'Engineering',
    icon: <Zap size={14} />,
    filters: { school: 'School of Engineering', sortBy: 'avg_rating', sortDir: 'desc' },
  },
  {
    id: 'favorites-vibe',
    label: 'Caring profs',
    icon: <Heart size={14} />,
    filters: { tags: ['Caring'], minRating: 4 },
  },
]

interface Props {
  activeId: string | null
  onSelect: (preset: QuickPreset) => void
  onWizard: () => void
}

export function QuickFilters({ activeId, onSelect, onWizard }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
      <button
        type="button"
        onClick={onWizard}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-scu-red text-white hover:bg-red-900 shrink-0 transition-colors"
      >
        <Sparkles size={14} /> Guided search
      </button>
      {QUICK_PRESETS.map(preset => (
        <button
          key={preset.id}
          type="button"
          onClick={() => onSelect(preset)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border shrink-0 transition-all hover:scale-105 ${
            activeId === preset.id
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white border-gray-200 text-gray-600 hover:border-blue-400'
          }`}
        >
          {preset.icon}
          {preset.label}
        </button>
      ))}
    </div>
  )
}
