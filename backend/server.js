require('dotenv').config()
const express    = require('express')
const cors       = require('cors')
const rateLimit  = require('express-rate-limit')

const analyzeRouter           = require('./routes/analyze')
const chatRouter              = require('./routes/chat')
const { router: historyRouter, getStats } = require('./routes/history')
const { getCacheStats }       = require('./middleware/cache')

const app  = express()
const PORT = process.env.PORT || 5000

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://fake-news.vercel.app',  // update to your actual Vercel URL
]

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (e.g., curl, Postman, mobile)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
}))

// ── Body parser ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))

// ── Rate limiting ─────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs : 60 * 1000,  // 1 minute window
  max      : 10,          // 10 requests per IP per minute
  standardHeaders: true,
  legacyHeaders  : false,
  message: { error: 'Too many requests — please wait a minute before trying again.' },
})

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max     : 30,           // chat is cheaper, allow more
  message : { error: 'Chat rate limit reached — please slow down.' },
})

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/analyze', apiLimiter,  analyzeRouter)
app.use('/api/chat',    chatLimiter, chatRouter)
app.use('/api/history', historyRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status   : 'online',
    version  : '1.0.0',
    timestamp: new Date().toISOString(),
    uptime   : `${Math.round(process.uptime())}s`,
    ai       : 'Perplexity Sonar Pro',
  })
})

// Stats dashboard
app.get('/api/stats', (req, res) => {
  res.json({
    analysis: getStats(),
    cache   : getCacheStats(),
    server  : {
      uptime : `${Math.round(process.uptime())}s`,
      memory : `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      node   : process.version,
    },
  })
})

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🛡️  VERIDICA Backend`)
  console.log(`   Running  → http://localhost:${PORT}`)
  console.log(`   Health   → http://localhost:${PORT}/api/health`)
  console.log(`   Stats    → http://localhost:${PORT}/api/stats`)
  console.log(`   AI model → Perplexity Sonar Pro\n`)
})
