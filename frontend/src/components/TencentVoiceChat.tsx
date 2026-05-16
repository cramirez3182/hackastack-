import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Bot, Send, Loader2, MessageCircle } from 'lucide-react'
import type { Professor } from '../types/professor'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  filters: unknown
  professors: Professor[]
  onClose: () => void
}

export function TencentVoiceChat({ professors, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setError(null)

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/trtc-api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          professorContext: professors.map(p => ({
            name: p.full_name,
            department: p.department,
            rating: p.avg_rating,
            difficulty: p.avg_difficulty,
            wouldTakeAgain: p.would_take_again_percent,
            courses: p.courses_taught.slice(0, 4),
            tags: p.tags.slice(0, 4),
          })),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Server error' }))
        throw new Error(err.error || 'Server error')
      }

      const { reply } = await res.json()
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: reply }])
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, professors])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="fixed bottom-0 right-0 w-full sm:w-[400px] sm:bottom-6 sm:right-6 z-50 flex flex-col bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden" style={{ height: 'min(520px, 90vh)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#862633] to-[#5c1a23] text-white flex-shrink-0">
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <Bot size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight">SCU AI Advisor</div>
          <div className="text-[11px] text-white/70 leading-tight">Ask me anything about professors</div>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-2 py-8">
            <Bot size={32} className="text-[#862633]/40" />
            <p className="text-sm font-medium text-gray-500">Hi! I'm your SCU AI Advisor.</p>
            <p className="text-xs">Ask me who's the easiest professor, who teaches COEN, who students love most — anything!</p>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-[#862633]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={12} className="text-[#862633]" />
              </div>
            )}
            <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-[#862633] text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-[#862633]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot size={12} className="text-[#862633]" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2">
              <Loader2 size={14} className="animate-spin text-gray-400" />
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-gray-100 flex-shrink-0">
        <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:border-[#862633] transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask about professors..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-800 placeholder:text-gray-400 min-w-0"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-7 h-7 bg-[#862633] text-white rounded-lg flex items-center justify-center disabled:opacity-40 hover:bg-[#5c1a23] transition-colors flex-shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function VoiceChatButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  if (isOpen) return null
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-4 pointer-events-none">
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto flex items-center gap-3 bg-gradient-to-r from-[#862633] to-[#5c1a23] text-white px-5 py-3 rounded-2xl shadow-2xl hover:shadow-[0_8px_30px_rgba(134,38,51,0.5)] hover:scale-105 transition-all duration-200 group"
      >
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <MessageCircle size={18} />
        </div>
        <div className="text-left">
          <div className="text-sm font-bold leading-tight">Ask our AI Advisor</div>
          <div className="text-[11px] text-white/75 leading-tight">Chat · Ask anything about professors</div>
        </div>
        <div className="ml-1 bg-white/20 rounded-lg px-2 py-1 text-[11px] font-semibold flex-shrink-0 group-hover:bg-white/30 transition-colors">
          Chat now →
        </div>
      </button>
    </div>
  )
}
