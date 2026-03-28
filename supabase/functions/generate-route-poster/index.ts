import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

const stopEmoji: Record<string, string> = {
  drink: "🍷", cocktail: "🍸", coffee: "☕", appetizer: "🥗",
  main: "🍽️", dessert: "🍰", snack: "🥨", experience: "✨",
};

function generateSVGPoster(routeName: string, city: string, stops: any[]): string {
  const colors = ["#E8485C", "#F5A623", "#4ECDC4", "#7B68EE", "#FF6B9D", "#45B7D1"];

  const stopsMarkup = stops.map((s: any, i: number) => {
    const y = 280 + i * 110;
    const color = colors[i % colors.length];
    const emoji = stopEmoji[s.type] || "📍";
    return `
      <circle cx="60" cy="${y}" r="18" fill="${color}" opacity="0.15"/>
      <circle cx="60" cy="${y}" r="10" fill="${color}"/>
      <text x="60" y="${y + 5}" text-anchor="middle" font-size="10">${emoji}</text>
      ${i < stops.length - 1 ? `<line x1="60" y1="${y + 18}" x2="60" y2="${y + 92}" stroke="${color}" stroke-width="2" stroke-dasharray="4,4" opacity="0.3"/>` : ''}
      <text x="90" y="${y - 6}" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#1a1a1a">${escapeXml(s.name)}</text>
      <text x="90" y="${y + 12}" font-family="system-ui, sans-serif" font-size="11" fill="#888">${escapeXml((s.description || '').substring(0, 50))}${(s.description || '').length > 50 ? '…' : ''}</text>
      <text x="340" y="${y}" font-family="system-ui, sans-serif" font-size="10" fill="#aaa" text-anchor="end">${escapeXml(s.duration || '')}</text>
    `;
  }).join('');

  const height = 320 + stops.length * 110;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 ${height}" width="380" height="${height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFF8F0"/>
        <stop offset="100%" stop-color="#FFF0E6"/>
      </linearGradient>
    </defs>
    <rect width="380" height="${height}" fill="url(#bg)" rx="20"/>
    <rect x="6" y="6" width="368" height="${height - 12}" fill="none" stroke="#e0d5c8" stroke-width="1" rx="16" stroke-dasharray="6,4"/>
    
    <!-- Header -->
    <text x="190" y="55" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#c4956a" letter-spacing="4">YOUR EVENING</text>
    <text x="190" y="110" text-anchor="middle" font-family="Georgia, serif" font-size="26" font-weight="bold" fill="#1a1a1a">${escapeXml(truncate(routeName, 28))}</text>
    ${city ? `<text x="190" y="140" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" fill="#999">${escapeXml(city)}</text>` : ''}
    
    <line x1="140" y1="165" x2="240" y2="165" stroke="#ddd" stroke-width="1"/>
    
    <text x="190" y="195" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" fill="#bbb" letter-spacing="3">${stops.length} STOPS</text>
    
    <!-- Stops -->
    ${stopsMarkup}
    
    <!-- Footer -->
    <text x="190" y="${height - 35}" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#c4956a">Veya ✦</text>
  </svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.substring(0, max - 1) + '…' : s;
}

async function generateWithDust(routeName: string, city: string, stops: any[]): Promise<{ imageUrl?: string; textContent?: string }> {
  const DUST_API_KEY = Deno.env.get("DUST_API_KEY");
  const DUST_WORKSPACE_ID = Deno.env.get("DUST_WORKSPACE_ID");

  if (!DUST_API_KEY || !DUST_WORKSPACE_ID) throw new Error("Dust not configured");

  const stopsList = stops
    .map((s: any, i: number) => `${i + 1}. ${s.name} (${s.type}) - ${s.description || ""}`)
    .join("\n");

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
          content: `Create a beautiful illustrated poster for this evening route:\n\nRoute: "${routeName}"\nCity: ${city || "Unknown"}\n\nStops:\n${stopsList}\n\nPlease generate a visually stunning poster illustration. Portrait orientation, stylish and shareable.`,
          mentions: [{ configurationId: "StyleForge" }],
          context: { timezone: "Europe/Stockholm", username: "veya-app", profilePictureUrl: null, fullName: "Veya App", email: null, origin: "api" },
        },
        blocking: true,
      }),
    }
  );

  if (!convResp.ok) {
    const errText = await convResp.text();
    console.error("Dust error:", convResp.status, errText.substring(0, 300));
    throw new Error(`Dust API error: ${convResp.status}`);
  }

  const convData = await convResp.json();
  const agentMessages = convData.conversation?.content?.flat()?.filter(
    (msg: any) => msg.type === "agent_message"
  ) || [];

  for (const agentMsg of agentMessages) {
    if (agentMsg.rawContents) {
      for (const content of agentMsg.rawContents) {
        if (content.contentType?.startsWith("image/") && content.url) return { imageUrl: content.url };
      }
    }
    if (agentMsg.content) {
      const text = agentMsg.content;
      const mdImgMatch = text.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
      if (mdImgMatch) return { imageUrl: mdImgMatch[1] };
      const imgMatch = text.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|gif|webp|svg)[^\s"']*/i);
      if (imgMatch) return { imageUrl: imgMatch[0] };
      return { textContent: text };
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
      return new Response(JSON.stringify({ error: "Missing route details" }), { status: 400, headers: jsonHeaders });
    }

    // Try Dust first
    try {
      const dustResult = await generateWithDust(routeName, city, stops);
      if (dustResult.imageUrl) {
        return new Response(JSON.stringify({ imageUrl: dustResult.imageUrl, provider: "dust-styleforge" }), { headers: jsonHeaders });
      }
    } catch (dustErr) {
      console.log("Dust unavailable:", (dustErr as Error).message);
    }

    // Fallback: generate SVG poster
    console.log("Using SVG fallback poster");
    const svg = generateSVGPoster(routeName, city, stops);
    const svgBase64 = btoa(unescape(encodeURIComponent(svg)));
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

    return new Response(
      JSON.stringify({ imageUrl: dataUrl, provider: "svg-fallback" }),
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
