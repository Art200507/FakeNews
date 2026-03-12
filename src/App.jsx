import { useState, useCallback } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'

import Background from './components/Background'
import Header from './components/Header'
import ArticleInput from './components/ArticleInput'
import LoadingAnimation from './components/LoadingAnimation'
import AnalysisResult from './components/AnalysisResult'
import ChatBot from './components/ChatBot'
import HistoryPanel from './components/HistoryPanel'
import { analyzeArticle } from './services/perplexity'

export default function App() {
  const [article, setArticle] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [analyzedArticle, setAnalyzedArticle] = useState('')
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const handleAnalyze = useCallback(async () => {
    const text = article.trim()
    if (text.length < 50) {
      toast.error('Please paste a complete article (minimum 50 characters)')
      return
    }

    setIsAnalyzing(true)
    setResult(null)

    try {
      const analysis = await analyzeArticle(text)
      setResult(analysis)
      setAnalyzedArticle(text)

      // Push to history (last 10)
      setHistory((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          excerpt: text.slice(0, 120) + '…',
          verdict: analysis.verdict,
          confidence: analysis.confidence,
          credibilityScore: analysis.credibilityScore,
        },
        ...prev.slice(0, 9),
      ])

      toast.success('Analysis complete!', { icon: '🛡️' })
    } catch (err) {
      console.error(err)
      toast.error(err.message?.slice(0, 80) || 'Analysis failed — please try again')
    } finally {
      setIsAnalyzing(false)
    }
  }, [article])

  const handleReset = () => {
    setResult(null)
    setAnalyzedArticle('')
    setArticle('')
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 relative overflow-x-hidden">
      <Background />

      <div className="relative z-10 min-h-screen flex flex-col">
        <Header
          onHistoryClick={() => setShowHistory((s) => !s)}
          historyCount={history.length}
        />

        <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
          <AnimatePresence mode="wait">
            {!result && !isAnalyzing && (
              <ArticleInput
                key="input"
                article={article}
                setArticle={setArticle}
                onAnalyze={handleAnalyze}
              />
            )}

            {isAnalyzing && <LoadingAnimation key="loading" />}

            {result && !isAnalyzing && (
              <AnalysisResult
                key="result"
                result={result}
                articleText={analyzedArticle}
                onReset={handleReset}
              />
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="text-center py-4 text-[11px] text-slate-700 font-mono border-t border-white/5">
          VERIDICA · AI Fake News Detector · Powered by Perplexity Sonar Pro
        </footer>
      </div>

      {/* Floating chatbot */}
      <ChatBot articleContext={analyzedArticle} analysisResult={result} />

      {/* History panel */}
      {showHistory && (
        <HistoryPanel
          history={history}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f1f5f9',
            border: '1px solid rgba(99,102,241,0.25)',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
          },
          duration: 3000,
        }}
      />
    </div>
  )
}
