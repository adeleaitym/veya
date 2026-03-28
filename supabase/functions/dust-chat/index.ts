import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Dust API integration for Veya route generation

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
    const DUST_API_KEY = Deno.env.get("DUST_API_KEY");
    if (!DUST_API_KEY) throw new Error("DUST_API_KEY is not configured");

    const DUST_WORKSPACE_ID = Deno.env.get("DUST_WORKSPACE_ID");
    if (!DUST_WORKSPACE_ID) throw new Error("DUST_WORKSPACE_ID is not configured");

    const { message, city, conversationId } = await req.json();

    if (!message || typeof message !== "string" || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Invalid message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemContext = city
      ? `The user is exploring food routes in ${city}. Generate a curated food journey route with 4-6 specific stops. For each stop, provide: a name, a type (drink/appetizer/main/dessert/experience), a short vivid description (1 sentence), and an estimated time. Format your response as JSON with this structure: { "routeName": "string", "description": "string", "stops": [{ "order": 1, "name": "string", "type": "string", "description": "string", "duration": "string" }] }. Make the route feel like a curated journey — poetic, specific, and local. Always respond with valid JSON only, no markdown.`
      : "";

    const userContent = systemContext
      ? `${systemContext}\n\nUser request: ${message}`
      : message;

    // If we have a conversationId, post a message to existing conversation
    if (conversationId) {
      const msgResp = await fetch(
        `https://dust.tt/api/v1/w/${DUST_WORKSPACE_ID}/assistant/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DUST_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: userContent,
            mentions: [],
            context: {
              timezone: "UTC",
              username: "veya-user",
              profilePictureUrl: null,
              fullName: "Veya User",
              email: null,
              origin: "api",
            },
          }),
        }
      );

      if (!msgResp.ok) {
        const errText = await msgResp.text();
        console.error("Dust message error:", msgResp.status, errText);
        throw new Error(`Dust API error [${msgResp.status}]: ${errText}`);
      }

      const msgData = await msgResp.json();
      return new Response(JSON.stringify(msgData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a new conversation
    const resp = await fetch(
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
            content: userContent,
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

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Dust conversation error:", resp.status, errText);

      if (resp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Dust API error [${resp.status}]: ${errText}`);
    }

    const data = await resp.json();

    // Extract the assistant's response from the conversation
    const conversation = data.conversation;
    let assistantMessage = "";

    if (conversation?.content) {
      // content is an array of message arrays
      for (const msgGroup of conversation.content) {
        for (const msg of msgGroup) {
          if (msg.type === "agent_message" && msg.content) {
            assistantMessage = msg.content;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        conversationId: conversation?.sId,
        message: assistantMessage,
      }),
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
