import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { terminalService } from '../services/services'
import { useAuthStore } from '../store'
import type { TerminalEntry } from '../types'
import { Zap, ChevronRight } from 'lucide-react'

const INITIAL_MESSAGE = `SYSTEM ONLINE.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THE SYSTEM v1.0.0
AI Core: ACTIVE
Monitoring: ENABLED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Identity detected.

Type /help to access the command registry.
Or speak freely. The System is always listening.`

const SUGGESTIONS = ['/status', '/quests', '/stats', '/rank', '/progress', '/analyze', '/predict', '/streak', '/inventory', '/help']

function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const chars = text.split('')
    const timer = setInterval(() => {
      if (i < chars.length) {
        setDisplayed(chars.slice(0, i + 1).join(''))
        i++
      } else {
        clearInterval(timer)
        setDone(true)
        onComplete?.()
      }
    }, 12)
    return () => clearInterval(timer)
  }, [text])

  return (
    <span className="whitespace-pre-wrap">
      {displayed}
      {!done && <span className="terminal-cursor" />}
    </span>
  )
}

export function TerminalPage() {
  const { user } = useAuthStore()
  const [entries, setEntries] = useState<TerminalEntry[]>([
    { id: 'init', type: 'system', content: INITIAL_MESSAGE, timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  const addEntry = useCallback((type: TerminalEntry['type'], content: string) => {
    setEntries(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      type,
      content,
      timestamp: new Date(),
    }])
  }, [])

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return

    const command = input.trim()
    setInput('')
    setHistoryIndex(-1)
    setShowSuggestions(false)
    setHistory(h => [command, ...h.slice(0, 49)])

    // Show command
    addEntry('command', command)

    setIsLoading(true)
    try {
      const result = await terminalService.sendCommand(command)
      addEntry('response', result.response)
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Connection error. The System is unreachable.'
      addEntry('error', errMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const newIndex = Math.min(historyIndex + 1, history.length - 1)
      setHistoryIndex(newIndex)
      setInput(history[newIndex] || '')
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const newIndex = Math.max(historyIndex - 1, -1)
      setHistoryIndex(newIndex)
      setInput(newIndex === -1 ? '' : history[newIndex])
      return
    }
    if (e.key === 'Tab' && showSuggestions) {
      e.preventDefault()
      const match = SUGGESTIONS.find(s => s.startsWith(input))
      if (match) setInput(match)
      return
    }
  }

  const filteredSuggestions = input.startsWith('/')
    ? SUGGESTIONS.filter(s => s.startsWith(input) && s !== input)
    : []

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Terminal header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-bg-card border border-border rounded-t-xl border-b-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-danger/60" />
          <div className="w-3 h-3 rounded-full bg-gold/60" />
          <div className="w-3 h-3 rounded-full bg-success/60" />
        </div>
        <div className="flex-1 text-center">
          <span className="font-mono text-xs text-text-muted">
            THE SYSTEM — AI TERMINAL — {user?.username?.toUpperCase()}
          </span>
        </div>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-1.5"
        >
          <Zap size={10} className="text-accent-blue" />
          <span className="font-mono text-2xs text-accent-blue">LIVE</span>
        </motion.div>
      </div>

      {/* Terminal body */}
      <div
        className="flex-1 overflow-y-auto bg-bg-card border border-border px-6 py-4 font-mono text-sm"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="space-y-3">
          <AnimatePresence>
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {entry.type === 'command' && (
                  <div className="flex items-start gap-2">
                    <span className="text-accent-blue shrink-0 mt-0.5">
                      <ChevronRight size={12} />
                    </span>
                    <span className="text-accent-blue">{entry.content}</span>
                    <span className="text-text-muted text-2xs ml-auto shrink-0 mt-0.5">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {entry.type === 'response' && (
                  <div className="pl-4 border-l border-border-DEFAULT">
                    {entry === entries[entries.length - 1] && !isLoading ? (
                      <TypewriterText text={entry.content} />
                    ) : (
                      <span className="text-text-secondary whitespace-pre-wrap">{entry.content}</span>
                    )}
                  </div>
                )}

                {entry.type === 'system' && (
                  <div className="text-text-muted whitespace-pre-wrap text-xs">
                    {entry.content}
                  </div>
                )}

                {entry.type === 'error' && (
                  <div className="text-danger text-xs pl-4 border-l border-danger/30">
                    SYSTEM ERROR: {entry.content}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-accent-blue text-xs pl-4 border-l border-border"
            >
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                Processing
              </motion.div>
              <motion.div className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  >
                    .
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="relative bg-bg-card border border-border border-t-0 rounded-b-xl">
        {/* Autocomplete suggestions */}
        <AnimatePresence>
          {filteredSuggestions.length > 0 && showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-full left-0 right-0 bg-bg-elevated border border-border rounded-t-lg overflow-hidden"
            >
              {filteredSuggestions.slice(0, 5).map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); inputRef.current?.focus() }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-xs font-mono text-text-secondary hover:bg-border hover:text-accent-blue transition-colors"
                >
                  <ChevronRight size={10} className="text-accent-blue" />
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 p-4">
          <span className="text-accent-blue font-mono text-sm shrink-0">
            <ChevronRight size={14} />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => {
              setInput(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Type a command or speak to The System..."
            className="flex-1 bg-transparent text-text-primary font-mono text-sm placeholder:text-text-muted focus:outline-none"
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="px-4 py-1.5 bg-accent-blue text-bg text-xs font-mono rounded font-medium disabled:opacity-40 hover:bg-accent-blue/90 transition-colors shrink-0"
          >
            SEND
          </button>
        </div>

        {/* Quick commands */}
        <div className="flex gap-2 px-4 pb-3 flex-wrap">
          {['/status', '/quests', '/analyze', '/predict'].map(cmd => (
            <button
              key={cmd}
              onClick={() => { setInput(cmd); inputRef.current?.focus() }}
              className="text-2xs px-2 py-1 bg-bg border border-border rounded font-mono text-text-muted hover:text-accent-blue hover:border-accent-blue/30 transition-colors"
            >
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
