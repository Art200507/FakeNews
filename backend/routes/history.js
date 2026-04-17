const express = require('express')
const router  = express.Router()

// In-memory store — swap for a DB (SQLite/MongoDB) for persistence across restarts
const history = []
const MAX_ENTRIES = 100

const stats = {
  totalAnalyses : 0,
  verdictCounts : { REAL: 0, FAKE: 0, MISLEADING: 0, UNVERIFIABLE: 0 },
  totalConfidence  : 0,
  totalCredibility : 0,
  topPropaganda    : {},
}

// Called by analyze route after a successful analysis
const recordAnalysis = (analysis, excerpt) => {
  const entry = {
    id              : Date.now().toString(),
    timestamp       : new Date().toISOString(),
    excerpt         : excerpt.slice(0, 150) + '…',
    verdict         : analysis.verdict,
    confidence      : analysis.confidence      ?? 0,
    credibilityScore: analysis.credibilityScore ?? 0,
    biasLabel       : analysis.biasLabel        ?? 'Unknown',
    summary         : analysis.summary          ?? '',
  }

  history.unshift(entry)
  if (history.length > MAX_ENTRIES) history.pop()

  // Update aggregate stats
  stats.totalAnalyses++
  stats.totalConfidence   += entry.confidence
  stats.totalCredibility  += entry.credibilityScore

  if (stats.verdictCounts[entry.verdict] !== undefined) {
    stats.verdictCounts[entry.verdict]++
  }

  // Track propaganda technique frequency
  ;(analysis.propagandaTechniques || []).forEach((t) => {
    stats.topPropaganda[t] = (stats.topPropaganda[t] || 0) + 1
  })

  return entry
}

const getStats = () => {
  const n = stats.totalAnalyses || 1
  const topPropaganda = Object.entries(stats.topPropaganda)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return {
    totalAnalyses    : stats.totalAnalyses,
    verdictCounts    : stats.verdictCounts,
    averageConfidence  : Math.round(stats.totalConfidence   / n),
    averageCredibility : Math.round(stats.totalCredibility  / n),
    topPropaganda,
    uptimeSeconds    : Math.round(process.uptime()),
  }
}

// GET /api/history
router.get('/', (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit  || 20, 10), 100)
  const offset = parseInt(req.query.offset || 0, 10)
  res.json({
    total  : history.length,
    entries: history.slice(offset, offset + limit),
  })
})

// DELETE /api/history/:id
router.delete('/:id', (req, res) => {
  const idx = history.findIndex((h) => h.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Entry not found' })
  history.splice(idx, 1)
  res.json({ success: true })
})

// DELETE /api/history  (clear all)
router.delete('/', (req, res) => {
  history.length = 0
  res.json({ success: true, message: 'History cleared' })
})

module.exports = { router, recordAnalysis, getStats }
