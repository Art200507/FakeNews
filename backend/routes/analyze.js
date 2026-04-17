const express = require('express')
const { cacheMiddleware } = require('../middleware/cache')
const { analyzeArticle }  = require('../services/perplexity')
const { recordAnalysis }  = require('./history')

const router = express.Router()

// POST /api/analyze
router.post('/', cacheMiddleware, async (req, res) => {
  const { article } = req.body

  if (!article || typeof article !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "article" field in request body' })
  }

  if (article.trim().length < 50) {
    return res.status(400).json({ error: 'Article too short — minimum 50 characters required' })
  }

  if (article.length > 20000) {
    return res.status(400).json({ error: 'Article too long — maximum 20,000 characters' })
  }

  try {
    const result = await analyzeArticle(article)

    // Persist to history
    recordAnalysis(result, article)

    // Cache the result
    if (res.saveToCache) res.saveToCache(result)

    res.json({ ...result, cached: false })
  } catch (err) {
    console.error('[analyze] Error:', err.message)
    res.status(502).json({ error: err.message || 'AI analysis failed — please try again' })
  }
})

module.exports = router
