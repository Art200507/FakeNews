import { motion } from 'framer-motion'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

const LABELS = [
  { val: -100, label: 'Far Left',     color: '#3b82f6' },
  { val: -60,  label: 'Left',         color: '#60a5fa' },
  { val: -20,  label: 'Center-Left',  color: '#93c5fd' },
  { val: 0,    label: 'Center',       color: '#e2e8f0' },
  { val: 20,   label: 'Center-Right', color: '#fca5a5' },
  { val: 60,   label: 'Right',        color: '#f87171' },
  { val: 100,  label: 'Far Right',    color: '#ef4444' },
]

const getColor = (score) => {
  if (score <= -60) return '#3b82f6'
  if (score <= -20) return '#60a5fa'
  if (score <= 20)  return '#e2e8f0'
  if (score <= 60)  return '#fca5a5'
  return '#ef4444'
}

const BiasIndicator = ({ biasScore = 0, biasLabel = 'Center' }) => {
  // Convert -100…100 to 0…100% position
  const pct = ((biasScore + 100) / 200) * 100
  const color = getColor(biasScore)
  const isLeft = biasScore < -10
  const isRight = biasScore > 10

  return (
    <motion.div
      className="glass rounded-2xl p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">
          Political Bias Spectrum
        </h3>
        <div className="flex items-center gap-2">
          {isLeft && <TrendingDown className="w-4 h-4 text-blue-400" />}
          {isRight && <TrendingUp className="w-4 h-4 text-red-400" />}
          {!isLeft && !isRight && <Minus className="w-4 h-4 text-slate-400" />}
          <span
            className="text-sm font-bold font-mono"
            style={{ color, textShadow: `0 0 10px ${color}80` }}
          >
            {biasLabel}
          </span>
        </div>
      </div>

      {/* Spectrum track */}
      <div className="relative h-5 rounded-full overflow-hidden bias-track mb-2">
        {/* Animated marker */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10"
          style={{ left: `${pct}%` }}
          initial={{ left: '50%' }}
          animate={{ left: `${pct}%` }}
          transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
        >
          <div
            className="w-5 h-5 rounded-full border-2 border-[#020617] shadow-lg"
            style={{ background: color, boxShadow: `0 0 12px ${color}` }}
          />
        </motion.div>

        {/* Center line */}
        <div className="absolute top-0 left-1/2 -translate-x-px h-full w-0.5 bg-white/20 z-10" />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-blue-400 font-mono">◀ Left</span>
        <span className="text-[10px] text-slate-500 font-mono">Center</span>
        <span className="text-[10px] text-red-400 font-mono">Right ▶</span>
      </div>

      {/* Score chip */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <div
          className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold"
          style={{
            background: `${color}18`,
            border: `1px solid ${color}40`,
            color,
            textShadow: `0 0 8px ${color}80`,
          }}
        >
          Bias Score: {biasScore > 0 ? '+' : ''}{biasScore}
        </div>
        <div className="text-xs text-slate-500">
          {Math.abs(biasScore) < 15
            ? 'Near-neutral reporting'
            : Math.abs(biasScore) < 50
            ? 'Moderate leaning detected'
            : 'Strong ideological bias detected'}
        </div>
      </div>

      {/* Scale markers */}
      <div className="flex justify-between mt-4 px-1">
        {LABELS.map(({ val, label, color: lc }) => (
          <div key={val} className="flex flex-col items-center gap-0.5">
            <div className="w-px h-2" style={{ background: lc }} />
            <span className="text-[9px] font-mono hidden md:block" style={{ color: lc }}>
              {label.split('-')[0]}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default BiasIndicator
