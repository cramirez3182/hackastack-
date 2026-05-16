import { useCallback, useEffect, useMemo, useState } from 'react'
import { LayoutGrid, Calendar, RefreshCw, GraduationCap, Database, GitCompare } from 'lucide-react'
import type { Filters, Professor } from './types/professor'
import { useProfessors } from './hooks/useProfessors'
import { useDebouncedValue } from './hooks/useDebouncedValue'
import { useFavorites } from './hooks/useFavorites'
import { FilterPanel } from './components/FilterPanel'
import { CalendarGrid, GridView } from './components/CalendarGrid'
import { ProfessorModal } from './components/ProfessorModal'
import { VoiceChat, VoiceChatButton } from './components/VoiceChat'
import { ProfessorFinderWizard } from './components/ProfessorFinderWizard'
import { QuickFilters, type QuickPreset } from './components/QuickFilters'
import { ActiveFilterPills } from './components/ActiveFilterPills'
import { CompareDrawer } from './components/CompareDrawer'

const DEFAULT_FILTERS: Filters = {
  search: '',
  department: '',
  school: '',
  minRating: 0,
  maxDifficulty: 5,
  minWouldTakeAgain: 0,
  tenureTrack: 'all',
  course: '',
  tags: [],
  sortBy: 'avg_rating',
  sortDir: 'desc',
}

type ViewMode = 'grid' | 'calendar'

export default function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, 300)
  const [view, setView] = useState<ViewMode>('grid')
  const [selectedProf, setSelectedProf] = useState<Professor | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [compareList, setCompareList] = useState<Professor[]>([])
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const { favoriteIds, toggle: toggleFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    setFilters(prev => (prev.search === debouncedSearch ? prev : { ...prev, search: debouncedSearch }))
  }, [debouncedSearch])

  const queryFilters = filters
  const { data, isLoading, isError, refetch, isFetching } = useProfessors(queryFilters)
  const isDemo = Boolean((data as { isDemo?: boolean })?.isDemo)
  const allProfessors = data?.professors ?? []

  const professors = useMemo(() => {
    if (!showFavoritesOnly) return allProfessors
    return allProfessors.filter(p => favoriteIds.includes(p.id))
  }, [allProfessors, showFavoritesOnly, favoriteIds])

  const previewCount = useMemo(() => professors.length, [professors])

  const updateFilters = useCallback((partial: Partial<Filters>) => {
    setActivePresetId(null)
    setFilters(prev => ({ ...prev, ...partial }))
    if ('search' in partial && partial.search !== undefined) {
      setSearchInput(partial.search)
    }
  }, [])

  const applyWizard = useCallback((partial: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...partial }))
    setActivePresetId(null)
  }, [])

  const applyPreset = useCallback((preset: QuickPreset) => {
    setActivePresetId(preset.id)
    setFilters(prev => ({ ...DEFAULT_FILTERS, ...preset.filters }))
    setSearchInput('')
  }, [])

  const toggleCompare = useCallback((prof: Professor) => {
    setCompareList(prev => {
      const exists = prev.some(p => p.id === prof.id)
      if (exists) return prev.filter(p => p.id !== prof.id)
      if (prev.length >= 3) return prev
      return [...prev, prof]
    })
  }, [])

  const isComparing = useCallback((id: string) => compareList.some(p => p.id === id), [compareList])

  const addTagFilter = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags : [...prev.tags, tag],
    }))
    setActivePresetId(null)
  }, [])

  const addCourseFilter = useCallback((course: string) => {
    setFilters(prev => ({ ...prev, course }))
    setActivePresetId(null)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedProf(null)
        setWizardOpen(false)
      }
      if (e.key === '/' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        document.getElementById('professor-search')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isBackendDown = isError && !isDemo

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 flex-shrink-0 shadow-sm z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-scu-red flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-none">SCU Professor Finder</h1>
            <p className="text-xs text-gray-400 leading-none mt-0.5">Santa Clara University</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 ml-2">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === 'grid' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutGrid size={15} /> Grid
          </button>
          <button
            type="button"
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              view === 'calendar' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar size={15} /> Schedule
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {compareList.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
              <GitCompare size={12} /> {compareList.length} comparing
            </span>
          )}
          {isDemo && (
            <span className="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg">
              Demo mode — run scraper for live data
            </span>
          )}
          {isBackendDown ? (
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              <Database size={12} />
              Backend offline
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'}`} />
              {professors.length} professors
            </div>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <div className="px-4 py-2 bg-white border-b border-gray-100">
        <QuickFilters activeId={activePresetId} onSelect={applyPreset} onWizard={() => setWizardOpen(true)} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <FilterPanel
          filters={filters}
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onChange={updateFilters}
          total={professors.length}
        />

        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          <ActiveFilterPills
            filters={filters}
            onChange={updateFilters}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavorites={() => setShowFavoritesOnly(v => !v)}
          />

          {isBackendDown && (
            <div className="m-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <strong>Backend not running.</strong> Start the API and run the scraper, or browse demo professors below.
            </div>
          )}

          {isLoading && !data && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading professors...</p>
              </div>
            </div>
          )}

          {(!isLoading || data) && (
            <div className="flex-1 overflow-hidden pb-24">
              {view === 'grid' ? (
                <GridView
                  professors={professors}
                  onSelect={setSelectedProf}
                  onTagClick={addTagFilter}
                  onCompareToggle={toggleCompare}
                  isComparing={isComparing}
                  isFavorite={isFavorite}
                  onFavoriteToggle={toggleFavorite}
                />
              ) : (
                <CalendarGrid professors={professors} onSelect={setSelectedProf} />
              )}
            </div>
          )}
        </main>
      </div>

      <ProfessorModal
        professor={selectedProf}
        onClose={() => setSelectedProf(null)}
        onTagClick={addTagFilter}
        onCourseClick={addCourseFilter}
        onCompareToggle={toggleCompare}
        isComparing={selectedProf ? isComparing(selectedProf.id) : false}
        isFavorite={selectedProf ? isFavorite(selectedProf.id) : false}
        onFavoriteToggle={() => selectedProf && toggleFavorite(selectedProf.id)}
      />

      <CompareDrawer
        professors={compareList}
        onRemove={id => setCompareList(prev => prev.filter(p => p.id !== id))}
        onClear={() => setCompareList([])}
        onSelect={setSelectedProf}
      />

      <ProfessorFinderWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onApply={applyWizard}
        matchCount={previewCount}
      />

      {chatOpen ? (
        <VoiceChat filters={filters} professors={professors} onClose={() => setChatOpen(false)} />
      ) : (
        <VoiceChatButton onClick={() => setChatOpen(true)} isOpen={chatOpen} />
      )}
    </div>
  )
}
