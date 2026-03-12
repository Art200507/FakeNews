import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Search, FileText, Zap, AlertCircle, Cpu,
  Eye, Target, BarChart3, Globe,
} from 'lucide-react'

const FEATURES = [
  { icon: Globe, label: 'Live Web Search', color: 'cyan' },
  { icon: Target, label: 'Claim Verification', color: 'purple' },
  { icon: BarChart3, label: 'Bias Detection', color: 'green' },
  { icon: Eye, label: 'Propaganda Analysis', color: 'amber' },
]

const SAMPLE_ARTICLES = [
  `Scientists at MIT have discovered a revolutionary method to generate unlimited clean energy using common seawater. The breakthrough, announced yesterday, could completely replace all fossil fuels within just 18 months according to insiders. Government officials have reportedly been silencing the technology for decades due to pressure from the oil industry.`,
  `The Federal Reserve raised interest rates by 0.25 percentage points today, marking the tenth consecutive increase as the central bank continues its efforts to combat inflation. Fed Chair Jerome Powell stated the decision was based on continued strong employment data and persistent core inflation above the 2% target. Economists expect one more increase before a potential pause later this year.`,
  `Leaked documents reveal that 5G cell towers contain hidden surveillance cameras that record all private conversations within a 500-meter radius. The data is allegedly transmitted directly to foreign intelligence agencies. Multiple whistleblowers who tried to expose this have mysteriously disappeared, according to anonymous sources on social media.`,
]

const ArticleInput = ({ article, setArticle, onAnalyze }) => {
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef(null)

  const wordCount = article.trim() ? article.trim().split(/\s+/).length : 0
  const isReady = article.trim().length >= 50

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const text = e.dataTransfer.getData('text/plain')
    if (text) setArticle(text)
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full chip-cyan text-xs font-mono mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Cpu className="w-3.5 h-3.5" />
          Powered by Perplexity Sonar Pro · Real-time Web Verification
        </motion.div>

        <h2 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none mb-5">
          <span className="text-white">Detect </span>
          <span className="hero-gradient">Truth</span>
          <br />
          <span className="text-white">from </span>
          <span
            className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text"
            style={{ WebkitTextFillColor: 'transparent' }}
          >
            Fiction
          </span>
        </h2>

        <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Advanced AI analysis — claim-by-claim verification, political bias scoring,
          propaganda technique detection, and real-time source cross-referencing.
        </p>
      </motion.div>

      {/* ── Input card ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div
          className={`glass gradient-border rounded-2xl p-6 transition-all duration-300 relative overflow-hidden ${
            isDragging ? 'bg-cyan-500/5' : ''
          }`}
        >
          {/* Tab header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg chip-cyan text-xs font-mono">
              <FileText className="w-3.5 h-3.5" />
              Paste Article
            </div>
            <span className="text-slate-600 text-xs ml-2">or drag and drop text</span>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={article}
              onChange={(e) => setArticle(e.target.value)}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              placeholder={`Paste your article or news text here…\n\nThe AI will analyze:\n  • Every factual claim against live web sources\n  • Political leaning and bias patterns\n  • Emotional manipulation & propaganda techniques\n  • Source credibility fingerprints\n  • Social media misinformation risk`}
              className="w-full h-56 bg-transparent text-slate-200 placeholder-slate-600/60 resize-none font-mono text-sm leading-relaxed input-cyber transition-all"
              style={{ caretColor: 'var(--cyan)' }}
            />
            {/* Word / char counter */}
            <div className="absolute bottom-2 right-2 text-[11px] text-slate-600 font-mono select-none">
              {wordCount} words
            </div>
          </div>

          {/* Warning */}
          {article.length > 0 && !isReady && (
            <motion.div
              className="flex items-center gap-2 text-amber-400 text-xs mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Paste more text for accurate analysis (minimum 50 characters)
            </motion.div>
          )}

          {/* Sample articles */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <p className="text-[11px] text-slate-600 font-mono uppercase tracking-wider mb-2.5">
              Quick test examples
            </p>
            <div className="grid gap-2">
              {SAMPLE_ARTICLES.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => setArticle(sample)}
                  className="text-left text-xs px-3 py-2 rounded-lg glass-light border border-white/5 text-slate-500 hover:text-slate-200 hover:border-cyan-500/20 transition-all line-clamp-1"
                >
                  <span className="text-cyan-600 font-mono mr-2">{i + 1}.</span>
                  {sample.slice(0, 80)}…
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analyze button */}
        <motion.button
          onClick={onAnalyze}
          disabled={!isReady}
          className="w-full mt-5 py-4 rounded-xl btn-cyber font-bold text-base tracking-[0.12em] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: isReady
              ? 'linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(147,51,234,0.15) 100%)'
              : 'rgba(15,23,42,0.5)',
            border: isReady ? '1px solid rgba(0,212,255,0.35)' : '1px solid rgba(99,102,241,0.15)',
          }}
          whileHover={isReady ? { scale: 1.015 } : {}}
          whileTap={isReady ? { scale: 0.985 } : {}}
        >
          {isReady ? (
            <span className="flex items-center justify-center gap-2 text-cyan-400 tglow-cyan">
              <Search className="w-5 h-5" />
              ANALYZE WITH AI
              <Zap className="w-4 h-4" />
            </span>
          ) : (
            <span className="text-slate-600 flex items-center justify-center gap-2">
              <Search className="w-4 h-4" />
              PASTE AN ARTICLE TO ANALYZE
            </span>
          )}
        </motion.button>

        {/* Feature badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          {FEATURES.map(({ icon: Icon, label, color }, i) => (
            <motion.div
              key={label}
              className="glass-light rounded-xl p-3 text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
            >
              <Icon className={`w-5 h-5 text-${color}-400 mx-auto mb-1.5 opacity-80`} />
              <p className="text-[11px] text-slate-500 leading-snug">{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default ArticleInput
