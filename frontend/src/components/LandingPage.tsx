import { useState, useEffect, useRef, type ReactNode } from 'react'
import {
  GraduationCap, Star, SlidersHorizontal, Mic, GitCompare,
  BookOpen, Award, ChevronRight, Sparkles, Search,
  ArrowRight, Filter, MessageSquare, Users, Menu, X,
  Mail, User, AlignLeft, CheckCircle, Calendar,
} from 'lucide-react'

interface Props {
  onEnter: () => void
}

const FEATURES = [
  {
    icon: <SlidersHorizontal size={22} />,
    color: 'bg-scu-red',
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
    icon: <Calendar size={22} />,
    color: 'bg-teal-500',
    title: 'Schedule View',
    desc: "See every professor's current teaching schedule in a weekly calendar — MWF and TR sections grouped intelligently.",
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
]

const HOW_IT_WORKS = [
  {
    icon: <Users size={24} />,
    color: 'from-scu-red to-scu-red',
    step: '01',
    title: 'Browse all SCU professors',
    desc: '300+ current faculty from every school and department, cross-referenced with the official SCU directory. No account needed.',
  },
  {
    icon: <Filter size={24} />,
    color: 'from-emerald-500 to-emerald-700',
    step: '02',
    title: 'Filter by what matters',
    desc: 'Narrow by rating, difficulty, tenure status, course history, and student feedback tags — all in real time.',
  },
  {
    icon: <MessageSquare size={24} />,
    color: 'from-purple-500 to-purple-700',
    step: '03',
    title: 'Ask the AI advisor',
    desc: 'Type or speak naturally. The AI sees your current results and recommends the best match for your goals.',
  },
]

export function LandingPage({ onEnter }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 40)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div ref={scrollRef} className="h-full min-h-0 overflow-y-auto overscroll-contain bg-white">

      {/* ── STICKY NAV ─────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              scrolled ? 'bg-[#862633]' : 'bg-white/20 backdrop-blur-sm'
            }`}>
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className={`font-bold text-lg tracking-tight transition-colors ${
              scrolled ? 'text-gray-900' : 'text-white'
            }`}>
              SCU Course Optimizer
            </span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {[['about', 'About'], ['features', 'Features'], ['feedback', 'Feedback']].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={onEnter}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                scrolled
                  ? 'bg-[#862633] text-white hover:bg-[#6e1f29]'
                  : 'bg-white/20 border border-white/30 text-white hover:bg-white/30 backdrop-blur-sm'
              }`}
            >
              Get Started <ArrowRight size={14} />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(v => !v)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            }`}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-6 pb-4 flex flex-col gap-1">
            {[['about', 'About'], ['features', 'Features'], ['feedback', 'Feedback']].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={onEnter}
              className="mt-2 bg-[#862633] text-white px-4 py-2.5 rounded-xl text-sm font-semibold text-center"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden">
        {/* Campus background image */}
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/41/Santa_Clara_University_Library_1454_%28cropped%29.jpg"
          alt="Santa Clara University campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#862633]/85 via-[#6e1f29]/75 to-[#3d0f14]/80" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        <div className="absolute -top-16 -right-16 w-96 h-96 rounded-full bg-[#C4963B]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-10 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles size={14} className="text-[#C4963B]" />
            Powered by Tencent · Verified SCU Faculty · No sign-up
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
            SCU Course<br />
            <span className="text-[#C4963B]">Optimizer</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
            Find the right professor for every class — with real ratings, schedule data,
            and an AI advisor that knows SCU's faculty inside and out.
            <strong className="text-white/90"> All in your browser. Nothing to install.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={onEnter}
              className="group flex items-center gap-3 bg-[#C4963B] hover:bg-[#d4a540] text-white font-bold px-9 py-4 rounded-2xl text-lg shadow-2xl shadow-black/30 transition-all hover:scale-105"
            >
              Get Started — it's free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              type="button"
              onClick={() => scrollTo('how-it-works')}
              className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              See how it works <ChevronRight size={16} />
            </button>
          </div>

          {/* Stat chips */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { val: '300+', label: 'Professors' },
              { val: 'All 6', label: 'Schools' },
              { val: 'Current', label: 'SCU Faculty' },
              { val: 'AI', label: 'Advisor' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                <div className="text-xl font-bold text-[#C4963B]">{s.val}</div>
                <div className="text-xs text-white/60 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <button
          type="button"
          onClick={() => scrollTo('about')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/50 hover:text-white/80 transition-colors"
        >
          <span className="text-xs font-medium tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
          </div>
        </button>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────── */}
      <section id="about" className="max-w-5xl mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-100 text-[#862633] text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
              <GraduationCap size={14} /> About the Project
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 leading-tight mb-5">
              Built for Broncos,<br />by Broncos
            </h2>
            <p className="text-gray-600 leading-relaxed mb-5">
              Choosing the right professor is one of the most impactful decisions you make each quarter.
              SCU Course Optimizer brings together official SCU faculty data, RateMyProfessors ratings,
              real teaching schedules, and AI-powered recommendations — all in one place.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Every professor is cross-referenced against the official SCU faculty directory to ensure
              you only see <strong>current, active faculty</strong> — no stale data from professors
              who've retired or moved on.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '6', label: 'Schools covered', icon: <BookOpen size={16} /> },
                { val: '300+', label: 'Current professors', icon: <Users size={16} /> },
                { val: 'Live', label: 'RMP ratings', icon: <Star size={16} /> },
                { val: 'AI', label: 'Powered advisor', icon: <Mic size={16} /> },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                  <div className="w-9 h-9 rounded-lg bg-[#862633]/10 text-[#862633] flex items-center justify-center flex-shrink-0">
                    {s.icon}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{s.val}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-[#862633] to-[#5c1a23] rounded-3xl p-8 text-white shadow-2xl">
              <h3 className="font-bold text-lg mb-5 text-[#C4963B]">What makes it different?</h3>
              <ul className="space-y-4">
                {[
                  { icon: <Award size={16} />, text: 'Cross-referenced with the official SCU faculty bulletin — only active professors shown' },
                  { icon: <Search size={16} />, text: "Search by course code (e.g. COEN 20) to see who's taught your exact class" },
                  { icon: <Calendar size={16} />, text: 'Full schedule view — MWF vs TR sections grouped intelligently, no duplicate rows' },
                  { icon: <Mic size={16} />, text: 'AI advisor with full context of all visible professors — speak or type naturally' },
                  { icon: <GitCompare size={16} />, text: 'Compare up to 3 professors side-by-side before you commit to a choice' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/85">
                    <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-[#C4963B]/20 -z-10" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" className="bg-gray-50 border-y border-gray-100 py-24">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-scu-red text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              <ChevronRight size={14} /> How it works
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Open the app and go</h2>
            <p className="text-gray-500 max-w-lg mx-auto">No account, no download, no setup. Click and start exploring.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(step => (
              <div
                key={step.step}
                className="relative bg-white rounded-2xl border-2 border-gray-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
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
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-8 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Sparkles size={14} /> Features
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Everything you need to choose right</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Stop guessing which professor to pick. Use real data and AI to make the call.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>

        <div className="mt-14 text-center">
          <button
            onClick={onEnter}
            className="group inline-flex items-center gap-3 bg-[#862633] hover:bg-[#6e1f29] text-white font-bold px-8 py-4 rounded-2xl text-base shadow-lg transition-all hover:scale-105"
          >
            Try all features now
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ── FEEDBACK FORM ────────────────────────────────────── */}
      <section id="feedback" className="bg-gray-50 border-t border-gray-100 py-24">
        <div className="max-w-2xl mx-auto px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              <MessageSquare size={14} /> Feedback
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Help us improve</h2>
            <p className="text-gray-500">
              Missing a professor? Found bad data? Have a feature idea?
              Let us know — every submission helps.
            </p>
          </div>

          <FeedbackForm />
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#862633] via-[#7a2030] to-[#5c1a23] text-white py-24 text-center px-8">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/4/41/Santa_Clara_University_Library_1454_%28cropped%29.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="relative z-10">
          <GraduationCap size={44} className="mx-auto mb-5 text-[#C4963B]" />
          <h2 className="text-4xl font-extrabold mb-4">Ready to optimize your schedule?</h2>
          <p className="text-white/60 mb-8 max-w-md mx-auto text-lg">
            No sign-up. No install. Just open it and start exploring SCU's current faculty.
          </p>
          <button
            onClick={onEnter}
            className="group inline-flex items-center gap-3 bg-[#C4963B] hover:bg-[#d4a540] text-white font-bold px-10 py-5 rounded-2xl text-lg shadow-2xl transition-all hover:scale-105"
          >
            Launch SCU Course Optimizer
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-100 bg-white">
        <div className="flex items-center justify-center gap-2 mb-1">
          <GraduationCap size={14} className="text-[#862633]" />
          <span className="font-semibold text-gray-600">SCU Course Optimizer</span>
        </div>
        Data sourced from RateMyProfessors &amp; SCU Faculty Directory · Not affiliated with Santa Clara University
      </footer>
    </div>
  )
}

// ── Sub-components ───────────────────────────────────────────

function FeatureCard({ icon, color, title, desc }: { icon: ReactNode; color: string; title: string; desc: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative p-6 rounded-2xl border-2 transition-all duration-200 cursor-default bg-white ${
        hovered ? 'border-gray-200 shadow-xl -translate-y-1' : 'border-gray-100 shadow-sm'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl ${color} text-white flex items-center justify-center mb-4 shadow-sm`}>
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

function FeedbackForm() {
  const [form, setForm] = useState({ name: '', email: '', type: 'general', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thanks for the feedback!</h3>
        <p className="text-gray-500 mb-6">We read every submission and use them to improve the tool.</p>
        <button
          type="button"
          onClick={() => { setSubmitted(false); setForm({ name: '', email: '', type: 'general', message: '' }) }}
          className="text-sm text-[#862633] hover:underline font-medium"
        >
          Submit another response
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <User size={13} /> Name
          </label>
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm(v => ({ ...v, name: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#862633]/30 focus:border-[#862633] transition"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Mail size={13} /> Email <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="email"
            placeholder="your@scu.edu"
            value={form.email}
            onChange={e => setForm(v => ({ ...v, email: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#862633]/30 focus:border-[#862633] transition"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700">Type of feedback</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'general', label: 'General' },
            { id: 'bug', label: 'Bug report' },
            { id: 'missing', label: 'Missing prof' },
            { id: 'feature', label: 'Feature idea' },
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setForm(v => ({ ...v, type: opt.id }))}
              className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                form.type === opt.id
                  ? 'bg-[#862633] text-white border-[#862633]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          <AlignLeft size={13} /> Message
        </label>
        <textarea
          required
          placeholder={
            form.type === 'missing'
              ? 'Professor name, department, and any other details...'
              : form.type === 'bug'
              ? 'What happened? What did you expect?'
              : form.type === 'feature'
              ? "Describe the feature you'd like to see..."
              : 'Share your thoughts...'
          }
          value={form.message}
          onChange={e => setForm(v => ({ ...v, message: e.target.value }))}
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#862633]/30 focus:border-[#862633] transition resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={!form.message.trim() || submitting}
        className="w-full py-3 rounded-xl bg-[#862633] hover:bg-[#6e1f29] disabled:bg-gray-300 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          'Send feedback'
        )}
      </button>
    </form>
  )
}
