import { motion } from 'framer-motion'

const SCORES = [
  { key: 'credibilityScore',     label: 'Credibility',           color: '#00d4ff', desc: 'Overall trustworthiness' },
  { key: 'factualAccuracy',      label: 'Factual Accuracy',      color: '#00ff88', desc: 'Claims match verified facts' },
  { key: 'emotionalManipulation',label: 'Manipulation',          color: '#ff2d55', desc: 'Emotional language usage', invert: true },
  { key: 'clickbaitScore',       label: 'Clickbait',             color: '#ffcc00', desc: 'Sensationalist framing',   invert: true },
]

const ScoreRing = ({ value = 0, color, label, desc, invert, delay }) => {
  const r = 44
  const circ = 2 * Math.PI * r
  // For inverted (bad) scores: low = good (green-ish), high = bad
  const displayVal = invert ? 100 - value : value
  const pct = Math.min(Math.max(value, 0), 100)
  const offset = circ * (1 - pct / 100)

  const riskLevel = invert
    ? value > 66 ? 'HIGH' : value > 33 ? 'MED' : 'LOW'
    : value > 66 ? 'HIGH' : value > 33 ? 'MED' : 'LOW'

  const riskColor = invert
    ? value > 66 ? '#ff2d55' : value > 33 ? '#ffcc00' : '#00ff88'
    : value > 66 ? '#00ff88' : value > 33 ? '#ffcc00' : '#ff2d55'

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
          {/* Value arc */}
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{
              filter: `drop-shadow(0 0 5px ${color}80)`,
              transition: 'stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-white">{value}</span>
          <span className="text-[9px] font-mono" style={{ color: riskColor }}>
            {riskLevel}
          </span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className="text-xs font-semibold text-white">{label}</p>
        <p className="text-[10px] text-slate-500 mt-0.5 max-w-[100px] text-center leading-tight">
          {desc}
        </p>
      </div>
    </motion.div>
  )
}

const ScoreMatrix = ({ result }) => (
  <motion.div
    className="glass rounded-2xl p-6"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15 }}
  >
    <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest mb-6">
      Credibility Matrix
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
      {SCORES.map(({ key, label, color, desc, invert }, i) => (
        <ScoreRing
          key={key}
          value={result[key] ?? 0}
          color={color}
          label={label}
          desc={desc}
          invert={invert}
          delay={0.2 + i * 0.1}
        />
      ))}
    </div>

    {/* Bar summary */}
    <div className="mt-6 pt-6 border-t border-white/5 grid gap-3">
      {SCORES.map(({ key, label, color, invert }) => {
        const v = result[key] ?? 0
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 font-mono w-32 flex-shrink-0">{label}</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden shimmer-bar">
              <motion.div
                className="h-full rounded-full"
                style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
                initial={{ width: 0 }}
                animate={{ width: `${v}%` }}
                transition={{ delay: 0.4, duration: 1.2, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-400 w-8 text-right">{v}</span>
          </div>
        )
      })}
    </div>
  </motion.div>
)

export default ScoreMatrix
