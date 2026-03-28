import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

const stopEmoji: Record<string, string> = {
  drink: "🍷",
  cocktail: "🍸",
  coffee: "☕",
  appetizer: "🥗",
  main: "🍽️",
  dessert: "🍰",
  snack: "🥨",
  experience: "✨",
};

const stopColors = [
  "from-rose-400/20 to-rose-400/5",
  "from-amber-400/20 to-amber-400/5",
  "from-emerald-400/20 to-emerald-400/5",
  "from-violet-400/20 to-violet-400/5",
  "from-sky-400/20 to-sky-400/5",
  "from-pink-400/20 to-pink-400/5",
];

const RouteView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vibe = searchParams.get("vibe") || "";
  const where = searchParams.get("where") || "";
  const budget = searchParams.get("budget") || "";
  const time = searchParams.get("time") || "";
  const food = searchParams.get("food") || "";
  const city = searchParams.get("city") || where;

  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateRoute = async () => {
      setLoading(true);
      setError(null);
      try {
        const message = `Vibe: ${vibe}. Neighborhood: ${where}. City: ${city}. Budget: ${budget}. Time: ${time}. Food: ${food}. Please suggest REAL existing venues in ${city}.`;
        const { data, error: fnError } = await supabase.functions.invoke("generate-route", {
          body: { message, city },
        });
        if (fnError) throw fnError;
        const parsed: RouteData = typeof data.route === "string" ? JSON.parse(data.route) : data.route;
        setRoute(parsed);
      } catch (e: any) {
        setError(e.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    generateRoute();
  }, [vibe, where, budget, time, food]);

  if (loading) {
    return (
      <div className="min-h-screen paper-texture flex flex-col items-center justify-center gap-5 px-8">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-[3px] border-ink/10 border-t-secondary animate-spin" />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">✦</span>
        </div>
        <div className="text-center">
          <p className="font-display text-2xl font-bold text-ink">Crafting your night</p>
          <p className="font-body text-sm text-ink/35 mt-1">Finding the perfect spots...</p>
        </div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="min-h-screen paper-texture flex flex-col items-center justify-center gap-4 px-6">
        <p className="font-display text-3xl text-ink">Oops ✦</p>
        <p className="font-body text-sm text-ink/50 text-center">{error || "Could not generate route"}</p>
        <button onClick={() => navigate(-1)} className="zine-btn mt-4">Try again</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-texture flex flex-col">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-5 pt-8 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="text-ink/40 font-body text-sm mb-3 hover:text-ink transition-colors"
        >
          ← Back
        </button>

        {/* Route title card */}
        <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-2xl p-5 border border-secondary/10">
          <span className="font-body text-xs text-secondary uppercase tracking-widest">Your route</span>
          <h1 className="text-3xl font-display font-bold text-ink leading-tight mt-1">
            {route.routeName}
          </h1>
          <p className="text-ink/45 font-body text-sm mt-2 leading-relaxed">{route.description}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="font-body text-xs text-ink/30 bg-ink/5 px-2.5 py-1 rounded-full">
              {route.stops.length} stops
            </span>
            <span className="font-body text-xs text-ink/30 bg-ink/5 px-2.5 py-1 rounded-full">
              {city}
            </span>
          </div>
        </div>
      </header>

      {/* Stops */}
      <div className="flex-1 w-full max-w-md mx-auto px-5 mt-6 pb-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[18px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-secondary/30 via-ink/10 to-ink/5" />

          <div className="space-y-3">
            {route.stops.map((stop, i) => (
              <button
                key={i}
                onClick={() =>
                  navigate(
                    `/stop?index=${i}&name=${encodeURIComponent(stop.name)}&type=${stop.type}&desc=${encodeURIComponent(stop.description)}&duration=${encodeURIComponent(stop.duration)}`
                  )
                }
                className="relative w-full text-left pl-12 group"
              >
                {/* Number dot */}
                <div className="absolute left-1.5 top-5 w-[26px] h-[26px] rounded-full bg-paper border-2 border-ink/15 flex items-center justify-center z-10 group-hover:border-secondary group-hover:bg-secondary/10 transition-all shadow-sm">
                  <span className="font-display text-xs font-bold text-ink/50 group-hover:text-secondary transition-colors">
                    {i + 1}
                  </span>
                </div>

                {/* Card */}
                <div className={`bg-gradient-to-r ${stopColors[i % stopColors.length]} rounded-2xl p-4 border border-ink/5 group-hover:border-ink/15 transition-all group-hover:shadow-md`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{stopEmoji[stop.type] || "📍"}</span>
                        <h3 className="font-display text-lg font-bold text-ink leading-snug truncate">
                          {stop.name}
                        </h3>
                      </div>
                      <p className="font-body text-xs text-ink/40 mt-1.5 line-clamp-2 leading-relaxed">
                        {stop.description}
                      </p>
                    </div>
                    <span className="text-[11px] font-body text-ink/30 bg-white/60 px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5">
                      {stop.duration}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="w-full max-w-md mx-auto px-5 py-6 space-y-3">
        <button
          onClick={() => {
            const params = new URLSearchParams({
              route: JSON.stringify(route),
              city: city,
            });
            navigate(`/booking?${params.toString()}`);
          }}
          className="zine-btn"
        >
          Book this night →
        </button>
        <button
          onClick={() => navigate(`/tonight?route=${encodeURIComponent(JSON.stringify(route))}`)}
          className="w-full py-3 font-display text-base font-bold text-ink/40 hover:text-ink/60 transition-colors"
        >
          Skip booking, go now
        </button>
        <button
          onClick={() => {
            const stopsParam = encodeURIComponent(JSON.stringify(route.stops));
            navigate(`/poster?routeName=${encodeURIComponent(route.routeName)}&city=${encodeURIComponent(where)}&stops=${stopsParam}`);
          }}
          className="w-full py-2 font-body text-sm text-secondary hover:text-secondary/80 transition-colors"
        >
          Get your poster ✦
        </button>
      </div>
    </div>
  );
};

export default RouteView;
