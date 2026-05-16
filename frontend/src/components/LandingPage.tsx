import { useState, type ReactNode } from 'react'
import {
  GraduationCap, Star, SlidersHorizontal, Mic, GitCompare,
  BookOpen, Award, ChevronRight, Sparkles, Search, Heart,
  ArrowRight, Play, Filter, MessageSquare, Users,
} from 'lucide-react'

interface Props {
  onEnter: () => void
}

const FEATURES = [
  {
    icon: <SlidersHorizontal size={22} />,
    color: 'bg-blue-500',
    title: 'Smart Filtering',
    desc: 'Filter by rating, difficulty, "would take again" %, tenure status, and department — results update instantly.',
  },
  {
    icon: <BookOpen size={22} />,
    color: 'bg-emerald-500',
    title: 'Course History',
    desc: 'Type any course code (e.g. COEN 20) and instantly see every professor who has taught it.',
  },
  {
    icon: <Star size={22} />,
    color: 'bg-amber-500',
    title: 'Live RMP Ratings',
    desc: 'Real ratings, difficulty scores, student tags ("Caring", "Tough grader"), and "would take again" from RateMyProfessors.',
  },
  {
    icon: <GitCompare size={22} />,
    color: 'bg-purple-500',
    title: 'Side-by-Side Compare',
    desc: 'Pin up to three professors and compare all their stats at once before you decide.',
  },
  {
    icon: <Mic size={22} />,
    color: 'bg-rose-500',
    title: 'AI Voice Advisor',
    desc: 'Click the mic, describe what you want ("easy A in physics, super helpful"), and get instant personalized recommendations.',
  },
  {
    icon: <Heart size={22} />,
    color: 'bg-pink-500',
    title: 'Save Favorites',
    desc: 'Star professors you like. Toggle favorites-only view to keep your shortlist front and center.',
  },
]

const HOW_IT_WORKS = [
  {
    icon: <Users size={24} />,
    color: 'from-blue-500 to-blue-700',
    step: '01',
    title: 'Browse all SCU professors',
    desc: '300+ professors from every school and department, loaded instantly in your browser. No account, no install.',
  },
  {
    icon: <Filter size={24} />,
    color: 'from-emerald-500 to-emerald-700',
    step: '02',
    title: 'Filter by what matters to you',
    desc: 'Narrow by rating, difficulty, tenure status, course history, and student feedback tags — all in real time.',
  },
  {
    icon: <MessageSquare size={24} />,
    color: 'from-purple-500 to-purple-700',
    step: '03',
    title: 'Ask the AI advisor',
    desc: 'Type or speak naturally. The AI sees your filtered results and recommends the best match for your goals.',
  },
]

