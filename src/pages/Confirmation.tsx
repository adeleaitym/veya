import { useNavigate, useSearchParams } from "react-router-dom";

type RouteStop = {
  order: number;
  name: string;
  type: string;
  description: string;
  duration: string;
};

type RouteData = {
  routeName: string;
  description: string;
  stops: RouteStop[];
};

const stopIcons: Record<string, string> = {
  drink: "🍷",
  cocktail: "🍸",
  coffee: "☕",
  appetizer: "🥗",
  main: "🍽️",
  dessert: "🍰",
  snack: "🥨",
  experience: "✨",
};

const Confirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  let route: RouteData | null = null;
  try {
    route = JSON.parse(searchParams.get("route") || "null");
  } catch {
    route = null;
  }

  const city = searchParams.get("city") || "";

  if (!route) {
    return (
      <div className="min-h-screen paper-texture flex flex-col items-center justify-center gap-4 px-6">
        <p className="font-display text-3xl text-ink">No route found ✦</p>
        <button onClick={() => navigate("/")} className="zine-btn mt-4">
          Start over
        </button>
      </div>
    );
  }

  const handleShare = async () => {
    const text = `${route!.routeName}\n${route!.stops.map((s, i) => `${i + 1}. ${s.name}`).join("\n")}\n\nPlanned with Veya ✦`;
    if (navigator.share) {
      try {
        await navigator.share({ title: route!.routeName, text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="min-h-screen paper-texture flex flex-col">
      {/* Header celebration */}
      <header className="w-full max-w-md mx-auto px-6 pt-16 pb-2 text-center">
        <p className="text-6xl mb-4 animate-fade-up">✦</p>
        <h1 className="text-4xl font-display font-bold text-ink leading-tight animate-fade-up" style={{ animationDelay: "100ms" }}>
          You're all set!
        </h1>
        <p className="text-ink/40 font-body text-sm mt-2 animate-fade-up" style={{ animationDelay: "200ms" }}>
          {route.routeName} · {city}
        </p>
      </header>

      {/* Route summary card */}
      <div className="w-full max-w-md mx-auto px-6 mt-8">
        <div className="zine-card p-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
          <h2 className="font-display text-xl font-bold text-ink mb-4">Your evening</h2>
          <div className="space-y-4">
            {route.stops.map((stop, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-secondary/10 flex items-center justify-center text-lg flex-shrink-0">
                  {stopIcons[stop.type] || "📍"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm font-bold text-ink truncate">
                    {stop.name}
                  </p>
                  <p className="font-body text-xs text-ink/35">{stop.duration}</p>
                </div>
                <span className="text-xs font-body text-ink/25 flex-shrink-0">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="w-full max-w-md mx-auto px-6 mt-6 animate-fade-up" style={{ animationDelay: "400ms" }}>
        <div className="zine-card p-5 bg-secondary/5 border-secondary/15">
          <p className="font-display text-sm font-bold text-secondary mb-1">Pro tip ✦</p>
          <p className="font-body text-xs text-ink/50">
            Save your poster to share with friends, or start the live tracker when you head out.
          </p>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex-1" />
      <div className="w-full max-w-md mx-auto px-6 py-8 space-y-3 animate-fade-up" style={{ animationDelay: "500ms" }}>
        <button
          onClick={() => {
            const routeParam = encodeURIComponent(JSON.stringify(route));
            navigate(`/tonight?route=${routeParam}`);
          }}
          className="zine-btn"
        >
          Start my night →
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="flex-1 py-3 rounded-2xl bg-ink/5 hover:bg-ink/10 font-body text-sm text-ink/50 hover:text-ink transition-colors"
          >
            Share ↗
          </button>
          <button
            onClick={() => {
              const stopsParam = encodeURIComponent(JSON.stringify(route!.stops));
              navigate(`/poster?routeName=${encodeURIComponent(route!.routeName)}&city=${encodeURIComponent(city)}&stops=${stopsParam}`);
            }}
            className="flex-1 py-3 rounded-2xl bg-ink/5 hover:bg-ink/10 font-body text-sm text-ink/50 hover:text-ink transition-colors"
          >
            Get poster ✦
          </button>
        </div>
        <button
          onClick={() => navigate("/")}
          className="w-full py-3 font-body text-sm text-ink/30 hover:text-ink/50 transition-colors"
        >
          Back to home
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
