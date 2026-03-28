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

const RouteView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vibe = searchParams.get("vibe") || "";
  const where = searchParams.get("where") || "";
  const budget = searchParams.get("budget") || "";
  const time = searchParams.get("time") || "";
  const food = searchParams.get("food") || "";

  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateRoute = async () => {
      setLoading(true);
      setError(null);
      try {
        const message = `Vibe: ${vibe}. Location: ${where}. Budget: ${budget}. Time: ${time}. Food: ${food}.`;
        const { data, error: fnError } = await supabase.functions.invoke("generate-route", {
          body: { message, city: where },
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
      <div className="min-h-screen paper-texture flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-3 border-ink/15 border-t-primary animate-spin" />
        <p className="font-display text-2xl text-ink/60">Crafting your night...</p>
        <p className="font-body text-sm text-ink/30">Finding the best spots</p>
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
      <header className="w-full max-w-md mx-auto px-6 pt-12 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="text-ink/40 font-body text-sm mb-4 hover:text-ink transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-display font-bold text-ink leading-tight">
          {route.routeName}
        </h1>
        <p className="text-ink/40 font-body text-sm mt-1">{route.description}</p>
      </header>

      {/* Stops timeline */}
      <div className="flex-1 w-full max-w-md mx-auto px-6 mt-8 pb-8">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-2 bottom-2 w-[2px] bg-ink/10" />

          <div className="space-y-1">
            {route.stops.map((stop, i) => (
              <button
                key={i}
                onClick={() => navigate(`/stop?index=${i}&name=${encodeURIComponent(stop.name)}&type=${stop.type}&desc=${encodeURIComponent(stop.description)}&duration=${encodeURIComponent(stop.duration)}`)}
                className="relative w-full text-left pl-14 pr-2 py-4 group"
              >
                {/* Dot */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-paper border-2 border-ink/20 flex items-center justify-center text-xs z-10 group-hover:border-primary group-hover:bg-primary/10 transition-colors">
                  <span>{stopIcons[stop.type] || "📍"}</span>
                </div>

                <div className="zine-card group-hover:border-ink/25 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-ink leading-snug">
                        {stop.name}
                      </h3>
                      <p className="font-body text-xs text-ink/40 mt-1">
                        {stop.description}
                      </p>
                    </div>
                    <span className="text-xs font-body text-ink/30 whitespace-nowrap mt-1">
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
      <div className="w-full max-w-md mx-auto px-6 py-6 space-y-3">
        <button
          onClick={() => navigate(`/tonight?route=${encodeURIComponent(JSON.stringify(route))}`)}
          className="zine-btn"
        >
          Start my night →
        </button>
        <button
          onClick={() => {
            const stopsParam = encodeURIComponent(JSON.stringify(route.stops));
            navigate(`/poster?routeName=${encodeURIComponent(route.routeName)}&city=${encodeURIComponent(where)}&stops=${stopsParam}`);
          }}
          className="w-full py-3 font-body text-base font-semibold text-secondary hover:text-secondary/80 transition-colors"
        >
          Get your poster ✦
        </button>
      </div>
    </div>
  );
};

export default RouteView;
