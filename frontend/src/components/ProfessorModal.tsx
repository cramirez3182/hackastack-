import { X, Mail, ExternalLink, Award, BookOpen, Star, TrendingUp, AlertCircle, GitCompare } from 'lucide-react'
import type { Professor } from '../types/professor'
import { SCHOOL_COLORS, SCHOOL_TEXT_COLORS } from '../types/professor'
import { StarRating, RatingBar } from './RatingBar'

interface Props {
  professor: Professor | null
  onClose: () => void
  onTagClick?: (tag: string) => void
  onCourseClick?: (course: string) => void
  onCompareToggle?: (prof: Professor) => void
  isComparing?: boolean
  isFavorite?: boolean
  onFavoriteToggle?: () => void
}

export function ProfessorModal({
  professor: p,
  onClose,
  onTagClick,
  onCourseClick,
  onCompareToggle,
  isComparing = false,
  isFavorite = false,
  onFavoriteToggle,
}: Props) {
  if (!p) return null

  const dotColor = SCHOOL_COLORS[p.school] ?? 'bg-gray-400'
  const textColor = SCHOOL_TEXT_COLORS[p.school] ?? 'text-gray-600'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto z-10">
        {/* Header banner */}
        <div className={`${dotColor} p-6 rounded-t-2xl text-white`}>
          <div className="absolute top-4 right-4 flex gap-2">
            {onFavoriteToggle && (
              <button type="button" onClick={onFavoriteToggle} className="p-1.5 rounded-full hover:bg-white/20 text-white" title="Save professor">
                <Star size={18} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            )}
            {onCompareToggle && p && (
              <button type="button" onClick={() => onCompareToggle(p)} className={`p-1.5 rounded-full hover:bg-white/20 text-white ${isComparing ? 'bg-white/30' : ''}`} title="Compare">
                <GitCompare size={18} />
              </button>
            )}
            <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.full_name} className="w-full h-full object-cover" />
              ) : (
                '👤'
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold leading-tight">{p.full_name}</h2>
              <p className="text-white/80 text-sm mt-0.5">{p.title}</p>
              <p className="text-white/70 text-sm">{p.department}</p>
              <p className="text-white/60 text-xs mt-1">{p.school}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            {p.tenure_track && (
              <span className="flex items-center gap-1 bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">
                <Award size={12} /> Tenure Track
              </span>
            )}
            {p.rmp_id && (
              <a
                href={`https://www.ratemyprofessors.com/professor/${p.rmp_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-white/20 text-white text-xs px-2 py-1 rounded-full hover:bg-white/30 transition-colors"
              >
                <ExternalLink size={11} /> RateMyProfessors
              </a>
            )}
            {p.profile_url && (
              <a
                href={p.profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-white/20 text-white text-xs px-2 py-1 rounded-full hover:bg-white/30 transition-colors"
              >
                <ExternalLink size={11} /> SCU Profile
              </a>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5">

          {/* Ratings */}
          {p.num_ratings > 0 ? (
            <section>
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Star size={14} className="text-yellow-500" /> Ratings
                <span className="text-xs font-normal text-gray-400">based on {p.num_ratings} reviews</span>
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <StarRating rating={p.avg_rating} size="lg" />
                  <p className="text-xs text-gray-500 mt-1">Overall</p>
                </div>
                <div className="text-center bg-gray-50 rounded-xl p-3">
                  <span className={`font-bold text-lg ${p.avg_difficulty >= 4 ? 'text-red-500' : p.avg_difficulty >= 3 ? 'text-orange-500' : 'text-green-500'}`}>
                    {p.avg_difficulty.toFixed(1)}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">Difficulty</p>
                </div>
                {p.would_take_again_percent >= 0 && (
                  <div className="text-center bg-gray-50 rounded-xl p-3">
                    <span className={`font-bold text-lg ${p.would_take_again_percent >= 70 ? 'text-emerald-500' : p.would_take_again_percent >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {Math.round(p.would_take_again_percent)}%
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Take Again</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20">Rating</span>
                  <RatingBar value={p.avg_rating} />
                  <span className="text-xs font-medium w-8 text-right">{p.avg_rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20">Difficulty</span>
                  <RatingBar value={p.avg_difficulty} colorClass={p.avg_difficulty >= 4 ? 'bg-red-400' : p.avg_difficulty >= 3 ? 'bg-orange-400' : 'bg-green-400'} />
                  <span className="text-xs font-medium w-8 text-right">{p.avg_difficulty.toFixed(1)}</span>
                </div>
                {p.would_take_again_percent >= 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-20">Take Again</span>
                    <RatingBar value={p.would_take_again_percent} max={100} colorClass={p.would_take_again_percent >= 70 ? 'bg-emerald-500' : p.would_take_again_percent >= 50 ? 'bg-yellow-400' : 'bg-red-400'} />
                    <span className="text-xs font-medium w-8 text-right">{Math.round(p.would_take_again_percent)}%</span>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-gray-500 text-sm">
              <AlertCircle size={16} />
              No ratings on RateMyProfessors yet.
            </div>
          )}

          {/* Tags */}
          {p.tags.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-gray-700 mb-2">Student Feedback Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {p.tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => { onTagClick?.(tag); onClose() }}
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium ${textColor} bg-opacity-10 border-current hover:bg-blue-50 hover:border-blue-300 transition-colors`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Courses */}
          {p.courses_taught.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <BookOpen size={14} /> Courses Taught
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {p.courses_taught.map(course => (
                  <button
                    key={course}
                    type="button"
                    onClick={() => { onCourseClick?.(course); onClose() }}
                    className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg font-mono hover:bg-blue-100 hover:text-blue-800 transition-colors"
                  >
                    {course}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Schedule */}
          {p.schedule.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-gray-700 mb-2">Current Schedule</h3>
              <div className="space-y-1.5">
                {p.schedule.map((slot, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                    <span className="font-semibold text-gray-700 w-8">{slot.day.slice(0, 3)}</span>
                    <span className="text-gray-500">{slot.start_time}–{slot.end_time}</span>
                    <span className="font-mono text-blue-700 text-xs">{slot.course_code}</span>
                    <span className="text-gray-600 text-xs truncate">{slot.course_name}</span>
                    {slot.room && <span className="text-gray-400 text-xs ml-auto">{slot.room}</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact */}
          {p.email && (
            <section>
              <a
                href={`mailto:${p.email}`}
                className={`flex items-center gap-2 text-sm ${textColor} hover:underline`}
              >
                <Mail size={14} /> {p.email}
              </a>
            </section>
          )}

          {/* Bio */}
          {p.bio && (
            <section>
              <h3 className="text-sm font-bold text-gray-700 mb-2">About</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{p.bio}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
