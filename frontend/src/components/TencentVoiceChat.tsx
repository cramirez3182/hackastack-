import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Bot, AlertCircle, Phone, PhoneOff, Loader2, Radio, Mic } from 'lucide-react'
import type { Filters, Professor } from '../types/professor'

declare global {
  interface Window { TRTC: any }
}

interface TrtcMessage {
  id: string
  sender: string
  content: string
  type: 'user' | 'ai'
  end: boolean
}

interface Props {
  filters: Filters
  professors: Professor[]
  onClose: () => void
}

type Status = 'idle' | 'loading' | 'connecting' | 'active' | 'stopping' | 'error'

export function TencentVoiceChat({ professors, onClose }: Props) {
  const [messages, setMessages] = useState<TrtcMessage[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const trtcClientRef = useRef<any>(null)
  const taskIdRef = useRef<string | null>(null)
  const roomIdRef = useRef(Math.floor(Math.random() * 90000) + 10000)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const stopConversation = useCallback(async () => {
    setStatus('stopping')
    try {
      if (taskIdRef.current) {
        await fetch('/trtc-api/stop-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ TaskId: taskIdRef.current }),
        })
        taskIdRef.current = null
      }
    } catch {}
    try { await trtcClientRef.current?.exitRoom() } catch {}
    trtcClientRef.current?.destroy()
    trtcClientRef.current = null
    setStatus('idle')
  }, [])

  // Cleanup on unmount
  useEffect(() => () => { stopConversation() }, [stopConversation])

  const startConversation = useCallback(async () => {
    setError(null)
    setMessages([])
    setStatus('loading')
    try {
      // 1. Get TRTC client config from server
      const configRes = await fetch('/trtc-api/trtc-client-config')
      if (!configRes.ok) throw new Error('TRTC server not running — start it with: node backend/trtc/index.js')
      const { sdkAppId, userId, userSig } = await configRes.json()

      if (!sdkAppId || !userId || !userSig) {
        throw new Error('TRTC credentials not configured — fill in backend/trtc/.env')
      }
      if (!window.TRTC) throw new Error('TRTC SDK not loaded — check your internet connection')

      // 2. Create TRTC client and join room
      setStatus('connecting')
      const client = window.TRTC.create()
      trtcClientRef.current = client

      await client.enterRoom({
        roomId: roomIdRef.current,
        scene: 'rtc',
        sdkAppId,
        userId,
        userSig,
      })

      // 3. Listen for AI ↔ user messages via custom data channel
      client.on(window.TRTC.EVENT.CUSTOM_MESSAGE, (event: any) => {
        try {
          const data = JSON.parse(new TextDecoder().decode(event.data))
          if (data.type !== 10000) return
          const { sender, payload } = data
          const { text, roundid, end } = payload
          const isRobot = sender === 'robot_id'
          setMessages(prev => {
            const idx = prev.findIndex(m => m.id === roundid && m.sender === sender)
            if (idx !== -1) {
              const next = [...prev]
              next[idx] = { ...next[idx], content: text, end }
              return next
            }
            return [...prev, { id: roundid, content: text, sender, type: isRobot ? 'ai' : 'user', end }]
          })
        } catch {}
      })

      // 4. Open microphone
      await client.startLocalAudio()

      // 5. Tell server to start the AI agent in this room
      const startRes = await fetch('/trtc-api/start-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ RoomId: String(roomIdRef.current) }),
      })
      const startData = await startRes.json()
      if (!startRes.ok) throw new Error(startData.error || 'Failed to start AI conversation')
      taskIdRef.current = startData.TaskId

      setStatus('active')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start conversation')
      setStatus('error')
      try { await trtcClientRef.current?.exitRoom() } catch {}
      trtcClientRef.current?.destroy()
      trtcClientRef.current = null
    }
  }, [])

  const isActive = status === 'active'
  const isBusy = status === 'loading' || status === 'connecting' || status === 'stopping'

  const statusLabel = {
    idle: `${professors.length} professors in context — tap to begin`,
    loading: 'Loading config…',
    connecting: 'Connecting to voice AI…',
    active: 'Listening — speak naturally',
    stopping: 'Ending conversation…',
    error: 'Connection error',
  }[status]

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-h-[80vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#862633] to-[#5c1a23] px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={18} className="text-white" />
          </div>
          {isActive && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#862633]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm">SCU Voice Advisor</h3>
          <p className="text-white/60 text-xs truncate">{statusLabel}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/70 hover:bg-white/20 transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 min-h-[200px]">

        {/* Idle splash */}
        {status === 'idle' && messages.length === 0 && (
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 rounded-full bg-[#862633]/10 flex items-center justify-center mx-auto mb-4">
              <Mic size={28} className="text-[#862633]" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Real-time voice AI</h4>
            <p className="text-sm text-gray-500 mb-3">Powered by Tencent TRTC</p>
            <div className="space-y-1.5 text-left">
              {[
                '"Who\'s the easiest CS professor?"',
                '"Find someone who taught COEN 20"',
                '"Best tenure-track engineering prof?"',
              ].map(q => (
                <div key={q} className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-500">
                  {q}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connecting spinner */}
        {(status === 'loading' || status === 'connecting') && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 size={28} className="animate-spin text-[#862633]" />
            <p className="text-sm text-gray-500">
              {status === 'loading' ? 'Loading config…' : 'Connecting to voice AI…'}
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => (
          <div key={`${msg.id}-${i}`} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'ai' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#862633] to-[#5c1a23] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <Bot size={12} className="text-white" />
              </div>
            )}
            <div className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              msg.type === 'user'
                ? 'bg-[#862633] text-white rounded-br-sm'
                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
            }`}>
              {msg.content}
              {!msg.end && msg.type === 'ai' && (
                <span className="inline-block ml-1 w-2 h-3 bg-current animate-pulse rounded-sm" />
              )}
            </div>
          </div>
        ))}

        {/* Listening pulse */}
        {isActive && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#862633] to-[#5c1a23] flex items-center justify-center flex-shrink-0 mr-2">
              <Radio size={10} className="text-white animate-pulse" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3 py-2.5 shadow-sm flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#862633] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-3 py-2 bg-red-50 border-t border-red-100 flex items-start gap-2 flex-shrink-0">
          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700 flex-1 leading-relaxed">{error}</p>
          <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
        {!isActive ? (
          <button
            type="button"
            onClick={startConversation}
            disabled={isBusy}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#862633] hover:bg-[#6e1f29] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
          >
            {isBusy ? (
              <><Loader2 size={18} className="animate-spin" /> {status === 'loading' ? 'Loading…' : 'Connecting…'}</>
            ) : (
              <><Phone size={18} /> Start Voice Conversation</>
            )}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live — speak naturally, I'm listening
            </div>
            <button
              type="button"
              onClick={stopConversation}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 hover:bg-red-50 hover:text-red-700 text-gray-600 font-medium text-sm transition-all border border-gray-200 hover:border-red-200"
            >
              <PhoneOff size={16} /> End Conversation
            </button>
          </div>
        )}
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
        {/* Pulse ring */}
        <div className="relative w-9 h-9 flex-shrink-0">
          <span className="absolute inset-0 rounded-full bg-white/40 animate-ping" />
          <div className="relative w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <Mic size={18} />
          </div>
        </div>

        <div className="text-left">
          <div className="text-sm font-bold leading-tight">Ask our AI Advisor</div>
          <div className="text-[11px] text-white/75 leading-tight">Voice chat · Ask anything about professors</div>
        </div>

        <div className="ml-1 bg-white/20 rounded-lg px-2 py-1 text-[11px] font-semibold flex-shrink-0 group-hover:bg-white/30 transition-colors">
          Talk now →
        </div>
      </button>
    </div>
  )
}
