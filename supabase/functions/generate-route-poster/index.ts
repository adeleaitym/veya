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
    const { routeName, city, stops } = await req.json();

    if (!routeName || !stops || !Array.isArray(stops)) {
      return new Response(
        JSON.stringify({ error: "Missing route details" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const DUST_API_KEY = Deno.env.get("DUST_API_KEY");
    const DUST_WORKSPACE_ID = Deno.env.get("DUST_WORKSPACE_ID");

    if (!DUST_API_KEY || !DUST_WORKSPACE_ID) {
      console.error("Dust credentials not configured");
      return new Response(
        JSON.stringify({ error: "Poster service not configured" }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const stopsList = stops
      .map((s: any, i: number) => `${i + 1}. ${s.name} (${s.type}) - ${s.description || ""}`)
      .join("\n");

    const userMessage = `Create a beautiful illustrated poster for this evening route:

Route: "${routeName}"
City: ${city || "Unknown"}

Stops:
${stopsList}

Please generate a visually stunning poster illustration in your signature style. The poster should capture the mood and energy of this evening out, with artistic representations of each stop along a visual path. Portrait orientation, stylish and shareable.`;

    // Create a conversation with the StyleForge agent
    const convResp = await fetch(
      `https://dust.tt/api/v1/w/${DUST_WORKSPACE_ID}/assistant/conversations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DUST_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          visibility: "unlisted",
          title: `Poster: ${routeName}`,
          message: {
            content: userMessage,
            mentions: [
              {
                configurationId: "StyleForge",
              },
            ],
            context: {
              timezone: "Europe/Stockholm",
              username: "veya-app",
              profilePictureUrl: null,
              fullName: "Veya App",
              email: null,
              origin: "api",
            },
          },
          blocking: true,
        }),
      }
    );

    if (!convResp.ok) {
      const errText = await convResp.text();
      console.error("Dust conversation error:", convResp.status, errText.substring(0, 500));
      
      if (convResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Try again shortly." }),
          { status: 429, headers: jsonHeaders }
        );
      }

      return new Response(
        JSON.stringify({ error: "Poster generation failed" }),
        { status: 502, headers: jsonHeaders }
      );
    }

    const convData = await convResp.json();
    
    // Extract the agent's response - look for image content or text
    const conversation = convData.conversation;
    const agentMessages = conversation?.content?.flat()?.filter(
      (msg: any) => msg.type === "agent_message"
    ) || [];

    let imageUrl: string | null = null;
    let textContent = "";

    for (const agentMsg of agentMessages) {
      // Check for image in content
      if (agentMsg.content) {
        textContent = agentMsg.content;
        
        // Look for image URLs in the response
        const imgMatch = textContent.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|gif|webp|svg)[^\s"']*/i);
        if (imgMatch) {
          imageUrl = imgMatch[0];
        }
        
        // Look for base64 image data
        const base64Match = textContent.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
        if (base64Match) {
          imageUrl = base64Match[0];
        }

        // Look for markdown image syntax
        const mdImgMatch = textContent.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
        if (mdImgMatch) {
          imageUrl = mdImgMatch[1];
        }
      }

      // Check contentFragments for file attachments
      if (agentMsg.rawContents) {
        for (const content of agentMsg.rawContents) {
          if (content.contentType?.startsWith("image/") && content.url) {
            imageUrl = content.url;
          }
        }
      }
    }

    if (imageUrl) {
      return new Response(
        JSON.stringify({ imageUrl, provider: "dust-styleforge" }),
        { headers: jsonHeaders }
      );
    }

    // If no image but we got text, return the text as creative content
    // The frontend can render this as a styled text poster
    if (textContent) {
      return new Response(
        JSON.stringify({ 
          textContent, 
          provider: "dust-styleforge",
          note: "StyleForge returned a text-based creative response" 
        }),
        { headers: jsonHeaders }
      );
    }

    return new Response(
      JSON.stringify({ error: "No poster content returned from StyleForge" }),
      { status: 502, headers: jsonHeaders }
    );
  } catch (e) {
    console.error("generate-route-poster error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
