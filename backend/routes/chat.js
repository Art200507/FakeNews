const express = require('express')
const { chatWithContext } = require('../services/perplexity')

const router = express.Router()

// POST /api/chat
router.post('/', async (req, res) => {
  const { messages, articleText, analysisResult } = req.body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid "messages" array' })
  }

  // Validate message structure
  const valid = messages.every(
    (m) => m.role && m.content && ['user', 'assistant'].includes(m.role)
  )
  if (!valid) {
    return res.status(400).json({ error: 'Each message must have a role (user/assistant) and content' })
  }

  if (messages.length > 40) {
    return res.status(400).json({ error: 'Conversation too long — maximum 40 messages' })
  }

  try {
    const result = await chatWithContext(messages, articleText, analysisResult)
    res.json(result)
  } catch (err) {
    console.error('[chat] Error:', err.message)
    res.status(502).json({ error: err.message || 'Chat request failed — please try again' })
  }
})

module.exports = router
