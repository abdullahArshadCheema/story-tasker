# Story Tasker

Generate actionable tasks from a story/spec locally in your browser using WebLLM — no API keys, no server.

## Features
- 100% client-side LLM via WebGPU (@mlc-ai/web-llm)
- Clean UI with Tailwind CSS
- Model initialization progress indicator
- TypeScript + Zod validation

## Requirements
- Desktop browser with WebGPU (recent Chrome/Edge/Safari)

## Develop
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm start
```

## Deploy
- Vercel/Netlify recommended (no server required)
- The API route `/api/generate` is deprecated and returns 410; the app runs fully client-side.

## Usage
Open http://localhost:3000 (or the dev port shown), paste a story, and click “Generate tasks”. The first run downloads a small model; subsequent runs are faster.
