import { motion } from 'framer-motion'
import { Shield, History, Zap, Activity } from 'lucide-react'

const Header = ({ onHistoryClick, historyCount }) => (
  <header className="sticky top-0 z-50 glass border-b border-white/5">
    <div className="container mx-auto px-4 py-3 max-w-7xl flex items-center justify-between">

      {/* Logo */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-9 h-9">
          <Shield className="absolute inset-0 w-9 h-9 text-cyan-400" strokeWidth={1.5} />
          <Shield
            className="absolute inset-0 w-9 h-9 text-cyan-400/20 pulse-ring"
            strokeWidth={1.5}
          />
        </div>
        <div>
          <h1 className="text-lg font-black tracking-[0.2em] leading-none">
            VERI<span className="text-cyan-400 tglow-cyan">DICA</span>
          </h1>
          <p className="text-[9px] text-slate-500 font-mono tracking-[0.25em] uppercase leading-none mt-0.5">
            AI Truth Engine v2.0
          </p>
        </div>
      </motion.div>

      {/* Right controls */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
          <Activity className="w-3.5 h-3.5 text-green-400" />
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            AI Online
          </span>
        </div>

        {/* Perplexity badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg chip-cyan text-xs font-mono">
          <Zap className="w-3 h-3" />
          Sonar Pro
        </div>

        {/* History */}
        <button
          onClick={onHistoryClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-light text-slate-400 hover:text-cyan-400 hover:border-cyan-500/25 transition-all text-sm border border-white/5"
        >
          <History className="w-4 h-4" />
          <span className="hidden md:inline">History</span>
          {historyCount > 0 && (
            <span className="chip-cyan text-[10px] px-1.5 py-0.5 rounded font-mono leading-none">
              {historyCount}
            </span>
          )}
        </button>
      </motion.div>
    </div>
  </header>
)

export default Header
