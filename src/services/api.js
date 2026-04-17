// All API calls go through our backend (API key is safe server-side)
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const post = async (path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

const get = async (path) => {
  const res  = await fetch(`${BASE}${path}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const analyzeArticle    = (articleText)                          => post('/api/analyze', { article: articleText })
export const chatWithContext   = (messages, articleText, analysisResult) => post('/api/chat',    { messages, articleText, analysisResult })
export const getHistory        = (limit = 20, offset = 0)               => get(`/api/history?limit=${limit}&offset=${offset}`)
export const getStats          = ()                                      => get('/api/stats')
export const checkHealth       = ()                                      => get('/api/health')
