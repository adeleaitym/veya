import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const vibes = [
  { id: "hidden-gems", label: "Hidden Gems", emoji: "🕵️" },
  { id: "date-night", label: "Date Night", emoji: "🕯️" },
  { id: "after-work", label: "After Work", emoji: "🍻" },
  { id: "sweet-stops", label: "Sweet Stops", emoji: "🍰" },
  { id: "brunch", label: "Brunch", emoji: "🥞" },
  { id: "rooftop", label: "Rooftop", emoji: "🌇" },
  { id: "street-food", label: "Street Food", emoji: "🥡" },
  { id: "late-night", label: "Late Night", emoji: "🌙" },
];

const cityNameMap: Record<string, string> = {
  stockholm: "Stockholm", paris: "Paris", london: "London", tokyo: "Tokyo",
  barcelona: "Barcelona", istanbul: "Istanbul", "new-york": "New York",
  "mexico-city": "Mexico City", marrakech: "Marrakech", bangkok: "Bangkok",
};

const groupSizes = ["1", "2", "3–4", "5+"];
const budgets = ["$", "$$", "$$$"];
const budgetLabels: Record<string, string> = { "$": "Low", "$$": "Medium", "$$$": "High" };
const areas: Record<string, string[]> = {
  stockholm: ["Södermalm", "Gamla Stan", "Norrmalm", "Surprise me"],
};

const tiltClasses = ["tilt-1", "tilt-2", "tilt-3", "tilt-4", "tilt-5", "tilt-6", "tilt-7", "tilt-8"];

interface RouteStop {
  order: number;
  name: string;
  type: string;
  description: string;
  duration: string;
}

interface GeneratedRoute {
  routeName: string;
  description: string;
  stops: RouteStop[];
}

