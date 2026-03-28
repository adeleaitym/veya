import { useNavigate, useSearchParams } from "react-router-dom";
import { Wine, Martini, Coffee, Salad, UtensilsCrossed, Cake, Cookie, Sparkles, Sunrise, Palette, Music, Moon, Footprints, MapPin, Download, Share2 } from "lucide-react";
import { useRef, useCallback } from "react";

const accentColors = ["#C75B3A", "#8B4F6E", "#2A7B6F", "#D4943A", "#5B7FA5", "#6B8E5A"];

const stopIcons: Record<string, React.ElementType> = {
  drink: Wine, cocktail: Martini, coffee: Coffee, appetizer: Salad,
  main: UtensilsCrossed, dessert: Cake, snack: Cookie, experience: Sparkles,
  viewpoint: Sunrise, culture: Palette, music: Music, nightlife: Moon, walk: Footprints,
};

const stopLabels: Record<string, string> = {
  drink: "Drinks", cocktail: "Cocktails", coffee: "Coffee", appetizer: "Starter",
  main: "Dinner", dessert: "Dessert", snack: "Snack", experience: "Experience",
  viewpoint: "Viewpoint", culture: "Culture", music: "Live Music", nightlife: "Nightlife", walk: "Walk",
};

// Organic blob shapes as SVG paths
const blobPaths = [
  "M45,-30C55,-15,58,5,50,22C42,39,22,52,2,52C-18,52,-38,40,-48,22C-58,4,-58,-20,-45,-34C-32,-48,-6,-52,12,-48C30,-44,35,-45,45,-30Z",
  "M40,-35C52,-20,55,0,48,18C41,36,24,50,5,50C-14,50,-35,38,-45,20C-55,2,-55,-22,-42,-36C-29,-50,-3,-54,15,-48C33,-42,28,-50,40,-35Z",
  "M35,-40C50,-25,55,-5,48,15C41,35,22,48,0,48C-22,48,-38,35,-48,18C-58,1,-55,-20,-42,-35C-29,-50,0,-55,18,-48C36,-41,20,-55,35,-40Z",
];

