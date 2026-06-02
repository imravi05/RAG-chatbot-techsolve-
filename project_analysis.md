# TechSolve RAG Chatbot — Project Analysis

## What This Project Is

A **RAG (Retrieval-Augmented Generation) chatbot** called **TechSolve** that:

1. Accepts a **YouTube URL** and an **Instagram URL** as input
2. Downloads audio from both videos using `yt-dlp`
3. Transcribes audio via **AssemblyAI** (speech-to-text)
4. Chunks the transcripts using **LangChain's RecursiveCharacterTextSplitter**
5. Generates **vector embeddings** using **Google Gemini** (`gemini-embedding-001`)
6. Stores vectors in **Pinecone** vector database (index: `video-rag`)
7. *(Intended)* Allows users to **query/chat** about the video content using RAG

---

## Architecture Overview

```
User Input (YouTube URL + Instagram URL)
        ↓
  [POST /api/v1/videos/analyze]
        ↓
  ┌─────────────────────────────────────────────┐
  │              video.controller.js             │
  │                                             │
  │  getYoutubeMetadata()  getInstagramMetadata()│ ← yt-dlp CLI
  │  calculateEngagementRate() × 2              │
  │  getTranscript() × 2                        │ ← yt-dlp + AssemblyAI
  │  chunkTranscript() × 2                      │ ← LangChain splitter
  │  storeChunks() × 2                          │ ← Gemini embed → Pinecone
  └─────────────────────────────────────────────┘
        ↓
  Returns: metadata + transcripts (JSON)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM modules) |
| Server | Express v5 |
| Video Metadata | `yt-dlp` CLI (via child_process / yt-dlp-wrap) |
| Transcription | AssemblyAI SDK |
| Text Chunking | LangChain `@langchain/textsplitters` |
| Embeddings | Google Gemini (`gemini-embedding-001`) |
| Vector DB | Pinecone (`video-rag` index) |
| AI/LLM (installed but unused) | `@google/genai`, `langchain`, `@langchain/openai` |
| Alt Vector DB (installed but unused) | Qdrant (`@qdrant/js-client-rest`) |
| Instagram Scraping (disabled) | Apify (`apify-client`) — API key commented out |
| Dev | Nodemon |

---

## Current State — What Works

- ✅ Express server boots on port 5000
- ✅ YouTube metadata fetching (`yt-dlp --dump-json`)
- ✅ Instagram metadata fetching (same approach — may fail for private/auth-required reels)
- ✅ Engagement rate calculation `((likes + comments) / views) * 100`
- ✅ Audio download pipeline (`yt-dlp` → `downloads/` folder)
- ✅ Audio transcription via AssemblyAI
- ✅ Transcript chunking (500 chars, 100 overlap)
- ✅ Embedding generation (Gemini)
- ✅ Pinecone vector upsert

---

## What Is MISSING / Needs To Be Done

### 🔴 Critical — Core RAG Query (Not Built At All)
The entire **RAG query / chat interface** is missing. Right now, data is ingested into Pinecone but there is **no endpoint to query it**.

- **Need:** `POST /api/v1/chat` or `GET /api/v1/query` endpoint
- **Flow:**
  1. Accept user question
  2. Embed the question using Gemini
  3. Semantic search in Pinecone (top-k similar chunks)
  4. Pass retrieved context + question to Gemini LLM
  5. Return AI-generated answer grounded in the video transcripts

### 🔴 Critical — Frontend Is Empty
The `frontend/` directory is **completely empty**. The chatbot UI needs to be built from scratch.

- **Need:** A full chat interface where users can:
  - Input YouTube + Instagram URLs
  - Trigger analysis/ingestion
  - Ask questions and receive RAG answers in a chat format
  - See video metadata and engagement stats side by side

### 🟠 High — Instagram Metadata Reliability
- `yt-dlp` works for public Instagram Reels but **fails for private posts** and has **rate limits**
- The `apify-client` (a dedicated Instagram scraper) is installed but the API key is **commented out**
- **Need:** Decide on strategy — use Apify for reliable Instagram data or stick with yt-dlp

### 🟠 High — No Chat/Session Context
- Currently videos are chunked with generic IDs `"A"` (YouTube) and `"B"` (Instagram)
- There's no **session/namespace management** in Pinecone — re-analyzing a new video will pollute/overwrite existing vectors
- **Need:** Pinecone namespaces based on video ID or session ID

### 🟡 Medium — Duplicate/Leftover Service Files
- `transcrption.service.js` (typo) is an older, unused version of `transcript.service.js`
- **Need:** Delete or consolidate

### 🟡 Medium — No Error Recovery / Re-use Cached Transcripts
- Every API call downloads audio and re-transcribes even if already done
- Downloaded files in `downloads/` persist but are never checked before re-downloading
- **Need:** Check if file already exists before downloading/transcribing

### 🟡 Medium — Security Issues
- **API keys hardcoded** in `.env` AND in source code (`assemblyai.service.js` line 6)
- `.env` is committed to Git (should be in `.gitignore`)
- **Need:** Ensure `.env` is gitignored and remove hardcoded fallback keys

### 🟡 Medium — CORS Not Configured
- `cors` is imported but called with no config: `app.use(cors())` — allows ALL origins
- **Need:** Restrict to frontend origin in production

### 🟢 Low — Missing RAG Context in Responses
- The `analyzeVideos` response returns raw metadata and transcript but **no AI-generated insights**
- Could add a summary or comparison insight at ingestion time using Gemini

---

## Recommended Completion Roadmap

### Phase 1 — RAG Query Backend (Core)
1. Create `services/rag.service.js` — embed query → Pinecone search → Gemini LLM answer
2. Create `controllers/chat.controller.js`
3. Add `POST /api/v1/chat` route

### Phase 2 — Frontend UI
1. Initialize with Vite + React (or plain HTML/CSS/JS)
2. Build a premium chat UI with:
   - URL input panel (YouTube + Instagram)
   - Analyze button with loading state
   - Metadata/engagement stats display
   - Chat interface for Q&A

### Phase 3 — Polish & Reliability
1. Add Pinecone namespacing per session/video
2. Add file caching to skip re-download/re-transcribe
3. Clean up duplicate service files
4. Fix security — remove hardcoded keys
5. Add proper CORS config

---

> [!IMPORTANT]
> The biggest gap is the **chat/query endpoint** — without it, the RAG pipeline is ingestion-only and users have no way to actually ask questions. This should be the first thing built.

> [!WARNING]
> API keys are exposed in source code and `.env` may be tracked by Git. Rotate keys before pushing to any public repository.
