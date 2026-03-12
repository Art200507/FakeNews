const API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY
const API_URL = 'https://api.perplexity.ai/chat/completions'

const callAPI = async (model, messages, options = {}) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ model, messages, ...options }),
  })
  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Perplexity API ${response.status}: ${err}`)
  }
  return response.json()
}

const ANALYSIS_SYSTEM = `You are VERIDICA, an advanced AI fact-checking system with real-time web search capabilities.
Analyze the given article or news text with extreme precision.

CRITICAL INSTRUCTION: Respond with ONLY a raw, valid JSON object. No markdown fences, no commentary before or after. Pure JSON.

Required structure:
{
  "verdict": "REAL" | "FAKE" | "MISLEADING" | "UNVERIFIABLE",
  "confidence": <integer 0-100>,
  "summary": "<2-3 sentence verdict explanation>",
  "credibilityScore": <integer 0-100>,
  "biasScore": <integer -100 to 100, negative=left, positive=right>,
  "biasLabel": "<Far Left|Left|Center-Left|Center|Center-Right|Right|Far Right>",
  "emotionalManipulation": <integer 0-100>,
  "factualAccuracy": <integer 0-100>,
  "sourceReliability": <integer 0-100>,
  "clickbaitScore": <integer 0-100>,
  "socialMediaRisk": <integer 0-100, likelihood of viral spread as misinfo>,
  "keyClaims": [
    {"claim": "<specific verifiable claim>", "status": "<VERIFIED|FALSE|MISLEADING|UNVERIFIED>", "explanation": "<why>"}
  ],
  "redFlags": ["<specific red flag>"],
  "positiveIndicators": ["<positive credibility indicator>"],
  "suspiciousWords": ["<emotionally charged or manipulative word/phrase>"],
  "propagandaTechniques": ["<technique name: e.g. Fear Appeal, Bandwagon, Ad Hominem, False Dichotomy>"],
  "relatedArticles": [
    {"title": "<title>", "source": "<publisher>", "url": "<url or empty string>", "relevance": "<one sentence>"}
  ],
  "readabilityLevel": "<Elementary|Middle School|High School|College|Academic>",
  "toneDescription": "<brief tone description>",
  "writingStyleRisk": "<low|medium|high>"
}`

const parseJSON = (text) => {
  // Method 1: direct parse
  try { return JSON.parse(text) } catch {}

  // Method 2: strip markdown fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()) } catch {}
  }

  // Method 3: extract first complete JSON object
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(text.slice(start, end + 1)) } catch {}
  }

  return null
}

export const analyzeArticle = async (articleText) => {
  const data = await callAPI(
    'sonar-pro',
    [
      { role: 'system', content: ANALYSIS_SYSTEM },
      {
        role: 'user',
        content: `Analyze this article for fake news and misinformation:\n\n${articleText.slice(0, 5000)}`,
      },
    ],
    { temperature: 0.1, max_tokens: 4000, return_citations: true }
  )

  const content = data.choices[0].message.content
  const parsed = parseJSON(content)

  if (!parsed) {
    throw new Error('Failed to parse AI analysis response. Please try again.')
  }

  return {
    ...parsed,
    citations: data.citations || [],
  }
}

export const chatWithContext = async (messages, articleText, analysisResult) => {
  let system = `You are VERIDICA, an expert AI fact-checker and media literacy analyst. Be helpful, accurate, and educational. Cite sources whenever possible. Keep responses concise (2-4 sentences unless asked for detail).`

  if (articleText) {
    system += `\n\nThe user has analyzed this article:\n---\n${articleText.slice(0, 2000)}\n---`
  }

  if (analysisResult) {
    system += `\n\nVERIDICA analysis: Verdict=${analysisResult.verdict} (${analysisResult.confidence}% confidence). Credibility=${analysisResult.credibilityScore}/100. ${analysisResult.summary}`
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
