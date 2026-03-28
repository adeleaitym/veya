import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, city } = await req.json();

    if (!message || typeof message !== "string" || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Invalid message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are Veya, an evening route planner AI. The user is exploring ${city || "a city"}. Based on their preferences, generate a curated evening route with 4-6 specific stops. Include restaurants, bars, cafés, walks, viewpoints, cultural spots, entertainment — anything that makes a great night out! For each stop provide: a name (real-sounding venue names), a type (one of: drink, appetizer, main, dessert, experience, cocktail, coffee, snack), a short vivid description (1 sentence max), and an estimated duration. Respond ONLY with valid JSON, no markdown, no explanation. Use this exact structure: {"routeName":"string","description":"string","stops":[{"order":1,"name":"string","type":"string","description":"string","duration":"string"}]}`;

    // Try Google AI first (fast, direct response)
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
          }
        );

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          const content = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (content) {
            return new Response(
              JSON.stringify({ route: content }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          const errText = await aiResp.text();
          console.error("Google AI failed:", aiResp.status, errText.substring(0, 200));
        }
      } catch (e) {
        console.error("Google AI error:", e);
      }
    }

    // Fallback: Start Dust conversation (async — client will poll)
    const DUST_API_KEY = Deno.env.get("DUST_API_KEY");
    const DUST_WORKSPACE_ID = Deno.env.get("DUST_WORKSPACE_ID");
    if (!DUST_API_KEY || !DUST_WORKSPACE_ID) throw new Error("No AI provider available");

    const dustResp = await fetch(
      `https://dust.tt/api/v1/w/${DUST_WORKSPACE_ID}/assistant/conversations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DUST_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            content: `${systemPrompt}\n\nUser request: ${message}`,
            mentions: [{ configurationId: "MapAnimator" }],
            context: { timezone: "UTC", profilePictureUrl: null, fullName: "Veya User", email: null, username: "veya-user", origin: "api" },
          },
          visibility: "unlisted",
          title: `Route: ${city}`,
        }),
      }
    );

    if (!dustResp.ok) {
      const errText = await dustResp.text();
      console.error("Dust error:", dustResp.status, errText);
      throw new Error(`Dust error [${dustResp.status}]`);
    }

    const dustData = await dustResp.json();
    const conversationId = dustData.conversation?.sId;
    if (!conversationId) throw new Error("No Dust conversation ID");

    return new Response(
      JSON.stringify({ conversationId, status: "processing" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-route error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
