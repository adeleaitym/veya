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

    const DUST_API_KEY = Deno.env.get("DUST_API_KEY");
    if (!DUST_API_KEY) throw new Error("DUST_API_KEY is not configured");

    const DUST_WORKSPACE_ID = Deno.env.get("DUST_WORKSPACE_ID");
    if (!DUST_WORKSPACE_ID) throw new Error("DUST_WORKSPACE_ID is not configured");

    const systemContext = `You are Veya, an evening route planner AI. The user is exploring ${city || "a city"}. Based on their preferences, generate a curated evening route with 4-6 specific stops. Include restaurants, bars, cafés, walks, viewpoints, cultural spots, entertainment — anything that makes a great night out! For each stop provide: a name (real-sounding venue names), a type (one of: drink, appetizer, main, dessert, experience, cocktail, coffee, snack), a short vivid description (1 sentence max), and an estimated duration. Respond ONLY with valid JSON, no markdown, no explanation. Use this exact structure: {"routeName":"string","description":"string","stops":[{"order":1,"name":"string","type":"string","description":"string","duration":"string"}]}`;

    const fullMessage = `${systemContext}\n\nUser request: ${message}`;

    // Create conversation with Dust — returns immediately with conversation ID
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
      throw new Error(`Dust API error [${dustResp.status}]: ${errText}`);
    }

    const dustData = await dustResp.json();
    const conversationId = dustData.conversation?.sId;

    if (!conversationId) {
      console.error("No conversation ID:", JSON.stringify(dustData));
      throw new Error("Failed to create Dust conversation");
    }

    // Return conversation ID immediately — client will poll
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
