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

const accentColors = ["#C75B3A", "#8B4F6E", "#2A7B6F", "#D4943A", "#5B7FA5", "#6B8E5A"];

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length + word.length + 1 > maxChars) {
      lines.push(current.trim());
      current = word + ' ';
    } else {
      current += word + ' ';
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines.slice(0, 2); // max 2 lines
}

function generateSVGPoster(routeName: string, city: string, stops: any[]): string {
  const W = 420;
  const headerH = 240;
  const stopH = 130;
  const footerH = 100;
  const totalH = headerH + stops.length * stopH + footerH;

  // Build stop cards
  const stopsMarkup = stops.map((s: any, i: number) => {
    const y = headerH + i * stopH;
    const color = accentColors[i % accentColors.length];
    const emoji = stopEmoji[s.type] || "📍";
    const nameLines = wrapText(s.name, 26);
    const descLines = wrapText((s.description || '').substring(0, 90), 38);

    const nameMarkup = nameLines.map((line, li) =>
      `<text x="78" y="${y + 38 + li * 20}" font-family="Georgia, serif" font-size="15" font-weight="bold" fill="#2a2a2a">${escapeXml(line)}</text>`
    ).join('');

    const descY = y + 38 + nameLines.length * 20 + 4;
    const descMarkup = descLines.map((line, li) =>
      `<text x="78" y="${descY + li * 16}" font-family="system-ui, sans-serif" font-size="11" fill="#777">${escapeXml(line)}</text>`
    ).join('');

    return `
      <!-- Stop ${i + 1} background -->
      <rect x="24" y="${y + 10}" width="${W - 48}" height="${stopH - 20}" rx="14" fill="white" opacity="0.7"/>
      <rect x="24" y="${y + 10}" width="${W - 48}" height="${stopH - 20}" rx="14" fill="none" stroke="${color}" stroke-width="1" opacity="0.2"/>
      
      <!-- Number badge -->
      <circle cx="48" cy="${y + 40}" r="14" fill="${color}" opacity="0.12"/>
      <text x="48" y="${y + 45}" text-anchor="middle" font-family="Georgia, serif" font-size="13" font-weight="bold" fill="${color}">${i + 1}</text>
      
      <!-- Connector line -->
      ${i < stops.length - 1 ? `<line x1="48" y1="${y + 54}" x2="48" y2="${y + stopH + 26}" stroke="${color}" stroke-width="1.5" stroke-dasharray="3,5" opacity="0.25"/>` : ''}
      
      <!-- Content -->
      ${nameMarkup}
      ${descMarkup}
      
      <!-- Duration pill -->
      <rect x="${W - 110}" y="${y + 18}" width="70" height="22" rx="11" fill="${color}" opacity="0.08"/>
      <text x="${W - 75}" y="${y + 33}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" fill="${color}" font-weight="600">${escapeXml(s.duration || '')}</text>
      
      <!-- Emoji -->
      <text x="${W - 50}" y="${y + stopH - 20}" font-size="18" text-anchor="middle" opacity="0.4">${emoji}</text>
    `;
  }).join('');

  // Title handling — wrap long titles
  const titleLines = wrapText(routeName, 24);
  const titleMarkup = titleLines.map((line, i) =>
    `<text x="${W / 2}" y="${115 + i * 32}" text-anchor="middle" font-family="Georgia, serif" font-size="26" font-weight="bold" fill="#2a2a2a">${escapeXml(line)}</text>`
  ).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${totalH}" width="${W}" height="${totalH}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0%" stop-color="#FDF6EE"/>
        <stop offset="50%" stop-color="#FFF8F2"/>
        <stop offset="100%" stop-color="#F9F0E5"/>
      </linearGradient>
      <linearGradient id="headerGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2A5A4A" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="#2A5A4A" stop-opacity="0"/>
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="${W}" height="${totalH}" fill="url(#bg)" rx="24"/>
    
    <!-- Subtle border -->
    <rect x="8" y="8" width="${W - 16}" height="${totalH - 16}" fill="none" stroke="#d8ccbe" stroke-width="0.8" rx="20"/>
    
    <!-- Header area -->
    <rect x="8" y="8" width="${W - 16}" height="200" fill="url(#headerGrad)" rx="20"/>
    
    <!-- Decorative dots -->
    <circle cx="50" cy="40" r="3" fill="#C75B3A" opacity="0.15"/>
    <circle cx="65" cy="48" r="2" fill="#2A7B6F" opacity="0.15"/>
    <circle cx="${W - 50}" cy="45" r="2.5" fill="#D4943A" opacity="0.15"/>
    <circle cx="${W - 70}" cy="35" r="2" fill="#8B4F6E" opacity="0.15"/>
    
    <!-- YOUR EVENING label -->
    <text x="${W / 2}" y="60" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#b8a08a" letter-spacing="5" font-weight="600">YOUR EVENING</text>
    
    <!-- Decorative line -->
    <line x1="${W / 2 - 30}" y1="75" x2="${W / 2 + 30}" y2="75" stroke="#d8ccbe" stroke-width="0.8"/>
    
    <!-- Route title -->
    ${titleMarkup}
    
    <!-- City + stops info -->
    ${city ? `<text x="${W / 2}" y="${115 + titleLines.length * 32 + 8}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#aaa">${escapeXml(city)}  ·  ${stops.length} stops</text>` : ''}
    
    <!-- Divider -->
    <line x1="60" y1="${headerH - 15}" x2="${W - 60}" y2="${headerH - 15}" stroke="#e5ddd3" stroke-width="0.6"/>
    
    <!-- Stops -->
    ${stopsMarkup}
    
    <!-- Footer -->
    <line x1="100" y1="${totalH - 75}" x2="${W - 100}" y2="${totalH - 75}" stroke="#e5ddd3" stroke-width="0.6"/>
    <text x="${W / 2}" y="${totalH - 42}" text-anchor="middle" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#2A5A4A">Veya</text>
    <text x="${W / 2}" y="${totalH - 22}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" fill="#c4b09a" letter-spacing="3">CURATED EVENINGS</text>
  </svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
