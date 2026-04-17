// Relative URLs — works everywhere:
// • Local dev  → Vite proxies /api/* to Express on :5000
// • Production → Vercel serves /api/* as serverless functions (same domain, no CORS)

const post = async (path, body) => {
  const res  = await fetch(path, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

const get = async (path) => {
  const res  = await fetch(path)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const analyzeArticle  = (articleText)                           => post('/api/analyze', { article: articleText })
export const chatWithContext  = (messages, articleText, analysisResult) => post('/api/chat',   { messages, articleText, analysisResult })
export const checkHealth      = ()                                      => get('/api/health')
