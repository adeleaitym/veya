import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

type StopType = "drink" | "appetizer" | "main" | "dessert" | "experience" | "cocktail" | "coffee" | "snack";

type RouteStop = {
  order: number;
  name: string;
  type: StopType;
  description: string;
  duration: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

const quickStopsByMood: Record<string, Omit<RouteStop, "order">[]> = {
  jazz: [
    { name: "Björk & Brass", type: "cocktail", description: "Start with a smoky house cocktail while the first sax set warms up.", duration: "45 min" },
    { name: "Blue Note Cellar", type: "drink", description: "A cozy underground jazz bar with candlelit booths and vinyl interludes.", duration: "60 min" },
    { name: "Norr Strand Night Walk", type: "experience", description: "Take a waterside stroll between venues to reset and soak in city lights.", duration: "25 min" },
    { name: "Midnight Kitchen Atelier", type: "main", description: "Late dinner with Nordic comfort plates and natural wine pairings.", duration: "75 min" },
    { name: "Neon Pastry Club", type: "dessert", description: "Finish with a warm cardamom bun and dark chocolate cream.", duration: "30 min" },
  ],
  party: [
    { name: "Pulse Courtyard", type: "cocktail", description: "Open-air pregame with upbeat DJs and signature spritzes.", duration: "50 min" },
    { name: "Afterglow Bites", type: "snack", description: "Quick shared bites before peak dance hours.", duration: "30 min" },
    { name: "District 11 Club", type: "drink", description: "Main dancefloor stop with rotating electronic sets.", duration: "90 min" },
    { name: "Moonline Rooftop", type: "experience", description: "Breather stop for skyline views and crowd energy.", duration: "35 min" },
    { name: "Night Noodles Window", type: "main", description: "Post-party comfort noodles at a beloved late-night counter.", duration: "35 min" },
  ],
  default: [
    { name: "Lantern Corner Café", type: "coffee", description: "Ease into the evening with a slow coffee and people-watching.", duration: "35 min" },
    { name: "Old Town Passage", type: "experience", description: "Scenic walking segment through atmospheric streets and hidden alleys.", duration: "25 min" },
    { name: "Harbor Flame Kitchen", type: "main", description: "Relaxed dinner stop focused on local flavors and seasonal plates.", duration: "70 min" },
    { name: "Amber Room Bar", type: "cocktail", description: "Golden-hour drinks in a moody bar with low music and great bartenders.", duration: "55 min" },
    { name: "Cloudline Viewpoint", type: "dessert", description: "End at a city overlook with a sweet bite and night skyline photos.", duration: "30 min" },
  ],
};

const pickMood = (message: string) => {
  const lower = message.toLowerCase();
  if (lower.includes("jazz")) return "jazz";
  if (lower.includes("party") || lower.includes("club")) return "party";
  return "default";
};

const buildFallbackRoute = (message: string, city: string) => {
  const mood = pickMood(message);
  const base = quickStopsByMood[mood] ?? quickStopsByMood.default;
  return {
    routeName: `${city || "City"} ${mood === "default" ? "Evening Route" : `${mood[0].toUpperCase()}${mood.slice(1)} Route`}`,
    description: `A quick curated route built for your vibe in ${city || "the city"}.`,
    stops: base.map((stop, index) => ({ ...stop, order: index + 1 })),
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const city = typeof body?.city === "string" ? body.city.trim() : "";

    if (!message || message.length > 2000) {
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    const systemPrompt = `You are Veya, an evening route planner AI. The user is exploring ${city || "a city"}. Based on their preferences, generate a curated evening route with 4-6 specific stops. Include restaurants, bars, cafés, walks, viewpoints, cultural spots, entertainment — anything that makes a great night out! For each stop provide: a name (real-sounding venue names), a type (one of: drink, appetizer, main, dessert, experience, cocktail, coffee, snack), a short vivid description (1 sentence max), and an estimated duration. Respond ONLY with valid JSON, no markdown, no explanation. Use this exact structure: {"routeName":"string","description":"string","stops":[{"order":1,"name":"string","type":"string","description":"string","duration":"string"}]}`;

    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    if (GOOGLE_AI_API_KEY) {
      try {
        const aiResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nUser request: ${message}` }] }],
              generationConfig: { responseMimeType: "application/json" },
            }),
          },
        );

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (content) {
            return new Response(JSON.stringify({ route: content, provider: "google" }), {
              headers: jsonHeaders,
            });
          }
        } else {
          const errText = await aiResp.text();
          console.error("Google AI failed:", aiResp.status, errText.substring(0, 300));
        }
      } catch (e) {
        console.error("Google AI error:", e);
      }
    }

    const fallback = buildFallbackRoute(message, city || "City");
    return new Response(JSON.stringify({ route: JSON.stringify(fallback), provider: "fallback" }), {
      headers: jsonHeaders,
    });
  } catch (e) {
    console.error("generate-route error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
