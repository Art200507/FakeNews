import { motion } from 'framer-motion'
import { ShieldCheck, ShieldX, AlertTriangle, HelpCircle, Share2, RotateCcw } from 'lucide-react'

const VERDICT_CONFIG = {
  REAL:         { icon: ShieldCheck,  color: 'green',  glow: 'glow-green',  tglow: 'tglow-green',  label: 'CREDIBLE',    bg: 'rgba(0,255,136,0.06)',  border: 'rgba(0,255,136,0.3)' },
  FAKE:         { icon: ShieldX,      color: 'red',    glow: 'glow-red',    tglow: 'tglow-red',    label: 'FAKE NEWS',   bg: 'rgba(255,45,85,0.06)',  border: 'rgba(255,45,85,0.3)' },
  MISLEADING:   { icon: AlertTriangle,color: 'amber',  glow: 'glow-amber',  tglow: 'tglow-amber',  label: 'MISLEADING',  bg: 'rgba(255,204,0,0.06)',  border: 'rgba(255,204,0,0.3)' },
  UNVERIFIABLE: { icon: HelpCircle,   color: 'purple', glow: 'glow-purple', tglow: 'tglow-purple', label: 'UNVERIFIABLE',bg: 'rgba(168,85,247,0.06)', border: 'rgba(168,85,247,0.3)' },
}

const ConfidenceRing = ({ value, color }) => {
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - value / 100)
  const colorMap = { green: '#00ff88', red: '#ff2d55', amber: '#ffcc00', purple: '#a855f7' }
  const stroke = colorMap[color] || '#00d4ff'

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
      <circle
        cx="50" cy="50" r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          filter: `drop-shadow(0 0 6px ${stroke})`,
          transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </svg>
  )
}

const VerdictCard = ({ result, onReset }) => {
  const cfg = VERDICT_CONFIG[result.verdict] ?? VERDICT_CONFIG.UNVERIFIABLE
  const { icon: Icon, color, glow, tglow, label, bg, border } = cfg

  const handleShare = () => {
    const text = `VERIDICA Analysis: ${label} (${result.confidence}% confidence)\n\n${result.summary}`
    if (navigator.share) {
      navigator.share({ title: 'VERIDICA Fact-Check', text })
    } else {
      navigator.clipboard.writeText(text)
      alert('Analysis copied to clipboard!')
    }
  }

  return (
    <motion.div
      className={`glass gradient-border rounded-2xl p-8 text-center relative overflow-hidden ${glow}`}
      style={{ background: bg, borderColor: border }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Scan line */}
      <div
        className="scan-overlay bg-gradient-to-r from-transparent via-white/5 to-transparent"
        style={{ animation: 'scan 5s linear infinite' }}
      />

      {/* Action buttons */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={handleShare}
          className="p-2 glass-light rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
          title="Share analysis"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          className="p-2 glass-light rounded-lg text-slate-400 hover:text-cyan-400 transition-colors"
          title="Analyze new article"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Icon */}
      <motion.div
        className={`w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center ${glow}`}
        style={{ background: bg, border: `1px solid ${border}` }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
      >
        <Icon className={`w-10 h-10 text-${color}-400`} />
      </motion.div>

      {/* Verdict label */}
      <motion.h2
        className={`text-4xl md:text-5xl font-black tracking-widest mb-2 text-${color}-400 ${tglow}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {label}
      </motion.h2>

      {/* Confidence ring */}
      <motion.div
        className="flex items-center justify-center gap-6 my-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="relative w-24 h-24">
          <ConfidenceRing value={result.confidence} color={color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black text-${color}-400`}>{result.confidence}%</span>
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
              Confidence
            </span>
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      <motion.p
        className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {result.summary}
      </motion.p>

      {/* Quick meta stats */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[
          { label: 'Credibility', value: `${result.credibilityScore ?? '—'}/100` },
          { label: 'Factual Accuracy', value: `${result.factualAccuracy ?? '—'}/100` },
          { label: 'Source Reliability', value: `${result.sourceReliability ?? '—'}/100` },
          { label: 'Social Media Risk', value: `${result.socialMediaRisk ?? '—'}/100` },
        ].map(({ label: lbl, value }) => (
          <div
            key={lbl}
            className="px-4 py-2 rounded-xl glass-light border border-white/5 text-center"
          >
            <div className="text-sm font-bold text-white">{value}</div>
            <div className="text-[10px] text-slate-500 font-mono">{lbl}</div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default VerdictCard
