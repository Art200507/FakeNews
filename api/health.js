// Vercel Serverless Function — GET /api/health

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({
    status: 'online',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    runtime: 'Vercel Serverless',
    ai: 'Perplexity Sonar Pro',
  })
}
