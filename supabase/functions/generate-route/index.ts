import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

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

    const systemPrompt = `You are Veya, an evening route planner AI for real cities. The user is exploring ${city || "a city"}.

CRITICAL RULES:
- You MUST suggest REAL, actually existing places and venues in ${city || "the city"}.
- Use real venue names that people can actually visit and find on Google Maps.
- If you know the specific neighborhood, suggest places in or near that area.
- MIX food AND experiences! Not every stop should be eating/drinking. Include things like:
  * Scenic viewpoints, rooftop terraces, sunset spots
  * Live music venues, jazz clubs, open mic nights
  * Art galleries, street art walks, museum late openings
  * Night markets, vintage shops, bookstores
  * Parks, waterfronts, bridges with great views
  * Cultural landmarks, hidden courtyards, historic streets
  * Arcade bars, bowling, escape rooms, comedy clubs
- Aim for roughly 50% food/drink stops and 50% experience stops.
- Each stop should feel like a local recommendation, not a generic placeholder.
- Adapt to the user's vibe, budget, time, and food preferences.
- Generate 4-6 stops that flow naturally as an evening route.

Respond ONLY with valid JSON, no markdown, no explanation. Use this exact structure:
{"routeName":"string","description":"string","stops":[{"order":1,"name":"string","type":"string (one of: drink, appetizer, main, dessert, experience, cocktail, coffee, snack, viewpoint, culture, music, nightlife, walk)","description":"string (1 vivid sentence about the real place)","duration":"string"}]}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: jsonHeaders,
      });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText.substring(0, 500));

      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again in a moment" }), {
          status: 429, headers: jsonHeaders,
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: jsonHeaders,
        });
      }

      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 502, headers: jsonHeaders,
      });
    }

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    if (!content) {
      return new Response(JSON.stringify({ error: "Empty AI response" }), {
        status: 502, headers: jsonHeaders,
      });
    }

    // Strip markdown fences if present
    const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    return new Response(JSON.stringify({ route: cleaned, provider: "lovable-ai" }), {
      headers: jsonHeaders,
    });
  } catch (e) {
    console.error("generate-route error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: jsonHeaders,
    });
  }
});