const CityVibes = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const cityName = cityNameMap[cityId || ""] || cityId || "";

  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [freePrompt, setFreePrompt] = useState("");
  const [groupSize, setGroupSize] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [phase, setPhase] = useState<"plan" | "loading" | "route">("plan");
  const [route, setRoute] = useState<GeneratedRoute | null>(null);
  const [stopImages, setStopImages] = useState<Record<number, string>>({});
  const [posterImage, setPosterImage] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadingPoster, setLoadingPoster] = useState(false);

  const cityAreas = areas[cityId || ""] || null;
  const canSubmit = (selectedVibe || freePrompt.trim()) && groupSize && budget;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setPhase("loading");

    const vibeName = vibes.find((v) => v.id === selectedVibe)?.label || selectedVibe;
    const budgetName = budgetLabels[budget || ""] || budget;
    const vibeDescription = freePrompt.trim()
      ? freePrompt.trim()
      : `a ${vibeName} vibe`;
    const prompt = `I'm in ${cityName}${area && area !== "Surprise me" ? `, specifically ${area}` : ""}. I want ${vibeDescription} evening for ${groupSize} ${groupSize === "1" ? "person" : "people"} on a ${budgetName?.toLowerCase()} budget. Plan a perfect evening route — this can include restaurants, bars, cafés, walks, viewpoints, cultural spots, entertainment, or anything that makes a great night out!`;

    try {
      const { data, error } = await supabase.functions.invoke("generate-route", {
        body: { message: prompt, city: cityName },
      });
      if (error) throw error;

      const message = data?.message || "";
      const jsonMatch = message.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, message];
      const parsed: GeneratedRoute = JSON.parse(jsonMatch[1] || message);
      setRoute(parsed);
      setPhase("route");
      generateStopImages(parsed.stops);
      generatePoster(parsed);
    } catch (err) {
      console.error("Route generation error:", err);
      toast.error("Couldn't generate your route. Try again!");
      setPhase("plan");
    }
  };

  const generateStopImages = async (stops: RouteStop[]) => {
    setLoadingImages(true);
    for (let i = 0; i < stops.length; i++) {
      try {
        const { data, error } = await supabase.functions.invoke("generate-stop-image", {
          body: { stopName: stops[i].name, stopType: stops[i].type, stopDescription: stops[i].description, city: cityName },
        });
        if (!error && data?.imageUrl) {
          setStopImages((prev) => ({ ...prev, [i]: data.imageUrl }));
        }
      } catch (err) {
        console.error(`Image gen failed for stop ${i}:`, err);
      }
    }
    setLoadingImages(false);
  };

  const generatePoster = async (routeData: GeneratedRoute) => {
    setLoadingPoster(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-route-poster", {
        body: { routeName: routeData.routeName, city: cityName, stops: routeData.stops },
      });
      if (!error && data?.imageUrl) setPosterImage(data.imageUrl);
    } catch (err) {
      console.error("Poster gen failed:", err);
    }
    setLoadingPoster(false);
  };

  const resetAll = () => {
    setFreePrompt("");
    setSelectedVibe(null);
    setGroupSize(null);
    setBudget(null);
    setArea(null);
    setRoute(null);
    setStopImages({});
    setPosterImage(null);
    setPhase("plan");
  };

  const stopTypeEmoji: Record<string, string> = {
    drink: "🍷", appetizer: "🥗", main: "🍽️", dessert: "🍰",
    experience: "✨", snack: "🥐", cocktail: "🍸", coffee: "☕",
  };

  const getStopPosition = (index: number) => {
    const y = 80 + index * 160;
    const isEven = index % 2 === 0;
    return { x: isEven ? 80 : 310, y };
  };

  const generatePathD = (stops: RouteStop[]) => {
    if (stops.length === 0) return "";
    const points = stops.map((_, i) => getStopPosition(i));
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      d += ` C ${prev.x} ${prev.y + 80}, ${curr.x} ${curr.y - 80}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  return (
    <div className="min-h-screen paper-texture flex flex-col">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-6 pt-8 pb-2">
        <button
          onClick={() => navigate("/cities")}
          className="text-ink/40 font-display text-lg hover:text-ink/70 transition-colors"
        >
          ← back to cities
        </button>
      </header>

      {/* PLAN PHASE */}
      {phase === "plan" && (
        <section className="w-full max-w-md mx-auto px-6 pb-16 space-y-10">
          {/* Title block — like a zine page header */}
          <div className="relative mt-2">
            <h1 className="text-5xl font-display font-bold text-ink leading-[0.95] ink-underline">
              {cityName}
            </h1>
            <p className="text-ink/50 text-sm font-display text-xl mt-3 tilt-3">
              ✎ Plan your evening
            </p>
          </div>

          {/* Free prompt search */}
          <div className="space-y-3">
            <h2 className="text-3xl font-display font-bold text-ink tilt-2">
              Describe your perfect evening
            </h2>
            <div className="sketch-border-light bg-paper px-4 py-3">
              <textarea
                value={freePrompt}
                onChange={(e) => setFreePrompt(e.target.value)}
                placeholder="e.g. Jazz bar hopping with craft cocktails, ending at a rooftop with a view..."
                rows={2}
                className="w-full bg-transparent font-body text-sm text-ink placeholder:text-ink/25 resize-none focus:outline-none leading-relaxed"
              />
            </div>
            <p className="text-xs font-display text-ink/30 tilt-5">
              or pick a vibe below ↓
            </p>
          </div>

          <div className="ink-divider" />

          {/* Vibe — quick picks */}
          <div className="space-y-4">
            <h2 className="text-3xl font-display font-bold text-ink tilt-6">
              Pick your vibe
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {vibes.map((vibe, i) => (
                <button
                  key={vibe.id}
                  onClick={() => {
                    setSelectedVibe(vibe.id);
                    setFreePrompt("");
                  }}
                  className={`zine-sticker ${selectedVibe === vibe.id && !freePrompt ? "selected" : ""} ${tiltClasses[i % tiltClasses.length]}`}
                >
                  <span>{vibe.emoji}</span>
                  <span>{vibe.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="ink-divider" />

          {/* Group size — hand-drawn circles */}
          <div className="space-y-4">
            <h2 className="text-3xl font-display font-bold text-ink tilt-2">
              How many?
            </h2>
            <div className="flex gap-3">
              {groupSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setGroupSize(size)}
                  className={`w-14 h-14 flex items-center justify-center font-display text-xl font-bold transition-all ${
                    groupSize === size
                      ? "bg-ink text-paper border-ink"
                      : "bg-transparent text-ink/60 border-ink/25 hover:border-ink/50"
                  }`}
                  style={{
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderRadius: groupSize === size ? "50% 44% 50% 42%" : "42% 50% 44% 50%",
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="ink-divider" />

          {/* Budget — sketchy tab bar */}
          <div className="space-y-4">
            <h2 className="text-3xl font-display font-bold text-ink tilt-5">
              Budget?
            </h2>
            <div className="flex gap-2">
              {budgets.map((b) => (
                <button
                  key={b}
                  onClick={() => setBudget(b)}
                  className={`zine-chip flex-1 text-center ${budget === b ? "selected" : ""}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="ink-divider" />

          {/* Area */}
          <div className="space-y-4">
            <h2 className="text-3xl font-display font-bold text-ink tilt-1">
              Where to start?
            </h2>
            {cityAreas ? (
              <div className="flex flex-wrap gap-2">
                {cityAreas.map((a, i) => (
                  <button
                    key={a}
                    onClick={() => setArea(a)}
                    className={`zine-chip ${area === a ? "selected" : ""} ${tiltClasses[(i + 3) % tiltClasses.length]}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            ) : (
              <div className="zine-card tilt-3">
                <div className="tape-strip" />
                <p className="font-display text-2xl font-bold text-ink mt-1">{cityName}</p>
                <p className="font-body text-xs text-ink/40 mt-1">We'll find the best spots ✦</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="pt-2">
            <button
              onClick={handleCreate}
              disabled={!canSubmit}
              className="zine-btn"
            >
              {canSubmit ? "Build my route →" : "Pick vibe, size & budget first"}
            </button>
          </div>
        </section>
      )}

      {/* LOADING PHASE */}
      {phase === "loading" && (
        <div className="w-full max-w-md mx-auto px-6 mt-24 flex flex-col items-center gap-5">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-[2.5px] border-ink/10" />
            <div className="absolute inset-0 rounded-full border-[2.5px] border-primary border-t-transparent animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">✎</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-ink text-center tilt-3">
            Sketching your route...
          </h2>
          <p className="text-sm font-body text-ink/40 text-center max-w-[260px]">
            Finding the best spots in {cityName} for your vibe
          </p>
        </div>
      )}

      {/* ROUTE PHASE */}
      {phase === "route" && route && (
        <section className="w-full max-w-md mx-auto px-6 mt-2 pb-16">
          <div className="mb-8">
            <h2 className="text-4xl font-display font-bold text-ink leading-tight ink-underline">
              {route.routeName}
            </h2>
            <p className="text-sm font-body text-ink/40 mt-3 italic tilt-3">"{route.description}"</p>
          </div>

          {/* Winding path */}
          <div className="relative w-full" style={{ height: `${route.stops.length * 160 + 60}px` }}>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 390 ${route.stops.length * 160 + 60}`}
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <path d={generatePathD(route.stops)} stroke="hsl(350, 72%, 52%)" strokeWidth="28" strokeLinecap="round" fill="none" opacity="0.2" />
              <path d={generatePathD(route.stops)} stroke="hsl(350, 72%, 55%)" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.45" />
              <path d={generatePathD(route.stops)} stroke="hsl(350, 72%, 60%)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" strokeDasharray="8 6" />
            </svg>

            {route.stops.map((stop, i) => {
              const pos = getStopPosition(i);
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={i}
                  className={`absolute flex items-center gap-3 animate-fade-up ${tiltClasses[i % tiltClasses.length]}`}
                  style={{
                    top: `${pos.y - 36}px`,
                    left: isLeft ? "12px" : "auto",
                    right: isLeft ? "auto" : "12px",
                    animationDelay: `${i * 150}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  {/* Stop illustration */}
                  <div className="w-14 h-14 flex-shrink-0 sketch-border overflow-hidden bg-paper flex items-center justify-center">
                    {stopImages[i] ? (
                      <img src={stopImages[i]} alt={stop.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">
                        {loadingImages ? (
                          <span className="block w-4 h-4 rounded-full border-2 border-ink/20 border-t-primary animate-spin" />
                        ) : (
                          stopTypeEmoji[stop.type.toLowerCase()] || "📍"
                        )}
                      </span>
                    )}
                  </div>

                  {/* Stop card */}
                  <div className={`zine-card max-w-[170px] ${isLeft ? "" : "text-right"}`}>
                    <p className="text-[10px] font-display text-ink/35 uppercase tracking-widest">
                      {stop.type} · {stop.duration}
                    </p>
                    <p className="text-sm font-display font-bold text-ink leading-tight mt-0.5">
                      {stop.name}
                    </p>
                    <p className="text-[11px] font-body text-ink/45 mt-0.5 leading-snug">
                      {stop.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Poster */}
          <div className="mt-6">
            {posterImage ? (
              <div className="sketch-border overflow-hidden">
                <img src={posterImage} alt={`${route.routeName} poster`} className="w-full" />
              </div>
            ) : loadingPoster ? (
              <div className="zine-card flex flex-col items-center gap-3 py-8">
                <div className="w-8 h-8 rounded-full border-2 border-ink/15 border-t-primary animate-spin" />
                <p className="text-sm font-display text-ink/35">Drawing your poster...</p>
              </div>
            ) : null}
          </div>

          {/* Actions */}
          <div className="mt-10 space-y-3">
            <button
              onClick={resetAll}
              className="zine-btn"
              style={{ background: "transparent", color: "hsl(var(--ink))" }}
            >
              Plan again ↺
            </button>
            <button
              onClick={() => navigate("/cities")}
              className="zine-btn"
            >
              Try another city →
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default CityVibes;
