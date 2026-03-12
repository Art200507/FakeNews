import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, ChevronDown } from 'lucide-react'

const STATUS_CONFIG = {
  VERIFIED:   { icon: CheckCircle,   color: 'green',  chip: 'chip-green',  label: 'Verified'   },
  FALSE:      { icon: XCircle,       color: 'red',    chip: 'chip-red',    label: 'False'      },
  MISLEADING: { icon: AlertTriangle, color: 'amber',  chip: 'chip-amber',  label: 'Misleading' },
  UNVERIFIED: { icon: HelpCircle,    color: 'purple', chip: 'chip-purple', label: 'Unverified' },
}

const ClaimRow = ({ claim, status, explanation, idx }) => {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.UNVERIFIED
  const { icon: Icon, color, chip, label } = cfg

  return (
    <motion.div
      className="glass-light rounded-xl border border-white/5 overflow-hidden"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.07 }}
    >
      <button
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/2 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`text-[10px] font-mono text-slate-600 mt-0.5 w-5 flex-shrink-0`}>
          #{idx + 1}
        </span>
        <Icon className={`w-4 h-4 text-${color}-400 flex-shrink-0 mt-0.5`} />
        <p className="flex-1 text-sm text-slate-300 leading-snug">{claim}</p>
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${chip}`}>{label}</span>
          <ChevronDown
            className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className={`px-4 pb-4 pt-0 ml-8 border-l-2 border-${color}-500/30 pl-4`}>
              <p className="text-xs text-slate-400 leading-relaxed">{explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const ClaimsAnalysis = ({ claims = [] }) => {
  const counts = claims.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1
    return acc
  }, {})

  if (!claims.length) return null

  return (
    <motion.div
      className="glass rounded-2xl p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">
          Claim-by-Claim Fact Check
        </h3>
        {/* Summary chips */}
        <div className="flex gap-2 flex-wrap justify-end">
          {Object.entries(counts).map(([status, count]) => {
            const cfg = STATUS_CONFIG[status]
            if (!cfg) return null
            return (
              <span key={status} className={`text-[10px] font-mono px-2 py-0.5 rounded ${cfg.chip}`}>
                {count} {cfg.label}
              </span>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        {claims.map((c, i) => (
          <ClaimRow
            key={i}
            idx={i}
            claim={c.claim}
            status={c.status}
            explanation={c.explanation}
          />
        ))}
      </div>

      <p className="text-[11px] text-slate-600 mt-4 font-mono text-center">
        Click any claim to expand the explanation · Powered by Perplexity web search
      </p>
    </motion.div>
  )
}

export default ClaimsAnalysis
