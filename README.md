# EmergiAI

A multilingual emergency guidance web app. Describe a medical emergency by typing or speaking, and get a severity rating, immediate steps, local advice for Pakistan, and nearby hospitals.

**Live demo:** https://emergi-ai-delta.vercel.app

> Not a substitute for professional care. In Pakistan, call 1122.

## Features
- AI triage with a severity level (LOW, MEDIUM or CRITICAL), step-by-step actions and next steps
- Responses in the user's chosen language, including Urdu and Pashto
- Voice input, transcribed with Groq Whisper (`whisper-large-v3`)
- Top 3 nearby hospitals with distance and Google Maps directions
- Fallback guidance if the AI service is unavailable
- Light and dark theme

## Tech stack
- **Frontend:** Next.js, TypeScript
- **Backend:** FastAPI, Python, httpx
- **AI:** OpenRouter (LLM triage), Groq (speech-to-text)
- **Maps:** Google Maps Places and Distance Matrix APIs
- **Hosting:** Vercel

## How it works
1. The user describes symptoms by text or voice (`POST /transcribe` for audio).
2. `POST /analyze` sends the situation and language to an LLM with a strict JSON-only prompt.
3. The backend validates the JSON, falls back to safe default guidance if it's invalid, and adds nearby hospitals when location is shared.
4. The frontend shows the result and a hospital map.

## Run locally
```bash
# Backend
cd backend
pip install -r requirements.txt
# .env: OPENROUTER_API_KEY, GROQ_API_KEY, GOOGLE_MAPS_API_KEY
uvicorn main:app --reload --port 8000

# Frontend (repo root, new terminal)
npm install
npm run dev
```
