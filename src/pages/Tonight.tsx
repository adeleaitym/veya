import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

type RouteStop = {
  order: number;
  name: string;
  type: string;
  description: string;
  duration: string;
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

const Tonight = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStop, setCurrentStop] = useState(0);

  let stops: RouteStop[] = [];
  try {
    const routeData = JSON.parse(searchParams.get("route") || "{}");
    stops = routeData.stops || [];
  } catch {
    stops = [];
  }

  const now = stops[currentStop];
  const next = stops[currentStop + 1];

  if (!now) {
    return (
      <div className="min-h-screen paper-texture flex flex-col items-center justify-center gap-4 px-6">
        <p className="font-display text-3xl text-ink">Night complete! ✦</p>
        <button onClick={() => navigate("/feedback")} className="zine-btn mt-4">
          How was your night?
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-texture flex flex-col">
      <header className="w-full max-w-md mx-auto px-6 pt-12 pb-2">
        <h1 className="text-5xl font-display font-bold text-ink leading-none">
          Tonight
        </h1>
        <p className="text-ink/35 font-body text-sm mt-2">
          Stop {currentStop + 1} of {stops.length}
        </p>
      </header>

      <div className="flex-1 w-full max-w-md mx-auto px-6 mt-8 flex flex-col gap-6">
        {/* Current stop */}
        <div className="zine-card p-6">
          <p className="text-xs font-body text-ink/40 uppercase tracking-wider mb-2">Now</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{stopIcons[now.type] || "📍"}</span>
            <h2 className="text-3xl font-display font-bold text-ink leading-tight">{now.name}</h2>
          </div>
          <p className="font-body text-sm text-ink/50">{now.description}</p>
          <span className="inline-block mt-3 px-3 py-1 rounded-full bg-ink/5 font-body text-xs text-ink/40">
            {now.duration}
          </span>
        </div>

        {/* Next stop preview */}
        {next && (
          <div className="zine-card p-4 opacity-60">
            <p className="text-xs font-body text-ink/40 uppercase tracking-wider mb-1">Next</p>
            <div className="flex items-center gap-2">
              <span className="text-xl">{stopIcons[next.type] || "📍"}</span>
              <h3 className="text-xl font-display font-bold text-ink">{next.name}</h3>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full max-w-md mx-auto px-6 py-8 space-y-3">
        <button className="zine-btn">
          Directions →
        </button>
        <button
          onClick={() => setCurrentStop((c) => c + 1)}
          className="w-full py-3 font-display text-lg font-bold text-primary hover:text-primary/80 transition-colors"
        >
          Mark as done ✓
        </button>
      </div>
    </div>
  );
};

export default Tonight;
