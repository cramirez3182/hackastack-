import { User, BookOpen, Award, TrendingUp, Star, GitCompare } from 'lucide-react'
import type { Professor } from '../types/professor'
import { SCHOOL_BG_COLORS, SCHOOL_TEXT_COLORS, SCHOOL_COLORS } from '../types/professor'
import { StarRating, RatingBar } from './RatingBar'

interface Props {
  professor: Professor
  onClick: (prof: Professor) => void
  compact?: boolean
  onTagClick?: (tag: string) => void
  onCompareToggle?: (prof: Professor) => void
  isComparing?: boolean
  isFavorite?: boolean
  onFavoriteToggle?: () => void
}

export function ProfessorCard({
  professor: p,
  onClick,
  compact = false,
  onTagClick,
  onCompareToggle,
  isComparing = false,
  isFavorite = false,
  onFavoriteToggle,
}: Props) {
  const bgColor = SCHOOL_BG_COLORS[p.school] ?? 'bg-gray-50 border-gray-200'
  const textColor = SCHOOL_TEXT_COLORS[p.school] ?? 'text-gray-700'
  const dotColor = SCHOOL_COLORS[p.school] ?? 'bg-gray-400'

  if (compact) {
    return (
      <button
        onClick={() => onClick(p)}
        className={`w-full text-left p-2 rounded-lg border ${bgColor} hover:shadow-md transition-all duration-200 hover:scale-[1.02] group`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
          <div className="min-w-0">
            <div className="font-semibold text-xs text-gray-900 truncate">{p.full_name}</div>
            <div className={`text-xs truncate ${textColor}`}>{p.department}</div>
          </div>
          {p.avg_rating > 0 && (
            <div className="ml-auto flex-shrink-0">
              <StarRating rating={p.avg_rating} size="sm" />
            </div>
          )}
        </div>
      </button>
    )
  }

  return (
    <div
      className={`relative w-full rounded-xl border-2 ${bgColor} p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.015] hover:-translate-y-0.5 group ${
        isComparing ? 'ring-2 ring-blue-500 ring-offset-1' : ''
      }`}
    >
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        {onFavoriteToggle && (
          <button type="button" onClick={e => { e.stopPropagation(); onFavoriteToggle() }} className={`p-1.5 rounded-lg bg-white/90 shadow-sm ${isFavorite ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}>
            <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        )}
        {onCompareToggle && (
          <button type="button" onClick={e => { e.stopPropagation(); onCompareToggle(p) }} className={`p-1.5 rounded-lg bg-white/90 shadow-sm ${isComparing ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}>
            <GitCompare size={14} />
          </button>
        )}
      </div>
      <button type="button" onClick={() => onClick(p)} className="w-full text-left">
      <div className="flex items-start gap-3 mb-3 pr-12">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${dotColor} text-white`}>
          {p.photo_url ? (
            <img src={p.photo_url} alt={p.full_name} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <User size={20} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-900 text-sm leading-tight truncate group-hover:text-blue-700 transition-colors">
            {p.full_name}
          </h3>
          <p className={`text-xs ${textColor} font-medium truncate`}>{p.department}</p>
          <p className="text-xs text-gray-400 truncate">{p.title}</p>
        </div>
        {p.tenure_track && (
          <span className="flex-shrink-0 flex items-center gap-0.5 bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
            <Award size={10} /> TT
          </span>
        )}
      </div>

      {/* Ratings */}
      {p.num_ratings > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <StarRating rating={p.avg_rating} />
              <span className="text-xs text-gray-400">({p.num_ratings})</span>
            </div>
            {p.would_take_again_percent >= 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <TrendingUp size={11} />
                <span className={p.would_take_again_percent >= 70 ? 'text-emerald-600 font-medium' : p.would_take_again_percent >= 50 ? 'text-yellow-600' : 'text-red-500'}>
                  {Math.round(p.would_take_again_percent)}% again
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-14 flex-shrink-0">Rating</span>
              <RatingBar value={p.avg_rating} size="sm" />
              <span className="text-xs text-gray-600 w-6 text-right">{p.avg_rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-14 flex-shrink-0">Difficulty</span>
              <RatingBar
                value={p.avg_difficulty}
                size="sm"
                colorClass={
                  p.avg_difficulty >= 4 ? 'bg-red-400' : p.avg_difficulty >= 3 ? 'bg-orange-400' : 'bg-green-400'
                }
              />
              <span className="text-xs text-gray-600 w-6 text-right">{p.avg_difficulty.toFixed(1)}</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-400 italic">No ratings yet</p>
      )}

      {/* Tags */}
      {p.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {p.tags.slice(0, 3).map(tag => (
            <button
              key={tag}
              type="button"
              onClick={e => { e.stopPropagation(); onTagClick?.(tag) }}
              className={`text-xs px-1.5 py-0.5 rounded-full border border-gray-200 transition-colors ${
                onTagClick ? 'bg-white/70 text-gray-600 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-700 cursor-pointer' : 'bg-white/70 text-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
          {p.tags.length > 3 && (
            <span className="text-xs text-gray-400">+{p.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Courses */}
      {p.courses_taught.length > 0 && (
        <div className="mt-2 flex items-center gap-1">
          <BookOpen size={11} className="text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-500 truncate">
            {p.courses_taught.slice(0, 3).join(', ')}
            {p.courses_taught.length > 3 && ` +${p.courses_taught.length - 3}`}
          </p>
        </div>
      )}
      </button>
    </div>
  )
}
