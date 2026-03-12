import { motion } from 'framer-motion'
import { ExternalLink, Globe, BookOpen } from 'lucide-react'

const RelatedArticles = ({ articles = [], citations = [] }) => {
  const allArticles = [
    ...articles.map((a) => ({ ...a, isCitation: false })),
    ...citations.slice(0, 3).map((url, i) => {
      let host = url
      try { host = new URL(url).hostname.replace('www.', '') } catch {}
      return { title: `Source ${i + 1}`, source: host, url, relevance: 'Referenced by Perplexity Sonar', isCitation: true }
    }),
  ].slice(0, 6)

  if (!allArticles.length) return null

  return (
    <motion.div
      className="glass rounded-2xl p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest">
          Related Articles & Sources
        </h3>
        <div className="flex items-center gap-1.5 chip-cyan text-[10px] font-mono px-2 py-1 rounded">
          <Globe className="w-3 h-3" />
          Live Search
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allArticles.map((article, i) => (
          <motion.div
            key={i}
            className="glass-light rounded-xl border border-white/5 p-4 news-card group"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-cyan-500/60 flex-shrink-0 mt-0.5" />
              {article.url ? (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400/60 hover:text-cyan-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div className="w-3.5 h-3.5" />
              )}
            </div>

            <p className="text-xs font-semibold text-white leading-snug mb-2 line-clamp-2 group-hover:text-cyan-200 transition-colors">
              {article.title}
            </p>

            <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 mb-3">
              {article.relevance}
            </p>

            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
              <span className="text-[10px] font-mono text-slate-500 truncate">
                {article.source}
              </span>
              {article.isCitation && (
                <span className="chip-cyan text-[9px] px-1.5 py-0.5 rounded ml-auto">
                  cited
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-[11px] text-slate-600 mt-4 font-mono text-center">
        Sources retrieved via Perplexity Sonar real-time web search
      </p>
    </motion.div>
  )
}

export default RelatedArticles
