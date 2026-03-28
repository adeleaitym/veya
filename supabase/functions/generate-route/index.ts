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

    // Try Google AI first, fall back to Dust
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
    const DUST_API_KEY = Deno.env.get("DUST_API_KEY");
    const DUST_WORKSPACE_ID = Deno.env.get("DUST_WORKSPACE_ID");

    const systemPrompt = `You are Veya, an evening route planner AI. The user is exploring ${city || "a city"}. Based on their preferences, generate a curated evening route with 4-6 specific stops. Include restaurants, bars, cafés, walks, viewpoints, cultural spots, entertainment — anything that makes a great night out! For each stop provide: a name (real-sounding venue names), a type (one of: drink, appetizer, main, dessert, experience, cocktail, coffee, snack), a short vivid description (1 sentence max), and an estimated duration. Respond ONLY with valid JSON, no markdown, no explanation. Use this exact structure: {"routeName":"string","description":"string","stops":[{"order":1,"name":"string","type":"string","description":"string","duration":"string"}]}`;

    let content = "";

    // Try Google AI
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
          content = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (content) {
            return new Response(
              JSON.stringify({ route: content }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          const errText = await aiResp.text();
          console.error("Google AI failed, falling back to Dust:", aiResp.status, errText);
        }
      } catch (e) {
        console.error("Google AI error, falling back to Dust:", e);
      }
    }

    // Fall back to Dust
    if (!DUST_API_KEY || !DUST_WORKSPACE_ID) {
      throw new Error("No AI provider available");
    }

    const fullMessage = `${systemPrompt}\n\nUser request: ${message}`;

    // Create conversation
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
            content: fullMessage,
            mentions: [{ configurationId: "MapAnimator" }],
            context: {
              timezone: "UTC",
              profilePictureUrl: null,
              fullName: "Veya User",
              email: null,
              username: "veya-user",
              origin: "api",
            },
          },
          visibility: "unlisted",
          title: `Route: ${city}`,
        }),
      }
    );

    if (!dustResp.ok) {
      const errText = await dustResp.text();
      console.error("Dust API error:", dustResp.status, errText);
      throw new Error(`Dust API error [${dustResp.status}]`);
    }

    const dustData = await dustResp.json();
    const conversationId = dustData.conversation?.sId;
    if (!conversationId) throw new Error("No Dust conversation ID");

    // Poll Dust for up to 50 seconds
    for (let i = 0; i < 25; i++) {
      await new Promise((r) => setTimeout(r, 2000));

      const pollResp = await fetch(
        `https://dust.tt/api/v1/w/${DUST_WORKSPACE_ID}/assistant/conversations/${conversationId}`,
        { headers: { Authorization: `Bearer ${DUST_API_KEY}` } }
      );

      if (!pollResp.ok) {
        const errText = await pollResp.text();
        console.error("Dust poll error:", pollResp.status, errText);
        continue;
      }

      const pollData = await pollResp.json();
      const messages = pollData.conversation?.content || [];

      for (const messageGroup of messages) {
        for (const msg of messageGroup) {
          if (msg.type === "agent_message" && msg.status === "succeeded" && msg.content) {
            return new Response(
              JSON.stringify({ route: msg.content }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          if (msg.type === "agent_message" && (msg.status === "failed" || msg.status === "cancelled")) {
            throw new Error("Dust agent failed");
          }
        }
      }
    }

    throw new Error("Route generation timed out");
  } catch (e) {
    console.error("generate-route error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