export function LandingPage({ onEnter }: Props) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white overflow-y-auto">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#862633] via-[#a83040] to-[#5c1a23] text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-[#C4963B]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-10 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        {/* nav */}
        <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">SCU Professor Finder</span>
          </div>
          <button
            onClick={onEnter}
            className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all backdrop-blur-sm"
          >
            <Play size={14} /> Launch App
          </button>
        </nav>

        {/* hero content */}
        <div className="relative z-10 max-w-4xl mx-auto px-8 pt-16 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles size={14} className="text-[#C4963B]" />
            Powered by RateMyProfessors + Claude AI · No sign-up needed
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Find your perfect<br />
            <span className="text-[#C4963B]">SCU professor</span>
          </h1>

          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Browse every Santa Clara University professor, filter by ratings, difficulty, course history,
            and tenure status — then talk to our AI advisor for a personalized recommendation.
            <strong className="text-white/90"> All in your browser. Nothing to install.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onEnter}
              className="group flex items-center gap-3 bg-[#C4963B] hover:bg-[#d4a540] text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-xl shadow-black/20 transition-all hover:scale-105 hover:shadow-2xl"
            >
              Get Started — it's free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              See how it works <ChevronRight size={16} />
            </a>
          </div>

          {/* stat chips */}
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {[
              { label: 'Professors', val: '300+' },
              { label: 'Schools', val: 'All 6' },
              { label: 'No install', val: '✓' },
              { label: 'AI-powered', val: 'Claude' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
                <div className="text-xl font-bold text-[#C4963B]">{s.val}</div>
                <div className="text-xs text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-8 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <ChevronRight size={14} /> How it works
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Open the app and go</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            No account, no download, no setup. Just click and start exploring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(step => (
            <div key={step.step} className="relative bg-white rounded-2xl border-2 border-gray-100 p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
              <div className="absolute -top-3 -right-3 text-xs font-bold text-gray-300 bg-gray-50 border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                {step.step}
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center mb-5 shadow`}>
                {step.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Everything you need to choose right</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Stop guessing which professor to pick. Use real data and AI to make the call.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-200 cursor-default bg-white ${
                  hoveredFeature === i ? 'border-gray-200 shadow-xl -translate-y-1' : 'border-gray-100 shadow-sm'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl ${f.color} text-white flex items-center justify-center mb-4 shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOUR ─────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">What you can do inside</h2>
          <p className="text-gray-500">A quick tour of the interactive features.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TourCard
            icon={<Search size={18} />}
            color="blue"
            title="Search & Filter instantly"
            items={[
              'Press / to focus the search bar from anywhere',
              'Use Quick Presets: "Top Rated", "Easy A", "Research Faculty"',
              'Filter by minimum rating, max difficulty, "would take again" %',
              'Toggle tenure-track only or adjunct-only',
              'Filter by course code to see who taught your class',
            ]}
          />
          <TourCard
            icon={<Mic size={18} />}
            color="rose"
            title="Talk to the AI Advisor"
            items={[
              'Click the chat bubble in the bottom-right corner',
              'Add your Claude API key once — it\'s saved in your browser',
              'Type or click the mic and speak naturally',
              'Ask "who\'s the most chill physics professor?"',
              'Enable auto-speak so responses are read aloud to you',
            ]}
          />
          <TourCard
            icon={<GitCompare size={18} />}
            color="purple"
            title="Compare professors"
            items={[
              'Click the compare icon on any professor card',
              'Add up to 3 professors to your compare tray',
              'Compare drawer shows all stats side by side',
              'Ratings, difficulty, would-take-again, and tags compared',
            ]}
          />
          <TourCard
            icon={<Award size={18} />}
            color="amber"
            title="Save & organize"
            items={[
              'Star any professor to add to your Favorites',
              'Toggle "Favorites only" in the filter pills bar',
              'Favorites persist across sessions — saved in your browser',
              'Click any student tag to instantly filter by that trait',
              'Click any course code in a profile to filter by that course',
            ]}
          />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#862633] to-[#5c1a23] text-white py-20 text-center px-8">
        <GraduationCap size={40} className="mx-auto mb-5 text-[#C4963B]" />
        <h2 className="text-3xl font-extrabold mb-4">Ready to find your professor?</h2>
        <p className="text-white/60 mb-8 max-w-md mx-auto">
          No sign-up. No install. Just open it and start exploring SCU's faculty.
        </p>
        <button
          onClick={onEnter}
          className="group inline-flex items-center gap-3 bg-[#C4963B] hover:bg-[#d4a540] text-white font-bold px-10 py-4 rounded-2xl text-lg shadow-xl transition-all hover:scale-105"
        >
          Launch Professor Finder
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </section>

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100">
        SCU Professor Finder · Data sourced from RateMyProfessors &amp; SCU Faculty Directory · Not affiliated with Santa Clara University
      </footer>
    </div>
  )
}

function TourCard({ icon, color, title, items }: {
  icon: ReactNode; color: 'blue' | 'rose' | 'purple' | 'amber'; title: string; items: string[]
}) {
  const colorMap = {
    blue: { ring: 'bg-blue-100 text-blue-600', dot: 'bg-blue-400' },
    rose: { ring: 'bg-rose-100 text-rose-600', dot: 'bg-rose-400' },
    purple: { ring: 'bg-purple-100 text-purple-600', dot: 'bg-purple-400' },
    amber: { ring: 'bg-amber-100 text-amber-600', dot: 'bg-amber-400' },
  }
  const c = colorMap[color]
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl ${c.ring} flex items-center justify-center`}>{icon}</div>
        <h3 className="font-bold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
            <div className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-1.5 flex-shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
