import { useNavigate, useSearchParams } from "react-router-dom";
import { useRef } from "react";

const accentColors = ["#C75B3A", "#8B4F6E", "#2A7B6F", "#D4943A", "#5B7FA5", "#6B8E5A"];

const stopEmoji: Record<string, string> = {
  drink: "🍷", cocktail: "🍸", coffee: "☕", appetizer: "🥗",
  main: "🍽️", dessert: "🍰", snack: "🥨", experience: "✨",
  viewpoint: "🌅", culture: "🎨", music: "🎵", nightlife: "🌙", walk: "🚶",
};

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
    // Try native share with text, fallback to clipboard
    const text = `${routeName} — ${city}\n\n${stops.map((s: any, i: number) => `${i + 1}. ${s.name}`).join("\n")}\n\nPlanned with Veya ✦`;
    try {
      if (navigator.share) {
        await navigator.share({ title: routeName, text });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
      }
    } catch {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen paper-texture flex flex-col items-center">
      <header className="w-full max-w-md mx-auto px-6 pt-10 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="text-ink/40 font-body text-sm mb-4 hover:text-ink transition-colors"
        >
          ← Back to route
        </button>
        <h1 className="text-3xl font-display font-bold text-ink leading-tight">
          Your night, illustrated ✦
        </h1>
        <p className="text-ink/40 font-body text-sm mt-1">
          Save it. Share it. Live it.
        </p>
      </header>

      {/* Poster Card */}
      <section className="w-full max-w-md mx-auto px-5 mt-6">
        <div
          ref={posterRef}
          className="relative overflow-hidden rounded-2xl shadow-2xl"
          style={{
            background: "linear-gradient(165deg, #FDF6EE 0%, #FFF8F2 40%, #F5EDE3 100%)",
            border: "1px solid rgba(200, 185, 165, 0.4)",
          }}
        >
          {/* Inner border */}
          <div
            className="absolute inset-3 rounded-xl pointer-events-none"
            style={{ border: "1px solid rgba(180, 160, 135, 0.2)" }}
          />

          {/* Decorative corner marks */}
          <div className="absolute top-5 left-5 w-4 h-4 border-t border-l" style={{ borderColor: "rgba(180, 160, 135, 0.3)" }} />
          <div className="absolute top-5 right-5 w-4 h-4 border-t border-r" style={{ borderColor: "rgba(180, 160, 135, 0.3)" }} />
          <div className="absolute bottom-5 left-5 w-4 h-4 border-b border-l" style={{ borderColor: "rgba(180, 160, 135, 0.3)" }} />
          <div className="absolute bottom-5 right-5 w-4 h-4 border-b border-r" style={{ borderColor: "rgba(180, 160, 135, 0.3)" }} />

          {/* Header */}
          <div className="px-8 pt-10 pb-6 text-center relative">
            {/* Subtle decorative dots */}
            <div className="absolute top-6 left-8 flex gap-1.5 opacity-20">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColors[0] }} />
              <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: accentColors[2] }} />
            </div>
            <div className="absolute top-6 right-8 flex gap-1.5 opacity-20">
              <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: accentColors[3] }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: accentColors[1] }} />
            </div>

            <p
              className="font-body text-[10px] tracking-[0.3em] uppercase mb-4"
              style={{ color: "#b8a08a" }}
            >
              Your Evening
            </p>
            <div className="w-8 h-[1px] mx-auto mb-5" style={{ background: "#d8ccbe" }} />
            <h2
              className="font-display text-[28px] leading-tight font-bold"
              style={{ color: "#2a2a2a" }}
            >
              {routeName}
            </h2>
            {city && (
              <p
                className="font-body text-xs mt-2"
                style={{ color: "#aaa" }}
              >
                {city} · {stops.length} stops
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="px-12">
            <div className="h-[1px]" style={{ background: "linear-gradient(90deg, transparent, #e0d6ca, transparent)" }} />
          </div>

          {/* Stops */}
          <div className="px-6 py-6 space-y-1">
            {stops.map((stop: any, i: number) => {
              const color = accentColors[i % accentColors.length];
              const emoji = stopEmoji[stop.type] || "📍";
              return (
                <div key={i} className="relative">
                  {/* Connector line */}
                  {i < stops.length - 1 && (
                    <div
                      className="absolute left-[22px] top-[44px] bottom-[-4px] w-[1.5px]"
                      style={{
                        background: `repeating-linear-gradient(to bottom, ${color}33 0px, ${color}33 3px, transparent 3px, transparent 8px)`,
                      }}
                    />
                  )}
                  <div className="flex gap-3 p-3 rounded-xl relative" style={{ background: "rgba(255,255,255,0.5)" }}>
                    {/* Number badge */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div
                        className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-display text-sm font-bold"
                        style={{ background: `${color}15`, color }}
                      >
                        {i + 1}
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="font-display text-[15px] font-bold leading-snug"
                          style={{ color: "#2a2a2a" }}
                        >
                          {stop.name}
                        </h3>
                        <span className="flex-shrink-0 text-sm opacity-30">{emoji}</span>
                      </div>
                      <p
                        className="font-body text-[10px] leading-relaxed mt-1 line-clamp-2"
                        style={{ color: "#999" }}
                      >
                        {stop.description}
                      </p>
                      <span
                        className="inline-block mt-1.5 px-2 py-0.5 rounded-full font-body text-[9px] font-semibold"
                        style={{ background: `${color}10`, color }}
                      >
                        {stop.duration}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-12 pb-2">
            <div className="h-[1px]" style={{ background: "linear-gradient(90deg, transparent, #e0d6ca, transparent)" }} />
          </div>
          <div className="text-center pb-8 pt-4">
            <p
              className="font-display text-xl font-bold"
              style={{ color: "#2A5A4A" }}
            >
              Veya
            </p>
            <p
              className="font-body text-[8px] tracking-[0.25em] uppercase mt-1"
              style={{ color: "#c4b09a" }}
            >
              Curated Evenings
            </p>
          </div>
        </div>
      </section>

      {/* Actions */}
      <section className="w-full max-w-md mx-auto px-6 mt-8 mb-10 space-y-3">
        <button onClick={handleShare} className="zine-btn">
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
