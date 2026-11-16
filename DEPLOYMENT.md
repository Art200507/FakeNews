# Vercel deployment

Use the repository root with the Vite preset. Configure `PERPLEXITY_API_KEY` as a server-only secret; never use a `VITE_` prefix for provider secrets. `/api/health` returns 503 until configured. Set a provider spending limit and a Vercel Firewall rate limit for `/api/analyze` and `/api/chat` before opening a public paid endpoint. These endpoints intentionally do not require a user account.

Run `npm ci --ignore-scripts`, `npm run build`, and `node --test tests/api.test.js`. Provider-independent tests cover malformed input, missing credentials, invalid provider output, and timeouts. A real analysis and follow-up chat still require deployment credentials and verification.
