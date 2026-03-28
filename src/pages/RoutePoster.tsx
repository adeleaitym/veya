import { useNavigate, useSearchParams } from "react-router-dom";

const accentColors = ["#C75B3A", "#8B4F6E", "#2A7B6F", "#D4943A", "#5B7FA5", "#6B8E5A"];

const stopEmoji: Record<string, string> = {
  drink: "🍷", cocktail: "🍸", coffee: "☕", appetizer: "🥗",
  main: "🍽️", dessert: "🍰", snack: "🥨", experience: "✨",
  viewpoint: "🌅", culture: "🎨", music: "🎵", nightlife: "🌙", walk: "🚶",
};

const RoutePoster = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const routeName = searchParams.get("routeName") || "My Night";
  const city = searchParams.get("city") || "";

  let stops: any[] = [];
  try {
    stops = JSON.parse(searchParams.get("stops") || "[]");
  } catch {
    stops = [];
  }

  const handleShare = async () => {
    const text = `✦ ${routeName} — ${city}\n\n${stops.map((s: any, i: number) => `${i + 1}. ${s.name} ${stopEmoji[s.type] || "📍"}`).join("\n")}\n\nPlanned with Veya ✦\nhttps://veya-veya.lovable.app`;
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

      {/* The Poster */}
      <section className="w-full max-w-md mx-auto px-4 mt-2">
        <div
          className="relative overflow-hidden rounded-3xl shadow-2xl"
          style={{
            background: "linear-gradient(170deg, #1a1a2e 0%, #16213e 35%, #0f3460 70%, #1a1a2e 100%)",
            minHeight: 520,
          }}
        >
          {/* Star field */}
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 2 + 1,
                height: Math.random() * 2 + 1,
                background: "white",
                opacity: Math.random() * 0.4 + 0.1,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
            />
          ))}

          {/* Glow orb */}
          <div
            className="absolute rounded-full"
            style={{
              width: 200,
              height: 200,
              background: "radial-gradient(circle, rgba(199,91,58,0.15) 0%, transparent 70%)",
              top: -40,
              right: -40,
            }}
          />

          {/* Header area */}
          <div className="relative z-10 px-7 pt-8 pb-4 text-center">
            <p
              className="font-body text-[9px] tracking-[0.35em] uppercase"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Tonight's Route
            </p>
            <h2
              className="font-display text-[32px] leading-[1.1] font-bold mt-2"
              style={{ color: "#fff" }}
            >
              {routeName}
            </h2>
            <p
              className="font-body text-xs mt-2"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {city}
            </p>
          </div>

          {/* Route Map Visual */}
          <div className="relative z-10 px-6 pb-6">
            {/* The winding path SVG */}
            <svg
              className="absolute left-0 top-0 w-full h-full pointer-events-none"
              viewBox="0 0 340 500"
              preserveAspectRatio="none"
              style={{ opacity: 0.15 }}
            >
              <path
                d="M170 0 Q 80 60, 170 120 Q 260 180, 170 240 Q 80 300, 170 360 Q 260 420, 170 480"
                fill="none"
                stroke="white"
                strokeWidth="1"
                strokeDasharray="4,6"
              />
            </svg>

            <div className="space-y-0">
              {stops.map((stop: any, i: number) => {
                const color = accentColors[i % accentColors.length];
                const emoji = stopEmoji[stop.type] || "📍";
                const isEven = i % 2 === 0;

                return (
                  <div key={i} className="relative">
                    {/* Connector */}
                    {i < stops.length - 1 && (
                      <div
                        className="absolute w-[1px] z-0"
                        style={{
                          left: isEven ? "32px" : "auto",
                          right: isEven ? "auto" : "32px",
                          top: "52px",
                          height: "calc(100% - 20px)",
                          background: `linear-gradient(to bottom, ${color}60, ${accentColors[(i + 1) % accentColors.length]}60)`,
                        }}
                      />
                    )}

                    <div
                      className="relative z-10 flex gap-3 items-start py-3"
                      style={{
                        flexDirection: isEven ? "row" : "row-reverse",
                        textAlign: isEven ? "left" : "right",
                      }}
                    >
                      {/* Pin */}
                      <div className="flex-shrink-0">
                        <div
                          className="w-[52px] h-[52px] rounded-2xl flex flex-col items-center justify-center relative"
                          style={{
                            background: `linear-gradient(135deg, ${color}25, ${color}10)`,
                            border: `1px solid ${color}40`,
                            boxShadow: `0 0 20px ${color}15`,
                          }}
                        >
                          <span className="text-lg leading-none">{emoji}</span>
                          <span
                            className="font-body text-[8px] font-bold mt-0.5"
                            style={{ color: `${color}` }}
                          >
                            {stop.duration?.replace(" minutes", "min").replace(" hour", "hr")}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pt-1">
                        <p
                          className="font-body text-[9px] font-semibold uppercase tracking-[0.15em]"
                          style={{ color }}
                        >
                          Stop {i + 1}
                        </p>
                        <h3
                          className="font-display text-[18px] font-bold leading-snug mt-0.5"
                          style={{ color: "#fff" }}
                        >
                          {stop.name}
                        </h3>
                        <p
                          className="font-body text-[10px] leading-relaxed mt-1 line-clamp-2"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          {stop.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-center pb-7 pt-2">
            <div
              className="w-12 h-[1px] mx-auto mb-4"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
            />
            <p className="font-display text-lg font-bold" style={{ color: "#fff" }}>
              Veya
            </p>
            <p
              className="font-body text-[8px] tracking-[0.3em] uppercase mt-0.5"
              style={{ color: "rgba(255,255,255,0.25)" }}
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
