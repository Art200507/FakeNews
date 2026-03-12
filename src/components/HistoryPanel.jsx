import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, ShieldCheck, ShieldX, AlertTriangle, HelpCircle } from 'lucide-react'

const ICONS = {
  REAL:         { icon: ShieldCheck,  color: 'text-green-400' },
  FAKE:         { icon: ShieldX,      color: 'text-red-400'   },
  MISLEADING:   { icon: AlertTriangle,color: 'text-amber-400' },
  UNVERIFIABLE: { icon: HelpCircle,   color: 'text-purple-400'},
}

const HistoryPanel = ({ history, onClose }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-50 flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <motion.div
        className="relative ml-auto w-full max-w-sm glass border-l border-white/5 h-full flex flex-col"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-white">Analysis History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-16">
              <Clock className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-600 text-sm">No analyses yet</p>
              <p className="text-slate-700 text-xs mt-1">Your history will appear here</p>
            </div>
          ) : (
            history.map((item, i) => {
              const { icon: Icon, color } = ICONS[item.verdict] ?? ICONS.UNVERIFIABLE
              const date = new Date(item.timestamp)
              return (
                <motion.div
                  key={item.id}
                  className="glass-light rounded-xl p-4 border border-white/5 cursor-pointer hover:border-cyan-500/20 transition-all"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[11px] font-mono font-bold ${color}`}>
                          {item.verdict}
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono">
                          {item.confidence}% conf.
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-snug line-clamp-2">
                        {item.excerpt}
                      </p>
                      <p className="text-[10px] text-slate-600 font-mono mt-2">
                        {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        <div className="px-5 py-4 border-t border-white/5">
          <p className="text-[11px] text-slate-600 font-mono text-center">
            History stored in session only · {history.length} / 10 entries
          </p>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
)

export default HistoryPanel
