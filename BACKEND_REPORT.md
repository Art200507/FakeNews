# VERIDICA — Backend Technical Report

## Overview

The VERIDICA backend is a **Node.js + Express** REST API server that sits between the React frontend and the Perplexity AI API. It adds security, caching, rate limiting, persistent history tracking, and real-time stats — things the frontend alone cannot do.

---

## Architecture

```
Browser (React)
      │
      │  HTTP requests (fetch)
      ▼
┌─────────────────────────────────────────────┐
│           VERIDICA Backend (Express)         │
│                                             │
│  ┌──────────┐  ┌────────┐  ┌───────────┐   │
│  │ /analyze │  │ /chat  │  │ /history  │   │
│  └──────────┘  └────────┘  └───────────┘   │
│       │              │                      │
│  ┌────▼──────────────▼──────────────────┐   │
│  │         Middleware Layer              │   │
│  │  Rate Limiter · Cache · CORS · Auth  │   │
│  └───────────────────────────────────────┘  │
│       │                                     │
│  ┌────▼────────────────────────────────┐    │
│  │      Perplexity Service Layer       │    │
│  │  analyzeArticle() · chatWithCtx()   │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
      │
      │  Secure HTTPS (API key never leaves server)
      ▼
Perplexity AI API (sonar-pro / sonar)
```

---

## Folder Structure

```
backend/
├── server.js              ← Entry point, Express app setup
├── package.json           ← Dependencies
├── .env                   ← Secrets (gitignored)
├── .env.example           ← Template for setup
│
├── routes/
│   ├── analyze.js         ← POST /api/analyze
│   ├── chat.js            ← POST /api/chat
│   └── history.js         ← GET/DELETE /api/history
│
├── services/
│   └── perplexity.js      ← All Perplexity API calls (server-side)
│
└── middleware/
    └── cache.js           ← In-memory response caching
```

---

## API Endpoints

### `POST /api/analyze`
Analyzes an article for fake news.

**Request:**
```json
{
  "article": "Full article text here..."
}
```

**Response:**
```json
{
  "verdict": "FAKE",
  "confidence": 94,
  "credibilityScore": 12,
  "biasScore": 22,
  "biasLabel": "Center-Right",
  "emotionalManipulation": 87,
  "factualAccuracy": 8,
  "sourceReliability": 15,
  "clickbaitScore": 91,
  "socialMediaRisk": 95,
  "keyClaims": [...],
  "redFlags": [...],
  "propagandaTechniques": [...],
  "relatedArticles": [...],
  "cached": false
}
```

**Validation:**
- Article must be a string, min 50 chars, max 20,000 chars
- Returns `400` for invalid input
- Returns `502` if Perplexity API fails

---

