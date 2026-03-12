import { motion } from 'framer-motion'
import { AlertOctagon, TrendingUp, Cpu, BookOpen } from 'lucide-react'

const SuspiciousLanguage = ({ result }) => {
  const {
    suspiciousWords = [],
    redFlags = [],
    positiveIndicators = [],
    propagandaTechniques = [],
    readabilityLevel,
    toneDescription,
    writingStyleRisk,
    clickbaitScore,
  } = result

  const riskColor = {
    low: 'chip-green',
    medium: 'chip-amber',
    high: 'chip-red',
  }[writingStyleRisk?.toLowerCase()] || 'chip-slate'

  return (
    <motion.div
      className="glass rounded-2xl p-6 space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">
        Language & Rhetoric Analysis
      </h3>

      {/* Writing style row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: BookOpen, label: 'Reading Level', value: readabilityLevel || '—' },
          { icon: Cpu,      label: 'Tone',           value: toneDescription  || '—' },
          { icon: TrendingUp, label: 'Clickbait', value: `${clickbaitScore ?? '—'}/100` },
          { icon: AlertOctagon, label: 'Writing Risk', value: writingStyleRisk || '—', chip: riskColor },
        ].map(({ icon: Icon, label, value, chip }) => (
          <div key={label} className="glass-light rounded-xl p-3 border border-white/5">
            <Icon className="w-4 h-4 text-slate-500 mb-1.5" />
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">{label}</p>
            {chip ? (
              <span className={`text-xs font-mono px-2 py-0.5 rounded mt-1 inline-block ${chip}`}>
                {value}
              </span>
            ) : (
              <p className="text-sm font-semibold text-white mt-0.5 truncate">{value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Red flags & positive indicators */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Red flags */}
        <div>
          <p className="text-[11px] font-mono text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5" /> Red Flags ({redFlags.length})
          </p>
          <div className="space-y-1.5">
            {redFlags.length ? redFlags.map((flag, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-2 px-3 py-2 rounded-lg chip-red text-xs"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <span className="text-red-400 flex-shrink-0 mt-0.5">▸</span>
                {flag}
              </motion.div>
            )) : (
              <p className="text-xs text-slate-600 italic">No red flags detected</p>
            )}
          </div>
        </div>

        {/* Positive indicators */}
        <div>
          <p className="text-[11px] font-mono text-green-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Positive Indicators ({positiveIndicators.length})
          </p>
          <div className="space-y-1.5">
            {positiveIndicators.length ? positiveIndicators.map((ind, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-2 px-3 py-2 rounded-lg chip-green text-xs"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <span className="text-green-400 flex-shrink-0 mt-0.5">▸</span>
                {ind}
              </motion.div>
            )) : (
              <p className="text-xs text-slate-600 italic">No positive indicators found</p>
            )}
          </div>
        </div>
      </div>

      {/* Propaganda techniques */}
      {propagandaTechniques.length > 0 && (
        <div>
          <p className="text-[11px] font-mono text-amber-400 uppercase tracking-widest mb-2">
            Propaganda Techniques Detected
          </p>
          <div className="flex flex-wrap gap-2">
            {propagandaTechniques.map((t, i) => (
              <motion.span
                key={i}
                className="chip-amber text-xs px-3 py-1 rounded-lg font-mono"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.05 * i }}
              >
                ⚠ {t}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Suspicious words */}
      {suspiciousWords.length > 0 && (
        <div>
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">
            Emotionally Charged Language
          </p>
          <div className="flex flex-wrap gap-2">
            {suspiciousWords.map((w, i) => (
              <motion.span
                key={i}
                className="chip-slate text-xs px-3 py-1 rounded-lg font-mono"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.04 * i }}
              >
                "{w}"
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default SuspiciousLanguage
