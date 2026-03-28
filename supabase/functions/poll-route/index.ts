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
    const { conversationId } = await req.json();

    if (!conversationId || typeof conversationId !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid conversationId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const DUST_API_KEY = Deno.env.get("DUST_API_KEY");
    if (!DUST_API_KEY) throw new Error("DUST_API_KEY is not configured");

    const DUST_WORKSPACE_ID = Deno.env.get("DUST_WORKSPACE_ID");
    if (!DUST_WORKSPACE_ID) throw new Error("DUST_WORKSPACE_ID is not configured");

    const pollResp = await fetch(
      `https://dust.tt/api/v1/w/${DUST_WORKSPACE_ID}/assistant/conversations/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${DUST_API_KEY}`,
        },
      }
    );

    if (!pollResp.ok) {
      const errText = await pollResp.text();
      console.error("Poll error:", pollResp.status, errText);
      throw new Error(`Poll error [${pollResp.status}]: ${errText}`);
    }

    const pollData = await pollResp.json();
    const messages = pollData.conversation?.content || [];

    // Find the last agent message
    let assistantMessage = "";
    let agentStatus = "processing";

    for (const messageGroup of messages) {
      for (const msg of messageGroup) {
        if (msg.type === "agent_message") {
          if (msg.status === "succeeded") {
            assistantMessage = msg.content || "";
            agentStatus = "completed";
          } else if (msg.status === "failed" || msg.status === "cancelled") {
            agentStatus = "failed";
          }
          // else still processing
        }
      }
    }

    return new Response(
      JSON.stringify({ status: agentStatus, message: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("poll-route error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
