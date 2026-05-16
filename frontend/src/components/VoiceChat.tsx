import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Send, X, Volume2, VolumeX, MessageCircle, Loader2, Bot } from 'lucide-react'
import type { ChatMessage, Filters, Professor } from '../types/professor'
import { sendChatMessage } from '../api/professors'
import { useVoiceChat } from '../hooks/useVoiceChat'

const SUGGESTED_PROMPTS = [
  'Who is the best CS professor for beginners?',
  'Find an easy math professor with caring reviews',
  'Compare difficulty vs rating for engineering',
  'Who would students take again?',
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
      content: `Hi! I'm your SCU professor advisor. I can see ${professors.length} professor${professors.length !== 1 ? 's' : ''} matching your current filters. Ask me anything — like "Who's the most approachable CS professor?" or "Find me an easy A in math." You can also click the mic and just talk to me!`,
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const {
    isListening, transcript, isSpeaking, error,
    isSupported, startListening, stopListening, speak, stopSpeaking,
  } = useVoiceChat()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // When voice transcript finalizes, send it automatically
  useEffect(() => {
    if (transcript && !isListening) {
      handleSend(transcript)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening])

  const handleSend = async (text: string) => {
    const msg = text.trim()
    if (!msg || isLoading) return

    const userMsg: ChatMessage = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const history = messages.slice(-10) // keep last 10 for context
      const reply = await sendChatMessage(
        msg,
        history,
        filters,
        professors.slice(0, 50).map(p => p.id),
      )

      const assistantMsg: ChatMessage = { role: 'assistant', content: reply }
      setMessages(prev => [...prev, assistantMsg])

      if (autoSpeak) {
        speak(reply)
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Make sure the backend is running and your ANTHROPIC_API_KEY is set.',
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleMic = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening(text => setInput(text))
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-h-[75vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm">SCU Advisor</h3>
          <p className="text-white/60 text-xs">{professors.length} professors in context</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking()
              setAutoSpeak(v => !v)
            }}
            title={autoSpeak ? 'Disable auto-speak' : 'Enable auto-speak'}
            className={`p-1.5 rounded-lg transition-colors ${autoSpeak ? 'bg-white/30 text-white' : 'text-white/50 hover:bg-white/20'}`}
          >
            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:bg-white/20 transition-colors">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <Bot size={12} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
              <Bot size={12} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
              <Loader2 size={16} className="animate-spin text-blue-500" />
            </div>
          </div>
        )}

        {/* Voice transcript preview */}
        {isListening && transcript && (
          <div className="flex justify-end">
            <div className="max-w-[80%] bg-blue-100 border border-blue-200 text-blue-800 rounded-2xl rounded-br-sm px-3 py-2 text-sm italic">
              {transcript}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-3 py-1.5 bg-red-50 text-red-600 text-xs border-t border-red-100">
          {error}
        </div>
      )}

      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-gray-50 border-t border-gray-100">
          {SUGGESTED_PROMPTS.map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-700 transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-3 bg-white border-t border-gray-100">
        <div className="flex items-end gap-2">
          {isSupported && (
            <button
              onClick={handleMic}
              className={`p-2.5 rounded-xl flex-shrink-0 transition-all ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          )}

          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(input)
                }
              }}
              placeholder={isListening ? 'Listening...' : 'Ask about professors...'}
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-28 overflow-y-auto"
              style={{ minHeight: '42px' }}
              disabled={isListening}
            />
          </div>

          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>

        {isListening && (
          <div className="mt-2 flex items-center gap-2 text-xs text-red-500">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Listening — speak now, I'll send when you stop
          </div>
        )}
        {!isSupported && (
          <p className="mt-1.5 text-xs text-gray-400">Voice input not available in this browser.</p>
        )}
      </div>
    </div>
  )
}

interface VoiceChatButtonProps {
  onClick: () => void
  isOpen: boolean
}

export function VoiceChatButton({ onClick, isOpen }: VoiceChatButtonProps) {
  if (isOpen) return null
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
      title="Open AI Professor Advisor"
    >
      <MessageCircle size={24} />
      <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        AI Advisor
      </span>
    </button>
  )
}
