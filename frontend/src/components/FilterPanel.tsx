import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, ChevronUp, X, Search } from 'lucide-react'
import type { Filters } from '../types/professor'
import { useDepartments } from '../hooks/useProfessors'

interface Props {
  filters: Filters
  searchInput: string
  onSearchInputChange: (value: string) => void
  onChange: (f: Partial<Filters>) => void
  total: number
}

function SliderField({
  label, value, min, max, step = 0.5, onChange, formatValue,
}: {
  label: string; value: number; min: number; max: number; step?: number
  onChange: (v: number) => void; formatValue?: (v: number) => string
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{label}</span>
        <span className="font-semibold text-gray-700">{formatValue ? formatValue(value) : value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-blue-600 cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  )
}

export function FilterPanel({ filters, searchInput, onSearchInputChange, onChange, total }: Props) {
  const [ratingsOpen, setRatingsOpen] = useState(true)
  const [deptOpen, setDeptOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const { data: deptData } = useDepartments()

  const hasActiveFilters =
    filters.search || filters.department ||
    filters.minRating > 0 || filters.maxDifficulty < 5 ||
    filters.minWouldTakeAgain > 0 || filters.tenureTrack !== 'all' ||
    filters.hasSchedule !== 'all' ||
    filters.course

  const resetAll = () => onChange({
    search: '', department: '', school: '', minRating: 0, maxDifficulty: 5,
    minWouldTakeAgain: 0, tenureTrack: 'all', hasSchedule: 'yes', course: '',
  })

  return (
    <aside className="w-72 flex-shrink-0 bg-white border-r border-gray-200 h-full min-h-0 overflow-y-auto overscroll-contain">
      <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <SlidersHorizontal size={16} className="text-blue-600" />
            Filters
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {total} professors
            </span>
            {hasActiveFilters && (
              <button onClick={resetAll} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-0.5">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="professor-search"
            type="text"
            placeholder="Search professors... (press /)"
            value={searchInput}
            onChange={e => onSearchInputChange(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchInput && (
            <button type="button" onClick={() => { onSearchInputChange(''); onChange({ search: '' }) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* Ratings Section */}
        <section>
          <button
            onClick={() => setRatingsOpen(o => !o)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
          >
            Ratings & Difficulty
            {ratingsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {ratingsOpen && (
            <div className="space-y-4">
              <SliderField
                label="Min Rating" value={filters.minRating} min={0} max={5} step={0.5}
                onChange={v => onChange({ minRating: v })}
                formatValue={v => v === 0 ? 'Any' : `${v}★`}
              />
              <SliderField
                label="Max Difficulty" value={filters.maxDifficulty} min={1} max={5} step={0.5}
                onChange={v => onChange({ maxDifficulty: v })}
                formatValue={v => v === 5 ? 'Any' : `≤${v}`}
              />
              <SliderField
                label="Would Take Again" value={filters.minWouldTakeAgain} min={0} max={100} step={10}
                onChange={v => onChange({ minWouldTakeAgain: v })}
                formatValue={v => v === 0 ? 'Any' : `≥${v}%`}
              />
            </div>
          )}
        </section>

        <hr className="border-gray-100" />

        {/* Tenure Track */}
        <section>
          <p className="text-sm font-semibold text-gray-700 mb-2">Tenure Track</p>
          <div className="flex gap-2">
            {(['all', 'yes', 'no'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => onChange({ tenureTrack: opt })}
                className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                  filters.tenureTrack === opt
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-blue-400'
                }`}
              >
                {opt === 'all' ? 'All' : opt === 'yes' ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Has Schedule */}
        <section>
          <p className="text-sm font-semibold text-gray-700 mb-2">Has Schedule</p>
          <div className="flex gap-2">
            {(['all', 'yes', 'no'] as const).map(opt => (
              <button
                key={opt}
                onClick={() => onChange({ hasSchedule: opt })}
                className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                  filters.hasSchedule === opt
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-blue-400'
                }`}
              >
                {opt === 'all' ? 'All' : opt === 'yes' ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Course */}
        <section>
          <p className="text-sm font-semibold text-gray-700 mb-2">Has Taught Course</p>
          <div className="relative">
            <BookIcon />
            <input
              type="text"
              placeholder="e.g. COEN 20, MATH 11"
              value={filters.course}
              onChange={e => onChange({ course: e.target.value })}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </section>

        <hr className="border-gray-100" />

        {/* Department */}
        <section>
          <button
            onClick={() => setDeptOpen(o => !o)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
          >
            Department
            {deptOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {deptOpen && (
            <select
              value={filters.department}
              onChange={e => onChange({ department: e.target.value })}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {(deptData ?? []).map(d => (
                <option key={d.department} value={d.department}>{d.department}</option>
              ))}
            </select>
          )}
        </section>

        <hr className="border-gray-100" />

        {/* Sort */}
        <section>
          <button
            onClick={() => setSortOpen(o => !o)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
          >
            Sort By
            {sortOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {sortOpen && (
            <div className="space-y-2">
              <select
                value={filters.sortBy}
                onChange={e => onChange({ sortBy: e.target.value as Filters['sortBy'] })}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="avg_rating">Rating</option>
                <option value="avg_difficulty">Difficulty</option>
                <option value="would_take_again_percent">Would Take Again</option>
                <option value="num_ratings">Most Rated</option>
                <option value="last_name">Name</option>
              </select>
              <div className="flex gap-2">
                {(['desc', 'asc'] as const).map(dir => (
                  <button
                    key={dir}
                    onClick={() => onChange({ sortDir: dir })}
                    className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                      filters.sortDir === dir
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-blue-400'
                    }`}
                  >
                    {dir === 'desc' ? '↓ High → Low' : '↑ Low → High'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </aside>
  )
}

function BookIcon() {
  return (
    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}