### `POST /api/chat`
Context-aware AI chatbot. Knows the analyzed article.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Why is this fake?" }
  ],
  "articleText": "Original article text...",
  "analysisResult": { "verdict": "FAKE", "confidence": 94, ... }
}
```

**Response:**
```json
{
  "content": "The article is fake because...",
  "citations": ["https://source1.com", "https://source2.com"]
}
```

**Limits:** Max 40 messages per conversation

---

### `GET /api/history`
Returns past analyses (server-side, persists across browser sessions).

**Query params:** `?limit=20&offset=0`

**Response:**
```json
{
  "total": 7,
  "entries": [
    {
      "id": "1710000000000",
      "timestamp": "2026-04-16T12:00:00.000Z",
      "excerpt": "Scientists discover unlimited free energy...",
      "verdict": "FAKE",
      "confidence": 94,
      "credibilityScore": 12,
      "biasLabel": "Center-Right",
      "summary": "This article contains numerous false claims..."
    }
  ]
}
```

---

### `DELETE /api/history/:id`
Delete a specific history entry.

### `DELETE /api/history`
Clear all history.

---

### `GET /api/health`
Server health check.

```json
{
  "status": "online",
  "version": "1.0.0",
  "timestamp": "2026-04-16T12:00:00.000Z",
  "uptime": "3600s",
  "ai": "Perplexity Sonar Pro"
}
```

---

### `GET /api/stats`
Live usage statistics dashboard.

```json
{
  "analysis": {
    "totalAnalyses": 42,
    "verdictCounts": { "REAL": 10, "FAKE": 25, "MISLEADING": 5, "UNVERIFIABLE": 2 },
    "averageConfidence": 78,
    "averageCredibility": 34,
    "topPropaganda": [
      { "name": "Fear Appeal", "count": 18 },
      { "name": "Bandwagon",   "count": 12 }
    ]
  },
  "cache": {
    "hits": 8,
    "misses": 34,
    "hitRate": 19,
    "keys": 34
  },
  "server": {
    "uptime": "3600s",
    "memory": "48 MB",
    "node": "v20.11.0"
  }
}
```

---

## Middleware

### 1. CORS
Only allows requests from the configured frontend origin. Prevents other websites from using the API.

```
Allowed: http://localhost:3000 (dev)
Allowed: https://fake-news.vercel.app (production)
Blocked: Everything else
```

### 2. Rate Limiting

| Endpoint   | Limit              | Why |
|------------|--------------------|-----|
| `/analyze` | 10 req/min per IP  | Expensive AI call — protects API credits |
| `/chat`    | 30 req/min per IP  | Lighter, but still throttled |

Returns `429 Too Many Requests` when exceeded.

### 3. In-Memory Cache
Identical articles return cached results instantly — no API credit used.

- **Cache TTL:** 1 hour
- **Key:** Base64 hash of article content (first 200 + last 100 chars + length)
- **Hit rate** tracked in `/api/stats`
- Cached responses include `"cached": true` field

### 4. Request Validation
Every endpoint validates:
- Required fields present
- Correct data types
- Length limits enforced
- Returns descriptive `400` errors

---

## Security

| Concern | Solution |
|---------|----------|
| API key exposure | Key stored in `backend/.env`, never sent to browser |
| Abuse / spam | Rate limiting per IP |
| Cross-origin attacks | Strict CORS whitelist |
| Oversized payloads | Body parser limit: 2MB |
| Error leaking | Generic 500 messages in production |

---

## Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.19 | HTTP server and routing |
| `cors` | ^2.8 | Cross-origin request handling |
| `express-rate-limit` | ^7.2 | IP-based rate limiting |
| `node-cache` | ^5.1 | In-memory TTL cache |
| `dotenv` | ^16.4 | Environment variable loading |
| `nodemon` | ^3.1 | Auto-restart in development |

Node.js built-in `fetch` (v18+) used for Perplexity API calls — no extra HTTP library needed.

---

## Running Locally

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Copy env file and add your key
cp .env.example .env

# 4. Start development server (auto-restarts on changes)
npm run dev

# 5. Verify it's running
curl http://localhost:5000/api/health
```

Backend runs on **port 5000**.
Frontend runs on **port 3000**.
They communicate automatically.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PERPLEXITY_API_KEY` | Yes | — | Your Perplexity API key |
| `PORT` | No | 5000 | Server port |
| `FRONTEND_URL` | No | http://localhost:3000 | Allowed CORS origin |

### Frontend (`.env`)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | http://localhost:5000 | Backend URL |

---

## Deployment

### Deploy Backend to Render (Free)
1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect `Art200507/FakeNews` repo
4. Set Root Directory: `backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables:
   - `PERPLEXITY_API_KEY` = your key
   - `FRONTEND_URL` = your Vercel frontend URL

### Update Frontend on Vercel
Add environment variable:
- `VITE_API_URL` = your Render backend URL (e.g. `https://veridica-api.onrender.com`)

---

## What the Backend Adds vs Frontend-Only

| Feature | Frontend Only | With Backend |
|---------|--------------|--------------|
| API key security | Exposed in browser | Safe on server |
| Rate limiting | None | 10 req/min per IP |
| Caching | None | 1-hour cache, saves API credits |
| History | Lost on refresh | Persists across sessions |
| Usage stats | None | Full analytics dashboard |
| Input validation | Basic | Server-enforced, strict |
| Error handling | Generic | Descriptive, structured |

---

*VERIDICA Backend — Built with Node.js + Express*
