import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

async function generateWithLovableAI(routeName: string, city: string, stops: any[]): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const stopsList = stops
    .map((s: any, i: number) => `${i + 1}. ${s.name} (${s.type})`)
    .join(", ");

  const prompt = `Create a beautiful illustrated poster for an evening out in ${city || "a city"}. The route is called "${routeName}" with these stops: ${stopsList}. 
Style: editorial magazine illustration, hand-drawn ink lines with watercolor washes, warm evening tones (amber, coral, deep blue night sky). Show a stylized city scene with tiny illustrated people walking between venues connected by a dotted path. Include subtle icons for each stop type. Portrait orientation, elegant and shareable. No text, no letters, no words.`;

  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-image-preview",
      messages: [{ role: "user", content: prompt }],
      modalities: ["image", "text"],
    }),
  });

  if (!aiResp.ok) {
    const errText = await aiResp.text();
    console.error("Lovable AI image gen error:", aiResp.status, errText);
    throw new Error(`Image generation failed: ${aiResp.status}`);
  }

  const aiData = await aiResp.json();
  const parts = aiData.choices?.[0]?.message?.content;

  if (Array.isArray(parts)) {
    for (const part of parts) {
      if (part.type === "image_url" && part.image_url?.url) {
        return part.image_url.url;
      }
    }
  }

  throw new Error("No image returned from AI");
}

async function generateWithDust(routeName: string, city: string, stops: any[]): Promise<{ imageUrl?: string; textContent?: string }> {
  const DUST_API_KEY = Deno.env.get("DUST_API_KEY");
  const DUST_WORKSPACE_ID = Deno.env.get("DUST_WORKSPACE_ID");

  if (!DUST_API_KEY || !DUST_WORKSPACE_ID) {
    throw new Error("Dust credentials not configured");
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
          mentions: [{ configurationId: "StyleForge" }],
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
    console.error("Dust error:", convResp.status, errText.substring(0, 500));
    throw new Error(`Dust API error: ${convResp.status}`);
  }

  const convData = await convResp.json();
  const conversation = convData.conversation;
  const agentMessages = conversation?.content?.flat()?.filter(
    (msg: any) => msg.type === "agent_message"
  ) || [];

  for (const agentMsg of agentMessages) {
    if (agentMsg.content) {
      const text = agentMsg.content;
      const mdImgMatch = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
      if (mdImgMatch) return { imageUrl: mdImgMatch[1] };
      const imgMatch = text.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|gif|webp|svg)[^\s"']*/i);
      if (imgMatch) return { imageUrl: imgMatch[0] };
      const base64Match = text.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
      if (base64Match) return { imageUrl: base64Match[0] };
      return { textContent: text };
    }
    if (agentMsg.rawContents) {
      for (const content of agentMsg.rawContents) {
        if (content.contentType?.startsWith("image/") && content.url) {
          return { imageUrl: content.url };
        }
      }
    }
  }

  throw new Error("No content from Dust");
}

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

    // Try Dust first, fall back to Lovable AI
    try {
      const dustResult = await generateWithDust(routeName, city, stops);
      if (dustResult.imageUrl) {
        return new Response(
          JSON.stringify({ imageUrl: dustResult.imageUrl, provider: "dust-styleforge" }),
          { headers: jsonHeaders }
        );
      }
      if (dustResult.textContent) {
        // Dust returned text only — try Lovable AI for an actual image instead
        throw new Error("Dust returned text only, trying image fallback");
      }
    } catch (dustErr) {
      console.log("Dust unavailable, falling back to Lovable AI:", (dustErr as Error).message);
    }

    // Fallback: Lovable AI image generation
    const imageUrl = await generateWithLovableAI(routeName, city, stops);
    return new Response(
      JSON.stringify({ imageUrl, provider: "lovable-ai" }),
      { headers: jsonHeaders }
    );
  } catch (e) {
    console.error("generate-route-poster error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
