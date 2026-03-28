import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

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

const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [booked, setBooked] = useState<Record<number, boolean>>({});

  let route: RouteData | null = null;
  try {
    route = JSON.parse(searchParams.get("route") || "null");
  } catch {
    route = null;
  }

  const city = searchParams.get("city") || "";

  if (!route || !route.stops?.length) {
    return (
      <div className="min-h-screen paper-texture flex flex-col items-center justify-center gap-4 px-6">
        <p className="font-display text-3xl text-ink">No route found ✦</p>
        <button onClick={() => navigate("/")} className="zine-btn mt-4">
          Start over
        </button>
      </div>
    );
  }

  const allBooked = route.stops.every((_, i) => booked[i]);
  const bookedCount = Object.values(booked).filter(Boolean).length;

  const openGoogleMaps = (stopName: string) => {
    const query = encodeURIComponent(`${stopName} ${city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const handleConfirm = () => {
    const params = new URLSearchParams({
      route: JSON.stringify(route),
      city,
    });
    navigate(`/confirmation?${params.toString()}`);
  };

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
          Lock it in ✦
        </h1>
        <p className="text-ink/40 font-body text-sm mt-1">
          Book each stop — or just wing it
        </p>
      </header>

      {/* Progress */}
      <div className="w-full max-w-md mx-auto px-6 mt-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-ink/8 overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full transition-all duration-500"
              style={{ width: `${(bookedCount / route.stops.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-body text-ink/40">
            {bookedCount}/{route.stops.length}
          </span>
        </div>
      </div>

      {/* Stops */}
      <div className="flex-1 w-full max-w-md mx-auto px-6 mt-6 space-y-3 pb-4">
        {route.stops.map((stop, i) => {
          const isBooked = booked[i];
          return (
            <div
              key={i}
              className={`zine-card p-5 transition-all duration-300 ${
                isBooked ? "border-secondary/30 bg-secondary/5" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon + check */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                      isBooked ? "bg-secondary/15" : "bg-muted/20"
                    }`}
                  >
                    {isBooked ? "✓" : stopIcons[stop.type] || "📍"}
                  </div>
                  {i < route!.stops.length - 1 && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-[2px] h-3 bg-ink/8" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-display text-lg font-bold leading-snug transition-colors ${
                      isBooked ? "text-ink/50 line-through" : "text-ink"
                    }`}
                  >
                    {stop.name}
                  </h3>
                  <p className="font-body text-xs text-ink/40 mt-0.5">
                    {stop.type} · {stop.duration}
                  </p>
                  <p className="font-body text-xs text-ink/35 mt-1 line-clamp-2">
                    {stop.description}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openGoogleMaps(stop.name)}
                      className="px-3 py-1.5 rounded-xl bg-ink/5 hover:bg-ink/10 font-body text-xs text-ink/60 hover:text-ink transition-colors"
                    >
                      📍 View on map
                    </button>
                    <button
                      onClick={() =>
                        setBooked((prev) => ({ ...prev, [i]: !prev[i] }))
                      }
                      className={`px-3 py-1.5 rounded-xl font-body text-xs transition-all ${
                        isBooked
                          ? "bg-secondary/15 text-secondary font-semibold"
                          : "bg-secondary/10 hover:bg-secondary/20 text-secondary/70 hover:text-secondary"
                      }`}
                    >
                      {isBooked ? "Booked ✓" : "Mark booked"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="w-full max-w-md mx-auto px-6 py-6 space-y-3">
        <button onClick={handleConfirm} className="zine-btn">
          {allBooked ? "All set — confirm! ✦" : "Confirm night →"}
        </button>
        <button
          onClick={() => {
            const routeParam = encodeURIComponent(JSON.stringify(route));
            navigate(`/tonight?route=${routeParam}`);
          }}
          className="w-full py-3 font-display text-base text-ink/40 hover:text-ink/60 transition-colors"
        >
          Skip booking, start now
        </button>
      </div>
    </div>
  );
};

export default Booking;
