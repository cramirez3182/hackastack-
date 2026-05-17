import { X, GitCompare } from 'lucide-react'
import type { Professor } from '../types/professor'
import { groupSchedule, formatTimeRange } from '../utils/schedule'
import { StarRating, RatingBar } from './RatingBar'

interface Props {
  professors: Professor[]
  onRemove: (id: string) => void
  onClear: () => void
  onSelect: (p: Professor) => void
}

export function CompareDrawer({ professors, onRemove, onClear, onSelect }: Props) {
  if (professors.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <GitCompare size={18} className="text-scu-red" />
          <span className="font-semibold text-sm text-gray-800">Compare ({professors.length}/3)</span>
          <button type="button" onClick={onClear} className="ml-auto text-xs text-gray-500 hover:text-red-500">Clear all</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {professors.map(p => (
            <div key={p.id} className="border border-gray-200 rounded-xl p-3 bg-gray-50 relative">
              <button type="button" onClick={() => onRemove(p.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X size={14} /></button>
              <button type="button" onClick={() => onSelect(p)} className="text-left w-full">
                <h4 className="font-bold text-sm text-gray-900 pr-6">{p.full_name}</h4>
                <p className="text-xs text-gray-500 mb-2">{p.department}</p>
                {p.num_ratings > 0 ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2"><StarRating rating={p.avg_rating} size="sm" /><span className="text-xs text-gray-500">rating</span></div>
                    <RatingBar value={p.avg_difficulty} size="sm" />
                    <p className="text-xs text-gray-600">Difficulty: {p.avg_difficulty.toFixed(1)} | Take again: {Math.round(p.would_take_again_percent)}%</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No RMP data</p>
                )}
                {groupSchedule(p.schedule).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                    {groupSchedule(p.schedule).slice(0, 2).map((slot, i) => (
                      <p key={i} className="text-[10px] text-gray-600 leading-snug">
                        <span className="font-mono font-semibold">{slot.course_code}</span>
                        {slot.course_name && <span> · {slot.course_name}</span>}
                        <br />
                        <span className="text-gray-500">{slot.dayPattern} {formatTimeRange(slot.start_time, slot.end_time)}</span>
                      </p>
                    ))}
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}