const RoutePoster = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const posterRef = useRef<HTMLDivElement>(null);

  const routeName = searchParams.get("routeName") || "My Night";
  const city = searchParams.get("city") || "";

  let stops: any[] = [];
  try {
    stops = JSON.parse(searchParams.get("stops") || "[]");
  } catch {
    stops = [];
  }

  const handleShare = async () => {
    const text = `✦ ${routeName} — ${city}\n\n${stops.map((s: any, i: number) => `${i + 1}. ${s.name} (${stopLabels[s.type] || s.type})`).join("\n")}\n\nPlanned with Veya ✦\nhttps://veya-veya.lovable.app`;
    try {
      if (navigator.share) {
        await navigator.share({ title: routeName, text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      await navigator.clipboard.writeText(text);
    }
  };

  // Decorative doodle elements
  const Doodles = useCallback(() => (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 700" fill="none">
      {/* Scattered stars */}
      <path d="M50 80 L52 74 L54 80 L60 82 L54 84 L52 90 L50 84 L44 82Z" fill="#D4943A" opacity="0.6" />
      <path d="M340 120 L342 114 L344 120 L350 122 L344 124 L342 130 L340 124 L334 122Z" fill="#8B4F6E" opacity="0.5" />
      <path d="M70 620 L72 614 L74 620 L80 622 L74 624 L72 630 L70 624 L64 622Z" fill="#2A7B6F" opacity="0.5" />
      <path d="M320 580 L322 576 L324 580 L328 581 L324 583 L322 587 L320 583 L316 581Z" fill="#C75B3A" opacity="0.4" />
      
      {/* Squiggly lines */}
      <path d="M20 200 C30 190, 40 210, 50 200 C60 190, 70 210, 80 200" stroke="#8B4F6E" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      <path d="M320 400 C330 390, 340 410, 350 400 C360 390, 370 410, 380 400" stroke="#2A7B6F" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      
      {/* Small circles / dots */}
      <circle cx="360" cy="60" r="4" fill="#D4943A" opacity="0.3" />
      <circle cx="30" cy="350" r="3" fill="#5B7FA5" opacity="0.3" />
      <circle cx="370" cy="500" r="5" fill="#C75B3A" opacity="0.2" />
      <circle cx="25" cy="550" r="3" fill="#8B4F6E" opacity="0.25" />
      
      {/* Abstract shapes */}
      <rect x="345" y="250" width="12" height="12" rx="2" stroke="#D4943A" strokeWidth="1" opacity="0.25" transform="rotate(15 351 256)" />
      <rect x="30" cy="450" width="10" height="10" rx="1" stroke="#5B7FA5" strokeWidth="1" opacity="0.2" transform="rotate(-10 35 455)" />
      
      {/* Crescents / moons */}
      <path d="M355 180 C365 170, 375 185, 365 195 C355 200, 345 190, 355 180Z" fill="#D4943A" opacity="0.15" />
    </svg>
  ), []);

  return (
    <div className="min-h-screen paper-texture flex flex-col items-center">
      <header className="w-full max-w-md mx-auto px-6 pt-10 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="text-ink/40 font-body text-sm mb-4 hover:text-ink transition-colors"
        >
          ← Back to route
        </button>
      </header>

      {/* The Poster — Editorial Art Print Style */}
      <section className="w-full max-w-md mx-auto px-4 mt-2">
        <div
          ref={posterRef}
          className="relative overflow-hidden rounded-[28px]"
          style={{
            background: "#FAF3E8",
            border: "2px solid #2a2a2a",
            minHeight: 580,
          }}
        >
          {/* Background texture grain */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}
          />

          {/* Decorative doodles */}
          <Doodles />

          {/* Color blob accents */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-[0.08]" style={{ background: accentColors[0] }} />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-[0.06]" style={{ background: accentColors[2] }} />

          {/* Header strip */}
          <div className="relative z-10 px-7 pt-7 pb-1">
            <div className="flex items-center justify-between">
              <p
                className="font-body text-[9px] tracking-[0.4em] uppercase font-semibold"
                style={{ color: "#2a2a2a80" }}
              >
                Tonight's Route
              </p>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColors[0] }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColors[2] }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColors[1] }} />
              </div>
            </div>
          </div>

          {/* Title — big editorial type */}
          <div className="relative z-10 px-7 pt-2 pb-5">
            <h2
              className="font-display text-[38px] leading-[1.05] font-bold"
              style={{ color: "#2a2a2a" }}
            >
              {routeName}
            </h2>
            <div className="flex items-center gap-2 mt-2.5">
              <span
                className="inline-block px-3 py-1 rounded-full font-body text-[10px] font-bold tracking-wide uppercase"
                style={{
                  background: "#2a2a2a",
                  color: "#FAF3E8",
                }}
              >
                {city}
              </span>
              <span
                className="font-body text-[10px]"
                style={{ color: "#2a2a2a50" }}
              >
                {stops.length} stops
              </span>
            </div>
          </div>

          {/* Divider — hand-drawn style */}
          <div className="relative z-10 px-7">
            <svg width="100%" height="4" viewBox="0 0 350 4" className="overflow-visible">
              <path
                d="M0 2 C50 0, 100 4, 150 2 C200 0, 250 4, 350 2"
                stroke="#2a2a2a"
                strokeWidth="1.5"
                fill="none"
                opacity="0.15"
              />
            </svg>
          </div>

          {/* Stops — editorial card layout */}
          <div className="relative z-10 px-5 pt-5 pb-4">
            <div className="space-y-2.5">
              {stops.map((stop: any, i: number) => {
                const color = accentColors[i % accentColors.length];
                const IconComponent = stopIcons[stop.type] || MapPin;
                const label = stopLabels[stop.type] || stop.type;

                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3.5 rounded-2xl relative overflow-hidden"
                    style={{
                      background: `${color}08`,
                      border: `1.5px solid ${color}20`,
                    }}
                  >
                    {/* Blob background */}
                    <svg
                      className="absolute -right-4 -bottom-4 opacity-[0.06]"
                      width="80" height="80" viewBox="-60 -60 120 120"
                    >
                      <path d={blobPaths[i % blobPaths.length]} fill={color} />
                    </svg>

                    {/* Number + Icon */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center relative"
                        style={{
                          background: `${color}18`,
                          border: `1.5px solid ${color}35`,
                        }}
                      >
                        <IconComponent size={18} color={color} strokeWidth={2} />
                      </div>
                      <span
                        className="font-display text-[10px] font-bold"
                        style={{ color: `${color}90` }}
                      >
                        #{i + 1}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-body text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full"
                          style={{
                            background: `${color}15`,
                            color: color,
                          }}
                        >
                          {label}
                        </span>
                        <span
                          className="font-body text-[9px]"
                          style={{ color: "#2a2a2a40" }}
                        >
                          {stop.duration}
                        </span>
                      </div>
                      <h3
                        className="font-display text-[17px] font-bold leading-snug mt-1"
                        style={{ color: "#2a2a2a" }}
                      >
                        {stop.name}
                      </h3>
                      <p
                        className="font-body text-[10px] leading-relaxed mt-0.5 line-clamp-1"
                        style={{ color: "#2a2a2a50" }}
                      >
                        {stop.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 px-7 pt-3 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-xl font-bold" style={{ color: "#2a2a2a" }}>
                  Veya
                </p>
                <p
                  className="font-body text-[8px] tracking-[0.3em] uppercase -mt-0.5"
                  style={{ color: "#2a2a2a30" }}
                >
                  Curated Evenings ✦
                </p>
              </div>
              <div
                className="font-body text-[8px] text-right leading-relaxed"
                style={{ color: "#2a2a2a25" }}
              >
                veya-veya.lovable.app
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="w-full max-w-md mx-auto px-6 mt-8 mb-10 space-y-3">
        <button onClick={handleShare} className="zine-btn flex items-center justify-center gap-2">
          <Share2 size={16} />
          Share your night ✦
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 font-body text-base text-ink/50 hover:text-ink transition-colors"
        >
          Back to route
        </button>
      </section>
    </div>
  );
};

export default RoutePoster;
