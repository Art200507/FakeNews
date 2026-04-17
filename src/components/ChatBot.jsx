import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, X, Send, Bot, User, ExternalLink,
  Minimize2, Shield, Zap,
} from 'lucide-react'
import { chatWithContext } from '../services/api'

const QUICK_QUESTIONS = [
  'Why is this article misleading?',
  'What are the main red flags?',
  'Can you verify the key claims?',
  'What are the reliable sources on this topic?',
]

const CitationBubble = ({ citations }) => {
  if (!citations?.length) return null
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {citations.slice(0, 3).map((url, i) => {
        let host = url
        try { host = new URL(url).hostname.replace('www.', '') } catch {}
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] chip-cyan px-2 py-0.5 rounded font-mono hover:opacity-80 transition-opacity"
          >
            <ExternalLink className="w-2.5 h-2.5" />
            {host}
          </a>
        )
      })}
    </div>
  )
}

const ChatBot = ({ articleContext, analysisResult }) => {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: articleContext
        ? `I'm VERIDICA AI. I've loaded your article and analysis results as context. What would you like to know?`
        : `Hi! I'm VERIDICA AI, your fact-checking assistant. Paste an article and analyze it first, then I can answer detailed questions about it.`,
      citations: [],
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const bottomRef = useRef(null)

  // Update welcome message when article is loaded
  useEffect(() => {
    if (articleContext && messages.length === 1) {
      setMessages([{
        role: 'assistant',
        content: `Article analyzed! I now have full context. Ask me anything about the fact-check results, the claims, or the topic in general.`,
        citations: [],
      }])
    }
  }, [articleContext])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || isTyping) return

    const userMsg = { role: 'user', content: userText, citations: [] }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const apiMessages = [...messages, userMsg]
        .filter((m) => m.role !== 'system')
        .map(({ role, content }) => ({ role, content }))

      const { content, citations } = await chatWithContext(
        apiMessages,
        articleContext,
        analysisResult
      )
      setMessages((prev) => [...prev, { role: 'assistant', content, citations }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble connecting. Please try again.',
          citations: [],
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center glow-cyan"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(147,51,234,0.2))',
              border: '1px solid rgba(0,212,255,0.35)',
            }}
            onClick={() => setOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <MessageSquare className="w-6 h-6 text-cyan-400" />
            {/* Unread dot */}
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-[#020617] animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 w-[360px] h-[520px] flex flex-col glass gradient-border rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Shield className="w-6 h-6 text-cyan-400" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 border border-[#0f172a]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none">VERIDICA AI</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {articleContext ? '● Article context loaded' : '○ No article context'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="chip-cyan text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  Sonar
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scroll">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-cyan-500/20 border border-cyan-500/30'
                        : 'bg-purple-500/20 border border-purple-500/30'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2.5 text-xs leading-relaxed ${
                      msg.role === 'user' ? 'bubble-user text-slate-200' : 'bubble-ai text-slate-300'
                    }`}
                  >
                    {msg.content}
                    <CitationBubble citations={msg.citations} />
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  className="flex gap-2.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-purple-500/20 border border-purple-500/30">
                    <Bot className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="bubble-ai rounded-xl px-4 py-3 flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-purple-400"
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            {messages.length <= 2 && (
              <div className="px-4 py-2 border-t border-white/5">
                <p className="text-[10px] text-slate-600 font-mono mb-1.5">Quick questions:</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-[10px] px-2 py-1.5 glass-light rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500/25 border border-white/5 transition-all text-left line-clamp-1"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about this article…"
                  className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 input-cyber transition-all font-mono"
                  disabled={isTyping}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isTyping}
                  className="w-9 h-9 flex items-center justify-center rounded-xl transition-all disabled:opacity-30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(147,51,234,0.2))',
                    border: '1px solid rgba(0,212,255,0.3)',
                  }}
                >
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default ChatBot
