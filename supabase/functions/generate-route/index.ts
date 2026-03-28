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
- You MUST suggest REAL, actually existing restaurants, bars, cafés, and venues in ${city || "the city"}.
- Use real venue names that people can actually visit and find on Google Maps.
- If you know the specific neighborhood, suggest places in or near that area.
- Include a mix: restaurants, cocktail bars, wine bars, cafés, cultural spots, scenic walks, viewpoints.
- Each stop should feel like a local recommendation, not a generic placeholder.
- Adapt to the user's vibe, budget, time, and food preferences.
- Generate 4-6 stops that flow naturally as an evening route.

Respond ONLY with valid JSON, no markdown, no explanation. Use this exact structure:
{"routeName":"string","description":"string","stops":[{"order":1,"name":"string","type":"string (one of: drink, appetizer, main, dessert, experience, cocktail, coffee, snack)","description":"string (1 vivid sentence about the real place)","duration":"string"}]}`;

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
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("Lovable AI failed:", aiResp.status, errText.substring(0, 500));
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 502,
        headers: jsonHeaders,
      });
    }

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    if (!content) {
      return new Response(JSON.stringify({ error: "Empty AI response" }), {
        status: 502,
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify({ route: content, provider: "lovable-ai" }), {
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
