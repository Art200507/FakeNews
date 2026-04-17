const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions'

const callAPI = async (model, messages, options = {}) => {
  const response = await fetch(PERPLEXITY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({ model, messages, ...options }),
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Perplexity API ${response.status}: ${errText}`)
  }

  return response.json()
}

const parseJSON = (text) => {
  try { return JSON.parse(text) } catch {}

  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()) } catch {}
  }

  const start = text.indexOf('{')
  const end   = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(text.slice(start, end + 1)) } catch {}
  }

  return null
}

const ANALYSIS_SYSTEM = `You are VERIDICA, an advanced AI fact-checking system with real-time web search.
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

const analyzeArticle = async (articleText) => {
  const data = await callAPI(
    'sonar-pro',
    [
      { role: 'system', content: ANALYSIS_SYSTEM },
      { role: 'user', content: `Analyze this article:\n\n${articleText.slice(0, 5000)}` },
    ],
    { temperature: 0.1, max_tokens: 4000, return_citations: true }
  )

  const content = data.choices[0].message.content
  const parsed  = parseJSON(content)

  if (!parsed) throw new Error('Failed to parse AI response — please try again')

  return { ...parsed, citations: data.citations || [] }
}

const chatWithContext = async (messages, articleText, analysisResult) => {
  let system = `You are VERIDICA AI, an expert fact-checker. Be helpful, concise (2-4 sentences), and always cite sources.`

  if (articleText) {
    system += `\n\nAnalyzed article:\n---\n${articleText.slice(0, 2000)}\n---`
  }

  if (analysisResult) {
    system += `\n\nAnalysis: Verdict=${analysisResult.verdict} (${analysisResult.confidence}% confidence). ${analysisResult.summary}`
  }

  const data = await callAPI(
    'sonar',
    [{ role: 'system', content: system }, ...messages],
    { temperature: 0.7, max_tokens: 800, return_citations: true }
  )

  return {
    content: data.choices[0].message.content,
    citations: data.citations || [],
  }
}

module.exports = { analyzeArticle, chatWithContext }
