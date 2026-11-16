// Vercel Serverless Function — POST /api/analyze
// API key stays here on the server, never reaches the browser

const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions'

const SYSTEM_PROMPT = `You are VERIDICA, an advanced AI fact-checking system with real-time web search.
Analyze the given article with extreme precision.

CRITICAL: Respond with ONLY a raw valid JSON object. No markdown, no text before or after.

{
  "verdict": "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIABLE",
  "confidence": <0-100>,
  "summary": "<2-3 sentence explanation>",
  "credibilityScore": <0-100>,
  "biasScore": <-100 to 100>,
  "biasLabel": "<Far Left|Left|Center-Left|Center|Center-Right|Right|Far Right>",
  "emotionalManipulation": <0-100>,
  "factualAccuracy": <0-100>,
  "sourceReliability": <0-100>,
  "clickbaitScore": <0-100>,
  "socialMediaRisk": <0-100>,
  "keyClaims": [{"claim":"","status":"VERIFIED|FALSE|MISLEADING|UNVERIFIED","explanation":""}],
  "redFlags": [""],
  "positiveIndicators": [""],
  "suspiciousWords": [""],
  "propagandaTechniques": [""],
  "relatedArticles": [{"title":"","source":"","url":"","relevance":""}],
  "readabilityLevel": "<Elementary|Middle School|High School|College|Academic>",
  "toneDescription": "<description>",
  "writingStyleRisk": "<low|medium|high>"
}`

const parseJSON = (text) => {
  try { return JSON.parse(text) } catch {}
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) { try { return JSON.parse(fence[1].trim()) } catch {} }
  const s = text.indexOf('{'), e = text.lastIndexOf('}')
  if (s !== -1 && e !== -1) { try { return JSON.parse(text.slice(s, e + 1)) } catch {} }
  return null
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Expected a JSON object' })
  }

  const { article } = req.body ?? {}

  if (!article || typeof article !== 'string') {
    return res.status(400).json({ error: 'Missing "article" field' })
  }
  if (article.trim().length < 50) {
    return res.status(400).json({ error: 'Article too short — minimum 50 characters' })
  }
  if (article.length > 20000) {
    return res.status(400).json({ error: 'Article too long — maximum 20,000 characters' })
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
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Analyze this article:\n\n${article.slice(0, 5000)}` },
        ],
        temperature: 0.1,
        max_tokens: 4000,
        return_citations: true,
      }),
    })

    if (!response.ok) {
      return res.status(502).json({ error: `AI service error (${response.status})` })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (typeof content !== 'string') return res.status(502).json({ error: 'Empty AI response' })
    const parsed = parseJSON(content)

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !['REAL','FAKE','MISLEADING','UNVERIFIABLE'].includes(parsed.verdict) || typeof parsed.summary !== 'string') return res.status(502).json({ error: 'Failed to parse AI response — please try again' })

    return res.status(200).json({ ...parsed, citations: data.citations || [], cached: false })
  } catch (err) {

    return res.status(err.name === 'TimeoutError' ? 504 : 502).json({ error: 'AI service unavailable. Please try again.' })
  }
}
