import { motion } from 'framer-motion'
import VerdictCard from './VerdictCard'
import ScoreMatrix from './ScoreMatrix'
import BiasIndicator from './BiasIndicator'
import ClaimsAnalysis from './ClaimsAnalysis'
import SuspiciousLanguage from './SuspiciousLanguage'
import RelatedArticles from './RelatedArticles'

const AnalysisResult = ({ result, articleText, onReset }) => (
  <motion.div
    className="max-w-5xl mx-auto space-y-5"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
  >
    {/* Verdict */}
    <VerdictCard result={result} onReset={onReset} />

    {/* Score matrix + Bias side by side on large screens */}
    <div className="grid lg:grid-cols-2 gap-5">
      <ScoreMatrix result={result} />
      <BiasIndicator biasScore={result.biasScore} biasLabel={result.biasLabel} />
    </div>

    {/* Language analysis */}
    <SuspiciousLanguage result={result} />

    {/* Claim checker */}
    <ClaimsAnalysis claims={result.keyClaims} />

    {/* Related articles */}
    <RelatedArticles articles={result.relatedArticles} citations={result.citations} />

    {/* Bottom CTA */}
    <motion.div
      className="glass rounded-2xl p-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <p className="text-slate-400 text-sm mb-4">
        Have questions about this analysis? Ask the VERIDICA AI assistant →
      </p>
      <p className="text-[11px] text-slate-600 font-mono">
        Open the chat widget (bottom-right corner) to explore further
      </p>
    </motion.div>
  </motion.div>
)

export default AnalysisResult
