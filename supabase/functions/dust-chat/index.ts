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

    // Try Dust first, fall back to Lovable AI
    const DUST_API_KEY = Deno.env.get("DUST_API_KEY");
    const DUST_WORKSPACE_ID = Deno.env.get("DUST_WORKSPACE_ID");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const systemPrompt = `You are Veya, a curated food journey AI. The user is exploring ${city || "a city"}. Based on their vibe preferences, generate a curated food journey route with 4-6 specific stops. For each stop provide: a name (use real-sounding restaurant/bar names), a type (one of: drink, appetizer, main, dessert, experience, cocktail, coffee, snack), a short vivid description (1 sentence max), and an estimated duration. Respond ONLY with valid JSON, no markdown, no explanation. Use this exact structure: {"routeName":"string","description":"string","stops":[{"order":1,"name":"string","type":"string","description":"string","duration":"string"}]}`;

    let assistantMessage = "";

    // Try Dust if available and has credits
    if (DUST_API_KEY && DUST_WORKSPACE_ID) {
      try {
        const dustResp = await fetch(
          `https://dust.tt/api/v1/w/${DUST_WORKSPACE_ID}/assistant/conversations`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${DUST_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              visibility: "unlisted",
              title: city ? `${city} food route` : "Veya route",
              message: {
                content: `${systemPrompt}\n\nUser request: ${message}`,
                mentions: [],
                context: {
                  timezone: "UTC",
                  username: "veya-user",
                  profilePictureUrl: null,
                  fullName: "Veya User",
                  email: null,
                  origin: "api",
                },
              },
              blocking: true,
            }),
          }
        );

        if (dustResp.ok) {
          const dustData = await dustResp.json();
          const conversation = dustData.conversation;
          if (conversation?.content) {
            for (const msgGroup of conversation.content) {
              for (const msg of msgGroup) {
                if (msg.type === "agent_message" && msg.content) {
                  assistantMessage = msg.content;
                }
              }
            }
          }
          if (assistantMessage) {
            return new Response(
              JSON.stringify({ conversationId: conversation?.sId, message: assistantMessage }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } else {
          const errText = await dustResp.text();
          console.log("Dust unavailable, falling back to Lovable AI:", dustResp.status, errText);
        }
      } catch (dustErr) {
        console.log("Dust error, falling back:", dustErr);
      }
    }

    // Fallback: Lovable AI
    if (!LOVABLE_API_KEY) throw new Error("No AI provider available");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("Lovable AI error:", aiResp.status, errText);

      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI error [${aiResp.status}]`);
    }

    const aiData = await aiResp.json();
    assistantMessage = aiData.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("dust-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
