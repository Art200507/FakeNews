// Vercel Serverless Function — POST /api/chat

const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages, articleText, analysisResult } = req.body ?? {}

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid "messages" array' })
  }

  let system = `You are VERIDICA AI, an expert fact-checker and media literacy analyst. Be helpful, concise (2-4 sentences unless asked for more), and cite sources whenever possible.`

  if (articleText) {
    system += `\n\nThe user has analyzed this article:\n---\n${articleText.slice(0, 2000)}\n---`
  }
  if (analysisResult) {
    system += `\n\nVERIDICA verdict: ${analysisResult.verdict} (${analysisResult.confidence}% confidence). ${analysisResult.summary}`
  }

  try {
    const response = await fetch(PERPLEXITY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'system', content: system }, ...messages],
        temperature: 0.7,
        max_tokens: 800,
        return_citations: true,
      }),
    })

    if (!response.ok) {
      return res.status(502).json({ error: 'Chat service failed' })
    }

    const data = await response.json()
    return res.status(200).json({
      content: data.choices[0].message.content,
      citations: data.citations || [],
    })
  } catch (err) {
    console.error('[chat]', err.message)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
