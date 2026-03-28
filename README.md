# Veya — Curated Evening Experiences

> **Swipe a vibe. Get a plan. Live it tonight.**

## 🔗 Live App

**👉 [veya-veya.lovable.app](https://veya-veya.lovable.app)**

Open on mobile for the best experience.

---

## What is Veya?

Veya is a mobile-first web app that creates **AI-powered, personalised evening itineraries** in real cities. Users swipe through mood-based "vibes," set preferences (neighbourhood, budget, time, dietary needs), and receive a curated route of **real, existing venues** — complete with AI-generated illustrations and a shareable poster.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Vibe Selection** | Swipe-based card UI with 6 illustrated vibes (Energetic, Romantic, Creative, Cozy, Playful, Try Something New) |
| **Smart Preferences** | Geolocation-aware neighbourhood detection, budget tiers, time slots, and 15+ dietary options |
| **AI Route Generation** | Google Gemini 2.5 Flash generates routes with 4–6 real venue & experience recommendations |
| **Mixed Experiences** | Routes include restaurants, bars, viewpoints, live music, galleries, cultural spots, and scenic walks |
| **AI Illustrations** | Each stop gets an editorial-style illustration generated via Lovable AI Gateway |
| **Poster Generation** | Shareable illustrated poster via Dust StyleForge agent, with SVG fallback |
| **Booking Flow** | Date/time selection and party size for the generated route |
| **Live "Go Now" Mode** | Real-time checklist for tonight's adventure |
| **Feedback System** | Post-experience rating and comments |
| **Multi-city Support** | 12 cities (Stockholm, London, Paris, Berlin, New York, Tokyo, etc.) |

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui, React Router v6, TanStack React Query |
| **Backend** | Supabase Edge Functions (Deno runtime), deployed via Lovable Cloud |
| **AI — Routes** | Google Gemini 2.5 Flash (real venue recommendations with structured JSON output) |
| **AI — Illustrations** | Lovable AI Gateway → `google/gemini-3.1-flash-image-preview` (editorial line art) |
| **AI — Posters** | Dust.tt StyleForge agent (illustrated posters) with SVG fallback |
| **Geolocation** | OpenStreetMap Nominatim (reverse geocoding for neighbourhood detection) |
| **Testing** | Vitest (unit), Playwright (E2E) |

---

## Architecture

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
│  (Deno / Supabase)   │   │  • Nominatim (geocoding) │
│                      │   └──────────────────────────┘
│  • generate-route    │
│  • generate-stop-img │
│  • generate-poster   │
│  • poll-route        │
└───────┬──────────────┘
        │
        ▼
┌──────────────────────────────────────┐
│  AI SERVICES                         │
│  • Google Gemini API (routes)        │
│  • Lovable AI Gateway (images)       │
│  • Dust.tt StyleForge (posters)      │
└──────────────────────────────────────┘
```

---

## User Flow

```
1. Landing Page → "Plan my night"
2. Vibe Selection → Swipe through 6 mood cards
3. Preferences → Neighbourhood, budget, time, dietary needs
4. Route View → AI generates 4–6 real venue stops (food + experiences)
   ├─ Stop Detail → Venue info + AI illustration
   ├─ Booking → Date, time, party size → Confirmation
   ├─ Tonight → "Go now" live checklist → Feedback
   └─ Poster → AI-generated shareable poster (download/share)
```

---

## Edge Functions (API)

### `POST /generate-route`
Generates a curated evening route using **Google Gemini 2.5 Flash**. Returns 4–6 real venues with a mix of dining and experiences.

### `POST /generate-stop-image`
Creates editorial-style illustrations for each venue using **Lovable AI Gateway** (`gemini-3.1-flash-image-preview`).

### `POST /generate-route-poster`
Generates a shareable poster via **Dust.tt StyleForge**. Falls back to server-side SVG generation when Dust is unavailable.

### `POST /poll-route`
Polling endpoint for long-running route generation tasks.

---

## Setup & Installation

```bash
git clone <repository-url>
cd veya
npm install
npm run dev        # → http://localhost:5173
```

### Required Secrets (Lovable Cloud)

| Secret | Purpose |
|--------|---------|
| `GOOGLE_AI_API_KEY` | Google Gemini API for route generation |
| `DUST_API_KEY` | Dust.tt API for poster generation |
| `DUST_WORKSPACE_ID` | Dust.tt workspace identifier |
| `LOVABLE_API_KEY` | Auto-provided by Lovable Cloud |

---

## Design System

- **Aesthetic**: Editorial zine / hand-drawn magazine feel
- **Palette**: Warm paper textures, ink-based typography, hot pink accents
- **Custom classes**: `zine-btn`, `zine-chip`, `zine-card`, `sketch-border`, `paper-texture`
- **Fonts**: Display + body typeface pairing via Tailwind utilities

---

## Deployment

Deployed via **Lovable Cloud** with automatic edge function deployment, global CDN, and SSL.

**Live → [veya-veya.lovable.app](https://veya-veya.lovable.app)**

---

*Built for the Lovable Hackathon. All rights reserved.*
