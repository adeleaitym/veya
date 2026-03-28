# Veya — Curated Evening Experiences

> **Swipe a vibe. Get a plan. Live it tonight.**

Veya is a mobile-first web application that creates AI-powered, personalised evening itineraries in real cities. Users choose a mood ("vibe"), set preferences (neighbourhood, budget, time, dietary needs), and receive a curated route of **real, existing venues** — complete with illustrated stop images and a shareable poster.

**Live app →** [veya-veya.lovable.app](https://veya-veya.lovable.app)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [Environment Variables & Secrets](#environment-variables--secrets)
7. [Edge Functions (Backend)](#edge-functions-backend)
8. [API Documentation](#api-documentation)
9. [User Flow](#user-flow)
10. [Design System](#design-system)
11. [External Services & Integrations](#external-services--integrations)
12. [Development](#development)
13. [Deployment](#deployment)

---

## Features

| Feature | Description |
|---------|-------------|
| **Vibe Selection** | Swipe-based card UI with 6 illustrated vibes (Energetic, Romantic, Creative, Cozy, Playful, Try Something New) |
| **Smart Preferences** | Geolocation-aware neighbourhood detection, budget tiers, time slots, and 10 dietary options |
| **AI Route Generation** | Google Gemini 2.5 Flash generates routes with 4–6 real venue recommendations |
| **Stop Details** | Individual venue cards with AI-generated editorial illustrations |
| **Booking Flow** | Date/time selection and party size for the generated route |
| **Poster Generation** | Shareable illustrated poster via Dust StyleForge agent, with SVG fallback |
| **Feedback System** | Post-experience rating and comments |
| **Geolocation** | Reverse geocoding via OpenStreetMap Nominatim for automatic city/neighbourhood detection |
| **Multi-city Support** | Pre-configured neighbourhoods for 12 cities (Stockholm, London, Paris, Berlin, New York, etc.) |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework (SPA) |
| **TypeScript** | Type-safe development |
| **Vite 5** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **React Router v6** | Client-side routing |
| **TanStack React Query** | Server state management |
| **shadcn/ui** | Accessible UI component library (Radix UI primitives) |
| **Sonner** | Toast notifications |
| **Recharts** | Data visualisation (charts) |

### Backend (Lovable Cloud / Supabase)

| Technology | Purpose |
|-----------|---------|
| **Supabase Edge Functions** | Serverless Deno-based API endpoints |
| **Supabase Client SDK** | Frontend ↔ backend communication |
| **Deno Runtime** | Edge function execution environment |

### AI & External APIs

| Service | Model / API | Purpose |
|---------|-------------|---------|
| **Google Gemini 2.5 Flash** | `gemini-2.5-flash` via REST | Route generation (real venue recommendations) |
| **Lovable AI Gateway** | `google/gemini-3.1-flash-image-preview` | Stop illustration generation (editorial-style images) |
| **Dust.tt** | StyleForge agent | Poster generation (illustrated shareable posters) |
| **OpenStreetMap Nominatim** | Reverse geocoding API | Location detection (neighbourhood + city) |

### Dev Tools

| Tool | Purpose |
|------|---------|
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **ESLint 9** | Code linting |
| **PostCSS + Autoprefixer** | CSS processing |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React SPA)              │
│                                                     │
│  Index → VibeSelect → Preferences → RouteView      │
│                                     ↓               │
│                          StopDetail / Booking        │
│                          Poster / Tonight            │
└──────────────┬───────────────────────┬──────────────┘
               │ Supabase SDK         │ fetch()
               ▼                      ▼
┌──────────────────────┐   ┌──────────────────────────┐
│  EDGE FUNCTIONS      │   │  EXTERNAL APIs           │
│  (Deno / Supabase)   │   │                          │
│                      │   │  • Nominatim (geocoding)  │
│  • generate-route    │   └──────────────────────────┘
│  • generate-stop-img │
│  • generate-poster   │
│  • poll-route        │
└───────┬──────────────┘
        │ REST calls
        ▼
┌──────────────────────────────────────┐
│  AI SERVICES                         │
│                                      │
│  • Google Gemini API (routes)        │
│  • Lovable AI Gateway (images)       │
│  • Dust.tt StyleForge (posters)      │
└──────────────────────────────────────┘
```

---

## Project Structure

```
veya/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Vibe illustrations & hero image
│   │   ├── hero-illustration.png
│   │   ├── vibe-creative.jpg
│   │   ├── vibe-energetic.jpg
│   │   ├── vibe-romantic.jpg
│   │   ├── vibe-cozy.jpg
│   │   ├── vibe-playful.jpg
│   │   └── vibe-new.jpg
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components (50+)
│   │   ├── NavLink.tsx         # Navigation link component
│   │   └── SwipeCard.tsx       # Swipeable vibe card
│   ├── hooks/                  # Custom React hooks
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts       # Auto-generated Supabase client
│   │       └── types.ts        # Auto-generated DB types
│   ├── lib/
│   │   └── utils.ts            # Utility functions (cn, etc.)
│   ├── pages/
│   │   ├── Index.tsx           # Landing page (hero + CTA)
│   │   ├── VibeSelect.tsx      # Swipe-based vibe picker
│   │   ├── Preferences.tsx     # Budget, time, food, location
│   │   ├── RouteView.tsx       # Generated route with timeline
│   │   ├── StopDetail.tsx      # Individual venue detail
│   │   ├── Booking.tsx         # Date/time/party booking
│   │   ├── Confirmation.tsx    # Booking confirmation
│   │   ├── Tonight.tsx         # "Go now" live mode
│   │   ├── Feedback.tsx        # Post-experience rating
│   │   ├── RoutePoster.tsx     # Shareable poster view
│   │   └── NotFound.tsx        # 404 page
│   ├── index.css               # Global styles + design tokens
│   ├── App.tsx                 # Router setup
│   └── main.tsx                # Entry point
├── supabase/
│   ├── config.toml             # Supabase project config
│   └── functions/
│       ├── generate-route/     # AI route generation
│       ├── generate-stop-image/# AI stop illustrations
│       ├── generate-route-poster/ # Poster generation (Dust + SVG fallback)
│       └── poll-route/         # Route polling endpoint
├── tailwind.config.ts          # Tailwind + design tokens
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Test configuration
└── playwright.config.ts        # E2E test configuration
```

---

## Setup & Installation

### Prerequisites

- **Node.js** ≥ 18
- **npm**, **pnpm**, or **bun** (bun recommended)
- A **Lovable Cloud** project (provides Supabase backend automatically)

### 1. Clone & Install

```bash
git clone <repository-url>
cd veya
npm install
# or: bun install
```

### 2. Environment Variables

The `.env` file is auto-managed by Lovable Cloud and includes:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SUPABASE_PROJECT_ID=<project-id>
```

> **Do not edit `.env` manually.** It is auto-generated.

### 3. Configure Secrets

The following secrets must be set in your Lovable Cloud project settings:

| Secret | How to obtain |
|--------|---------------|
| `GOOGLE_AI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `DUST_API_KEY` | [Dust.tt dashboard](https://dust.tt) → API Keys |
| `DUST_WORKSPACE_ID` | Dust.tt workspace settings |

`LOVABLE_API_KEY` is automatically provided by Lovable Cloud.

### 4. Run Development Server

```bash
npm run dev
# App runs at http://localhost:5173
```

### 5. Run Tests

```bash
npm test              # Unit tests (Vitest)
npx playwright test   # E2E tests
```

### 6. Build for Production

```bash
npm run build
# Output in dist/
```

---

## Environment Variables & Secrets

### Frontend (auto-configured via `.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous/public key |

### Edge Function Secrets (configured in Lovable Cloud)

| Secret | Used By | Description |
|--------|---------|-------------|
| `GOOGLE_AI_API_KEY` | `generate-route` | Google Gemini API key for route generation |
| `LOVABLE_API_KEY` | `generate-stop-image` | Lovable AI Gateway key for image generation (auto-provided) |
| `DUST_API_KEY` | `generate-route-poster` | Dust.tt API key for StyleForge poster agent |
| `DUST_WORKSPACE_ID` | `generate-route-poster` | Dust.tt workspace identifier |

---

## Edge Functions (Backend)

All backend logic runs as **Supabase Edge Functions** (Deno runtime). They are deployed automatically via Lovable Cloud.

### `generate-route`

Generates a curated evening route with real venue recommendations.

- **AI Model**: Google Gemini 2.5 Flash (`gemini-2.5-flash`)
- **Input**: Vibe, neighbourhood, city, budget, time, food preferences
- **Output**: JSON with route name, description, and 4–6 stops
- **Key behaviour**: Uses `responseMimeType: "application/json"` for structured output; system prompt enforces real venue names

### `generate-stop-image`

Creates editorial-style line art illustrations for individual stops.

- **AI Model**: Gemini 3.1 Flash Image Preview (via Lovable AI Gateway)
- **Input**: Stop name, type, description, city
- **Output**: Base64 image data URL
- **Style**: Clean line art, white background, hot pink accents, hand-drawn editorial style
- **Error handling**: Graceful 429 (rate limit) and 402 (credits exhausted) responses

### `generate-route-poster`

Generates a shareable poster for an entire evening route.

- **Primary provider**: Dust.tt StyleForge agent (AI-illustrated poster)
- **Fallback**: Server-side SVG generation with venue timeline, emoji markers, and Veya branding
- **Input**: Route name, city, stops array
- **Output**: Image URL (Dust image URL or SVG data URL)
- **Resilience**: Automatically falls back to SVG when Dust is rate-limited (403/429) or unavailable

### `poll-route`

Polling endpoint for long-running route generation tasks.

---

## API Documentation

### POST `/generate-route`

Generate an evening route with real venue recommendations.

**Request body:**
```json
{
  "message": "Vibe: creative. Neighborhood: Södermalm. City: Stockholm. Budget: $$. Time: Classic (19–22). Food: Vegetarian.",
  "city": "Stockholm"
}
```

**Response (200):**
```json
{
  "route": {
    "routeName": "Södermalm Creative Night",
    "description": "An artsy evening through Stockholm's creative heart",
    "stops": [
      {
        "order": 1,
        "name": "Fotografiska",
        "type": "experience",
        "description": "World-class photography museum with a rooftop restaurant overlooking the harbour.",
        "duration": "1.5 hours"
      }
    ]
  },
  "provider": "google-ai"
}
```

**Error responses:** `400` (invalid input), `500` (config error), `502` (AI failure)

### POST `/generate-stop-image`

Generate an editorial illustration for a venue.

**Request body:**
```json
{
  "stopName": "Fotografiska",
  "stopType": "experience",
  "stopDescription": "Photography museum with rooftop bar",
  "city": "Stockholm"
}
```

**Response (200):**
```json
{
  "imageUrl": "data:image/png;base64,..."
}
```

**Error responses:** `400` (missing details), `402` (credits exhausted), `429` (rate limited)

### POST `/generate-route-poster`

Generate a shareable poster for a complete evening route.

**Request body:**
```json
{
  "routeName": "Södermalm Creative Night",
  "city": "Stockholm",
  "stops": [
    { "order": 1, "name": "Fotografiska", "type": "experience", "description": "...", "duration": "1.5 hours" }
  ]
}
```

**Response (200):**
```json
{
  "imageUrl": "https://... or data:image/svg+xml;base64,...",
  "provider": "dust-styleforge | svg-fallback"
}
```

**Error responses:** `400` (missing details), `500` (generation failure)

---

## User Flow

```
1. Landing Page (/)
   └─ "Plan my night" CTA
       └─ 2. Vibe Selection (/vibes)
           └─ Swipe through 6 illustrated vibe cards
               └─ 3. Preferences (/preferences?vibe=X)
                   └─ Set: neighbourhood, budget, time, food
                       └─ 4. Route View (/route?vibe=X&where=Y&...)
                           ├─ AI generates 4–6 real venue stops
                           ├─ Timeline view with emoji markers
                           │
                           ├─→ 5a. Stop Detail (/stop?...)
                           │       └─ Venue info + AI illustration
                           │
                           ├─→ 5b. Booking (/booking?...)
                           │       └─ Date, time, party size
                           │       └─ 6. Confirmation (/confirmation)
                           │
                           ├─→ 5c. Tonight (/tonight?...)
                           │       └─ "Go now" live checklist
                           │       └─ 7. Feedback (/feedback)
                           │
                           └─→ 5d. Poster (/poster?...)
                                   └─ AI-generated shareable poster
                                   └─ Share via Web Share API / download
```

---

## Design System

### Visual Identity

- **Aesthetic**: Editorial zine / hand-drawn magazine feel
- **Typography**: Display font (headings) + body font (content), configured via `font-display` and `font-body` Tailwind utilities
- **Palette**: Warm paper textures (`paper-texture` class), ink-based text (`text-ink`), secondary accents
- **Components**: Custom `zine-btn`, `zine-chip`, `zine-card`, `sketch-border` utility classes

### CSS Design Tokens (index.css)

```css
:root {
  --background    /* Base surface colour */
  --foreground    /* Base text colour */
  --primary       /* Accent actions */
  --secondary     /* Brand accent */
  --ink           /* Primary text colour */
  --paper         /* Card/surface backgrounds */
  --muted         /* Subdued elements */
  --accent        /* Highlight colour */
  --destructive   /* Error/danger states */
}
```

### Key Tailwind Extensions (tailwind.config.ts)

| Class | Purpose |
|-------|---------|
| `paper-texture` | Warm textured background for pages |
| `font-display` | Display/heading typeface |
| `font-body` | Body/content typeface |
| `zine-btn` | Primary call-to-action button |
| `zine-chip` / `.selected` | Selectable pill/chip component |
| `zine-card` | Content card with sketch-style border |
| `sketch-border` | Hand-drawn border effect |

---

## External Services & Integrations

### Google Gemini API
- **Endpoint**: `generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash`
- **Used for**: Route generation with real venue data
- **Auth**: API key via `GOOGLE_AI_API_KEY` secret
- **Docs**: [Google AI for Developers](https://ai.google.dev/docs)

### Lovable AI Gateway
- **Endpoint**: `ai.gateway.lovable.dev/v1/chat/completions`
- **Model**: `google/gemini-3.1-flash-image-preview`
- **Used for**: Stop illustration generation (image modality)
- **Auth**: Bearer token via `LOVABLE_API_KEY` (auto-provided)

### Dust.tt
- **Endpoint**: `dust.tt/api/v1/w/{workspace}/assistant/conversations`
- **Agent**: StyleForge (`configurationId: "StyleForge"`)
- **Used for**: AI-illustrated shareable posters
- **Auth**: Bearer token via `DUST_API_KEY` secret
- **Fallback**: SVG poster generated server-side when Dust is unavailable
- **Docs**: [Dust API Reference](https://docs.dust.tt)

### OpenStreetMap Nominatim
- **Endpoint**: `nominatim.openstreetmap.org/reverse`
- **Used for**: Reverse geocoding (lat/lng → neighbourhood + city name)
- **Auth**: None required (public API, rate-limited)
- **Called from**: Frontend (`Preferences.tsx`)
- **Docs**: [Nominatim API](https://nominatim.org/release-docs/develop/api/Reverse/)

---

## Development

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm test` | Run Vitest unit tests |
| `npm run lint` | Run ESLint |

### Adding New Vibes

1. Add illustration to `src/assets/vibe-{name}.jpg`
2. Add vibe config to the `vibes` array in `src/pages/VibeSelect.tsx`
3. The vibe name flows through preferences → route generation automatically

### Adding New Cities

Add a neighbourhood array to `cityNeighborhoods` in `src/pages/Preferences.tsx`:

```typescript
const cityNeighborhoods: Record<string, string[]> = {
  "YourCity": ["Area1", "Area2", "Area3"],
};
```

Cities without explicit entries fall back to generic neighbourhood names.

---

## Deployment

The app is deployed via **Lovable Cloud**, which handles:

- ✅ Frontend hosting (static SPA on global CDN)
- ✅ Edge function deployment (automatic on save)
- ✅ Environment variable & secret management
- ✅ SSL certificates
- ✅ Custom domain support

**Published URL**: [veya-veya.lovable.app](https://veya-veya.lovable.app)

---

## License

This project was built for the Lovable Hackathon. All rights reserved.
