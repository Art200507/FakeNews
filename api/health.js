export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const configured = Boolean(process.env.PERPLEXITY_API_KEY)
  return res.status(configured ? 200 : 503).json({ status: configured ? 'ready' : 'configuration_required' })
}
