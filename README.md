# AI Presentation Generator

A small, controlled presentation-generation engine that turns a simple natural-language prompt into a structured, usable slide deck, even when using low-cost/free AI models.

> **Core idea:** The application — not the AI — controls the presentation system. The AI provides only content; the app controls structure, validation, visual design, and rendering.

---

## Demo

Type a prompt like:

```text
Create 10 detailed slides about Cybersecurity for university students
```

Get back a structured slide deck with title, subtitle, and content slides — all rendered in a clean 16:9 template.

---

## Architecture

```text
User Prompt
    ↓
Intent Parser
    ↓
Prompt Builder (system rules + examples + user request)
    ↓
AI Model (OpenRouter free models)
    ↓
JSON Output Parser
    ↓
Zod Schema Validation
    ↓
Presentation Rules Validation
    ↓
HTML/CSS Renderer
    ↓
16:9 Slide Preview + PDF Export
```

### Separation of Concerns

| Component | Responsibility |
|-----------|---------------|
| **AI** | Content only |
| **Schema** | Structure |
| **Validator** | Validity |
| **Template** | Visual design |
| **Renderer** | HTML/CSS |
| **Retry System** | Failure handling |

The AI never controls layout, CSS, or HTML.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS, Vanilla JavaScript |
| PWA | Web App Manifest, Service Worker, Install to Desktop & Mobile |
| Backend | Node.js, Express |
| Validation | Zod |
| AI Provider | OpenRouter |
| Models | NVIDIA Nemotron, Poolside Laguna, InclusionAI Ling, Google Gemma, OpenAI GPT-OSS |

**No React. No Next.js. No TypeScript. No build tools.**

The frontend is intentionally vanilla so team members who know only HTML/CSS/JS can present it.

---

## Project Structure

```
ai-slide-generator/
│
├── frontend/              # Team presents (HTML/CSS/JS only + PWA)
│   ├── index.html         # Main app markup & PWA install entry
│   ├── manifest.json      # PWA Web App Manifest
│   ├── sw.js              # Service Worker (offline cache & fast load)
│   ├── style.css          # Design system & responsive layout
│   ├── icons/             # App icons (PWA & slide templates)
│   ├── js/
│   │   ├── app.js         # Main orchestration, API calls
│   │   ├── pwa.js         # PWA installer (desktop/mobile/iOS)
│   │   ├── renderer.js    # JSON to HTML slides
│   │   └── navigation.js  # Slide navigation
│   └── README.md
│
└── backend/               # Node.js + Express
    ├── server.js
    ├── routes/
    │   └── generate.js    # POST /api/generate
    ├── schema/
    │   └── presentation.js # Zod schema
    ├── validation/
    │   └── rules.js        # Presentation rules
    ├── prompt/
    │   ├── parser.js       # User intent extraction
    │   ├── system.js       # Base AI instructions
    │   └── builder.js      # Dynamic prompt assembly
    ├── ai/
    │   ├── models.js       # Model configuration
    │   └── openrouter.js   # OpenRouter integration
    ├── generator.js        # Main pipeline
    ├── retry.js            # Retry + fallback logic
    ├── middleware/
    │   └── request-guard.js # Rate limiting
    ├── test/               # Test suite
    │   ├── unit/
    │   ├── integration/
    │   └── live/
    └── .env.local          # API key
```

---

## Features

- ✅ Natural-language prompt to structured slides
- ✅ Controlled generation — AI provides content, app controls everything else
- ✅ Intent parsing — extracts slide count, topics, audience, tone, style
- ✅ Dynamic prompt engineering with few-shot examples
- ✅ Flexible schema validation (3-15 slides, 2-7 points)
- ✅ Two-level validation: Zod schema + presentation rules
- ✅ Multi-model fallback chain for reliability
- ✅ Malformed output repair
- ✅ Rate limit handling
- ✅ Clean 16:9 slide template
- ✅ Slide navigation with keyboard support
- ✅ Browser print-to-PDF export
- ✅ Displays the model used to generate slides

---

## Getting Started

### 1. Clone and enter project

```bash
cd ai-slide-generator
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `.env.local`:

```env
OPENROUTER_API_KEY=your_key_here
PORT=3001
```

Start server:

```bash
npm start
```

### 3. Frontend setup

Open `frontend/index.html` in a browser, or use Live Server in VS Code.

The backend must be running on `http://localhost:3001`.

---

## API

### POST /api/generate

**Request:**

```json
{
  "prompt": "Create 10 detailed slides about Cybersecurity covering: threats, prevention, tools, and best practices"
}
```

**Response:**

```json
{
  "success": true,
  "presentation": {
    "title": "Cybersecurity Essentials",
    "subtitle": "Protecting systems and data in a connected world",
    "slides": [
      {
        "type": "content",
        "title": "Common Cyber Threats",
        "points": [
          "Malware and ransomware attacks",
          "Phishing and social engineering",
          "Unpatched software vulnerabilities"
        ]
      }
    ]
  },
  "model": "nvidia/nemotron-3-ultra-550b-a55b:free"
}
```

---

## Running Tests

### Backend tests

```bash
cd backend
npm test
```

Runs unit and integration tests.

### Live AI tests

```bash
cd backend
set RUN_LIVE_AI_TESTS=true
npm run test:live
```

Actually calls OpenRouter models.

---

## Model Fallback Chain

If the primary model fails, the system tries:

1. `nvidia/nemotron-3-ultra-550b-a55b:free`
2. `poolside/laguna-xs-2.1:free`
3. `inclusionai/ling-3.0-tiny:free`

Experimental models are configured in `backend/ai/models.js`.

---

## Design Principles

1. **Small + Controlled:** The app constrains the AI, not the other way around.
2. **Cheap:** Works with free models from OpenRouter.
3. **Deterministic:** Same prompt produces the same structured output shape.
4. **Usable:** Output is a real presentation, not raw AI text.
5. **Readable:** Code is simple enough for HTML/CSS/JS beginners to understand.

---

## License

School prototype project.
