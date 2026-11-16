// Vercel Serverless Function — POST /api/chat

const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Expected a JSON object' })
  }

  const { messages, articleText, analysisResult } = req.body ?? {}

  if (!Array.isArray(messages) || !messages.length || messages.length > 20 ||
      messages.some(m => !m || !['user', 'assistant'].includes(m.role) ||
        typeof m.content !== 'string' || !m.content.trim() || m.content.length > 4000) ||
      messages.reduce((n, m) => n + m.content.length, 0) > 16000 ||
      (articleText != null && (typeof articleText !== 'string' || articleText.length > 20000)) ||
      (analysisResult != null && (typeof analysisResult !== 'object' || Array.isArray(analysisResult) ||
        typeof analysisResult.summary !== 'string' || analysisResult.summary.length > 4000 ||
        !['REAL', 'FAKE', 'MISLEADING', 'UNVERIFIABLE'].includes(analysisResult.verdict) ||
        !Number.isFinite(analysisResult.confidence) || analysisResult.confidence < 0 || analysisResult.confidence > 100))) {
    return res.status(400).json({ error: 'Invalid chat context or messages' })
  }

  let system = `You are VERIDICA AI, an expert fact-checker and media literacy analyst. Be helpful, concise (2-4 sentences unless asked for more), and cite sources whenever possible.`

  if (articleText) {
    system += `\n\nThe user has analyzed this article:\n---\n${articleText.slice(0, 2000)}\n---`
  }
  if (analysisResult) {
    system += `\n\nVERIDICA verdict: ${analysisResult.verdict} (${analysisResult.confidence}% confidence). ${analysisResult.summary}`
  }

  if (!process.env.PERPLEXITY_API_KEY) {
    return res.status(503).json({ error: 'AI analysis is not configured yet. Please try again later.' })
  }
  try {
    const response = await fetch(PERPLEXITY_URL, {
      method: 'POST',
      signal: AbortSignal.timeout(25000),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'system', content: system }, ...messages.map(({role, content}) => ({role, content}))],
        temperature: 0.7,
        max_tokens: 800,
        return_citations: true,
      }),
    })

    if (!response.ok) {
      return res.status(502).json({ error: 'Chat service failed' })
    }

    const data = await response.json()
    if (typeof data.choices?.[0]?.message?.content !== 'string') return res.status(502).json({error: 'Empty AI response'})
    return res.status(200).json({
      content: data.choices?.[0]?.message?.content,
      citations: data.citations || [],
    })
  } catch (err) {

    return res.status(err.name === 'TimeoutError' ? 504 : 502).json({ error: 'AI service unavailable. Please try again.' })
  }
}
