import { useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react'
import type { Filters } from '../types/professor'

interface Props {
  open: boolean
  onClose: () => void
  onApply: (filters: Partial<Filters>) => void
  matchCount: number
}

type Priority = 'easy' | 'balanced' | 'rigorous' | 'top_rated'

const SCHOOLS = [
  { label: 'Engineering', value: 'School of Engineering' },
  { label: 'Business', value: 'Leavey School of Business' },
  { label: 'Arts & Sciences', value: 'College of Arts & Sciences' },
  { label: 'Any school', value: '' },
]

const PRIORITIES: { id: Priority; label: string; desc: string }[] = [
  { id: 'easy', label: 'Easier workload', desc: 'Lower difficulty, high would-take-again' },
  { id: 'balanced', label: 'Balanced', desc: 'Solid ratings, moderate difficulty' },
  { id: 'rigorous', label: 'Challenge me', desc: 'Tough but respected professors' },
  { id: 'top_rated', label: 'Best rated', desc: 'Highest overall ratings' },
]

const TRAITS = ['Amazing lectures', 'Caring', 'Hilarious', 'Clear grading criteria', 'Tough grader']

function priorityToFilters(priority: Priority | null): Partial<Filters> {
  switch (priority) {
    case 'easy':
      return { minRating: 4, maxDifficulty: 2.5, minWouldTakeAgain: 80, sortBy: 'would_take_again_percent', sortDir: 'desc' }
    case 'balanced':
      return { minRating: 3.5, maxDifficulty: 3.5, minWouldTakeAgain: 65, sortBy: 'avg_rating', sortDir: 'desc' }
    case 'rigorous':
      return { minRating: 3.5, maxDifficulty: 5, minWouldTakeAgain: 0, sortBy: 'avg_difficulty', sortDir: 'desc' }
    case 'top_rated':
      return { minRating: 4.5, maxDifficulty: 5, minWouldTakeAgain: 0, sortBy: 'avg_rating', sortDir: 'desc' }
    default:
      return {}
  }
}

export function ProfessorFinderWizard({ open, onClose, onApply, matchCount }: Props) {
  const [step, setStep] = useState(0)
  const [school, setSchool] = useState('')
  const [priority, setPriority] = useState<Priority | null>(null)
  const [traits, setTraits] = useState<string[]>([])
  const [tenureOnly, setTenureOnly] = useState(false)

  if (!open) return null

  const toggleTrait = (tag: string) => {
    setTraits(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]))
  }

  const handleApply = () => {
    onApply({ school, tenureTrack: tenureOnly ? 'yes' : 'all', tags: traits, ...priorityToFilters(priority) })
    onClose()
    setStep(0)
  }

  const canNext = step !== 1 || priority !== null
  const totalSteps = 4

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-scu-red to-red-800 px-5 py-4 flex items-center gap-3">
          <Sparkles className="text-scu-gold shrink-0" size={22} />
          <div className="flex-1">
            <h1 className="text-white font-bold">Find Your Professor</h1>
            <p className="text-white/70 text-xs">Step {step + 1} of {totalSteps}</p>
          </div>
          <button type="button" onClick={onClose} className="text-white/70 hover:text-white p-1"><X size={20} /></button>
        </div>
        <div className="h-1 bg-gray-100"><div className="h-full bg-scu-gold transition-all duration-300" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} /></div>
        <div className="p-5 min-h-[260px]">
          {step === 0 && (
            <>
              <h2 className="text-lg font-bold mb-1">Where are you studying?</h2>
              <p className="text-sm text-gray-500 mb-4">Pick a school.</p>
              <div className="grid grid-cols-2 gap-2">
                {SCHOOLS.map(s => (
                  <button key={s.value || 'any'} type="button" onClick={() => setSchool(s.value)} className={`p-3 rounded-xl border-2 text-sm font-medium text-left ${school === s.value ? 'border-scu-red bg-red-50 text-scu-red' : 'border-gray-200'}`}>{s.label}</button>
                ))}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold mb-1">What matters most?</h2>
              <div className="space-y-2 mt-3">
                {PRIORITIES.map(p => (
                  <button key={p.id} type="button" onClick={() => setPriority(p.id)} className={`w-full p-3 rounded-xl border-2 text-left ${priority === p.id ? 'border-scu-red bg-scu-red text-white' : 'border-gray-200'}`}>
                    <div className="font-semibold text-sm">{p.label}</div>
                    <div className="text-xs text-gray-500">{p.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-lg font-bold mb-1">Teaching style?</h2>
              <div className="flex flex-wrap gap-2 my-3">
                {TRAITS.map(tag => (
                  <button key={tag} type="button" onClick={() => toggleTrait(tag)} className={`px-3 py-1.5 rounded-full text-sm border ${traits.includes(tag) ? 'bg-scu-red border-scu-red text-white' : 'border-gray-200'}`}>{tag}</button>
                ))}
              </div>
              <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer">
                <input type="checkbox" checked={tenureOnly} onChange={e => setTenureOnly(e.target.checked)} className="accent-scu-red" />
                <span className="text-sm">Tenure-track only</span>
              </label>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-lg font-bold mb-1">Ready!</h2>
              <p className="text-sm text-gray-500">About <strong className="text-scu-red">{matchCount}</strong> professors match.</p>
            </>
          )}
        </div>
        <div className="px-5 pb-5 flex gap-2">
          {step > 0 && <button type="button" onClick={() => setStep(s => s - 1)} className="px-4 py-2 border rounded-xl text-sm"><ChevronLeft size={16} className="inline" /> Back</button>}
          <div className="flex-1" />
          {step < totalSteps - 1 ? (
            <button type="button" disabled={!canNext} onClick={() => setStep(s => s + 1)} className="px-5 py-2 bg-scu-red text-white rounded-xl text-sm font-semibold disabled:opacity-40">Next <ChevronRight size={16} className="inline" /></button>
          ) : (
            <button type="button" onClick={handleApply} className="px-5 py-2 bg-scu-red text-white rounded-xl text-sm font-semibold">Show professors</button>
          )}
        </div>
      </div>
    </div>
  )
}
