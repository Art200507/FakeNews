const NodeCache = require('node-cache')

// Cache for 1 hour, check every 2 minutes
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 })

let hits = 0
let misses = 0

// Generate a stable cache key from article text
const generateKey = (text) => {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ')
  const sample = normalized.slice(0, 200) + '|' + normalized.slice(-100) + '|' + normalized.length
  return Buffer.from(sample).toString('base64').slice(0, 80)
}

const cacheMiddleware = (req, res, next) => {
  if (req.method !== 'POST') return next()

  const articleText = req.body?.article
  if (!articleText) return next()

  const key = generateKey(articleText)
  const cached = cache.get(key)

  if (cached) {
    hits++
    return res.json({ ...cached, cached: true, cacheAge: cache.getTtl(key) })
  }

  misses++
  req.cacheKey = key

  // Attach helper so route can save to cache
  res.saveToCache = (data) => {
    cache.set(key, data)
  }

  next()
}

const getCacheStats = () => ({
  hits,
  misses,
  total: hits + misses,
  hitRate: hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0,
  keys: cache.keys().length,
})

module.exports = { cacheMiddleware, getCacheStats }
