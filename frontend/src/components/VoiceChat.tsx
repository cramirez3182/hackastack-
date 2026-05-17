import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Send, X, Volume2, VolumeX, MessageCircle, Loader2, Bot, AlertCircle } from 'lucide-react'
import type { ChatMessage, Filters, Professor } from '../types/professor'
import { sendChatMessage } from '../api/professors'
import { useVoiceChat } from '../hooks/useVoiceChat'

const SUGGESTED_PROMPTS = [
  "Who's the best CS professor for beginners?",
  'Find an easy math professor with caring reviews',
  'Which engineering prof would most students take again?',
  'Find a tough but rewarding prof for algorithms',
]

interface Props {
  filters: Filters
  professors: Professor[]
  onClose: () => void
}

export function VoiceChat({ filters, professors, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your SCU advisor. I can see ${professors.length} professor${professors.length !== 1 ? 's' : ''} matching your current filters. Ask me anything — or click the mic and just talk!`,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const {
    isListening, transcript, isSpeaking, error: voiceError,
    isSupported, startListening, stopListening, speak, stopSpeaking,
  } = useVoiceChat()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (transcript && !isListening) handleSend(transcript)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening])

  const handleSend = async (text: string) => {
    const msg = text.trim()
    if (!msg || isLoading) return

    setChatError(null)
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setInput('')
    setIsLoading(true)

    try {
      const reply = await sendChatMessage(msg, messages.slice(-8), filters, professors)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (autoSpeak) speak(reply)
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error'
      setChatError(errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-scu-red to-purple-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm">SCU AI Advisor</h3>
          <p className="text-white/60 text-xs">{professors.length} professors in context</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { if (isSpeaking) stopSpeaking(); setAutoSpeak(v => !v) }}
            title={autoSpeak ? 'Disable auto-speak' : 'Enable auto-speak'}
            className={`p-1.5 rounded-lg transition-colors ${autoSpeak ? 'bg-white/30 text-white' : 'text-white/50 hover:bg-white/20'}`}
          >
            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:bg-white/20 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-scu-red to-purple-500 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <Bot size={12} className="text-white" />
              </div>
            )}
            <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-scu-red text-white rounded-br-sm'
                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-scu-red to-purple-500 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
              <Bot size={12} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
              <Loader2 size={16} className="animate-spin text-scu-red" />
            </div>
          </div>
        )}

        {isListening && transcript && (
          <div className="flex justify-end">
            <div className="max-w-[82%] bg-scu-red border border-scu-red text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm italic">
              {transcript}
            </div>
          </div>
        )}

        {/* Suggested prompts — only on first message */}
        {messages.length === 1 && (
          <div className="space-y-1.5 pt-1">
            {SUGGESTED_PROMPTS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => handleSend(p)}
                className="w-full text-left text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-600 hover:border-scu-red hover:text-scu-red transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {chatError && (
        <div className="px-3 py-2 bg-red-50 border-t border-red-100 flex items-start gap-2 flex-shrink-0">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-red-700">{chatError}</p>
            {chatError.includes('ANTHROPIC_API_KEY') && (
              <p className="text-xs text-red-500 mt-0.5">Add <code className="font-mono bg-red-100 px-1 rounded">ANTHROPIC_API_KEY=sk-ant-...</code> to <code className="font-mono bg-red-100 px-1 rounded">frontend/.env</code></p>
            )}
          </div>
          <button type="button" onClick={() => setChatError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Voice error */}
      {voiceError && (
        <div className="px-3 py-1 bg-orange-50 text-orange-700 text-xs border-t border-orange-100 flex-shrink-0">
          {voiceError}
        </div>
      )}

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex items-end gap-2">
          {isSupported && (
            <button
              type="button"
              onClick={() => isListening ? stopListening() : startListening(t => setInput(t))}
              className={`p-2.5 rounded-xl flex-shrink-0 transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-scu-red hover:text-white'
              }`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input) } }}
            placeholder={isListening ? 'Listening…' : 'Ask about any professor…'}
            rows={1}
            disabled={isListening}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-scu-red disabled:bg-gray-50 max-h-28 overflow-y-auto"
            style={{ minHeight: '42px' }}
          />
          <button
            type="button"
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-scu-red text-white rounded-xl hover:bg-red-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
        {isListening && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-500">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Listening — I'll send when you stop speaking
          </div>
        )}
      </div>
    </div>
  )
}

export function VoiceChatButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  if (isOpen) return null
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-scu-red to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
      title="Open AI Professor Advisor"
    >
      <MessageCircle size={24} />
      <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        AI Advisor
      </span>
    </button>
  )
}
