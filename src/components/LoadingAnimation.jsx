import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Globe, Search, BarChart3, CheckCircle } from 'lucide-react'

const STAGES = [
  { icon: Search,   label: 'Extracting key claims',         detail: 'Parsing article structure…' },
  { icon: Globe,    label: 'Searching live web sources',    detail: 'Cross-referencing with 1,000+ news databases…' },
  { icon: BarChart3,label: 'Analyzing bias & manipulation', detail: 'Detecting propaganda techniques…' },
  { icon: Cpu,      label: 'Compiling AI verdict',          detail: 'Generating credibility matrix…' },
]

const LoadingAnimation = () => {
  const [stageIdx, setStageIdx] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const totalDuration = 24000 // ~24 s soft estimate
    const stageTime = totalDuration / STAGES.length

    const stageTick = setInterval(() => {
      setStageIdx((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev))
    }, stageTime)

    const progressTick = setInterval(() => {
      setProgress((prev) => {
        const target = ((stageIdx + 1) / STAGES.length) * 92
        return prev < target ? prev + 0.4 : prev
      })
    }, 80)

    return () => {
      clearInterval(stageTick)
      clearInterval(progressTick)
    }
  }, [stageIdx])

  const { icon: StageIcon, label, detail } = STAGES[stageIdx]

  return (
    <motion.div
      className="max-w-2xl mx-auto py-16 text-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated scanner ring */}
      <div className="relative w-40 h-40 mx-auto mb-10">
        {/* Outer spinning ring */}
        <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r="70"
            fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1"
            strokeDasharray="6 6"
          />
        </svg>

        {/* Middle ring */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ animation: 'spin 4s linear infinite reverse' }}
          viewBox="0 0 160 160"
        >
          <circle
            cx="80" cy="80" r="56"
            fill="none" stroke="rgba(147,51,234,0.25)" strokeWidth="1.5"
            strokeDasharray="12 8"
          />
        </svg>

        {/* Progress arc */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80" cy="80" r="70"
            fill="none"
            stroke="rgba(0,212,255,0.6)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${(progress / 100) * 440} 440`}
            style={{ transition: 'stroke-dasharray 0.3s ease' }}
          />
        </svg>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full glass flex items-center justify-center glow-cyan">
            <AnimatePresence mode="wait">
              <motion.div
                key={stageIdx}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 20 }}
                transition={{ duration: 0.3 }}
              >
                <StageIcon className="w-8 h-8 text-cyan-400" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress % */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs font-mono text-cyan-400 tglow-cyan">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Stage label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stageIdx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-bold text-white mb-1">{label}</h3>
          <p className="text-slate-500 text-sm font-mono">{detail}</p>
        </motion.div>
      </AnimatePresence>

      {/* Stage steps */}
      <div className="flex justify-center gap-4 mt-8">
        {STAGES.map(({ icon: Icon, label: l }, i) => (
          <div
            key={i}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
              i < stageIdx ? 'opacity-100' : i === stageIdx ? 'opacity-100' : 'opacity-25'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                i < stageIdx
                  ? 'bg-green-500/20 border border-green-500/40'
                  : i === stageIdx
                  ? 'bg-cyan-500/20 border border-cyan-500/40'
                  : 'glass-light border border-white/5'
              }`}
            >
              {i < stageIdx ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Icon
                  className={`w-4 h-4 ${i === stageIdx ? 'text-cyan-400' : 'text-slate-600'}`}
                />
              )}
            </div>
            <span
              className={`text-[10px] font-mono max-w-[60px] text-center leading-tight ${
                i === stageIdx ? 'text-cyan-400' : i < stageIdx ? 'text-green-400' : 'text-slate-600'
              }`}
            >
              {l.split(' ').slice(0, 2).join(' ')}
            </span>
          </div>
        ))}
      </div>

      {/* Animated dots */}
      <div className="flex justify-center gap-1.5 mt-8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default LoadingAnimation
