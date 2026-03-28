import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import vibeHiddenGems from "@/assets/vibe-hidden-gems.jpg";
import vibeDateNight from "@/assets/vibe-date-night.jpg";
import vibeAfterWork from "@/assets/vibe-after-work.jpg";
import vibeSweetStops from "@/assets/vibe-sweet-stops.jpg";

const cityNames: Record<string, string> = {
  stockholm: "Stockholm", paris: "Paris", london: "London", tokyo: "Tokyo",
  barcelona: "Barcelona", istanbul: "Istanbul", "new-york": "New York",
  "mexico-city": "Mexico City", marrakech: "Marrakech", bangkok: "Bangkok",
};

const vibes = [
  { id: "hidden-gems", label: "Hidden Gems", tagline: "Behind the unmarked door", img: vibeHiddenGems },
  { id: "date-night", label: "Date Night", tagline: "Candlelight & conversation", img: vibeDateNight },
  { id: "after-work", label: "After Work", tagline: "Unwind with the crew", img: vibeAfterWork },
  { id: "sweet-stops", label: "Sweet Stops", tagline: "Life is short, eat dessert", img: vibeSweetStops },
];

const groupSizes = ["1", "2", "3–4", "5+"];
const budgets = ["Low", "Medium", "High"];
const areas: Record<string, string[]> = {
  stockholm: ["Södermalm", "Gamla Stan", "Norrmalm", "Surprise me"],
};

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
  const cityName = cityNames[cityId || ""] || cityId || "";

  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
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
  const canSubmit = selectedVibe && groupSize && budget;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setPhase("loading");

    const vibeName = vibes.find((v) => v.id === selectedVibe)?.label || selectedVibe;
    const prompt = `I'm in ${cityName}${area && area !== "Surprise me" ? `, specifically ${area}` : ""}. I want a ${vibeName} vibe evening for ${groupSize} ${groupSize === "1" ? "person" : "people"} on a ${budget?.toLowerCase()} budget. Create me a perfect food journey!`;

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

      // Kick off image generation in parallel
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
    // Generate images sequentially to avoid rate limits
    for (let i = 0; i < stops.length; i++) {
      try {
        const { data, error } = await supabase.functions.invoke("generate-stop-image", {
          body: {
            stopName: stops[i].name,
            stopType: stops[i].type,
            stopDescription: stops[i].description,
            city: cityName,
          },
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
        body: {
          routeName: routeData.routeName,
          city: cityName,
          stops: routeData.stops,
        },
      });

      if (!error && data?.imageUrl) {
        setPosterImage(data.imageUrl);
      }
    } catch (err) {
      console.error("Poster gen failed:", err);
    }
    setLoadingPoster(false);
  };

  const resetAll = () => {
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-6 pt-8 pb-2">
        <button
          onClick={() => navigate("/cities")}
          className="text-muted-foreground font-body text-sm mb-3 hover:text-foreground transition-colors"
        >
          ← Back
        </button>
      </header>

      {/* PLAN PHASE */}
      {phase === "plan" && (
        <section className="w-full max-w-md mx-auto px-6 pb-16 space-y-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground leading-none">
              Plan your evening
            </h1>
            <p className="text-foreground/70 text-base font-body mt-1">
              A few details, then Veya builds your route.
            </p>
          </div>

          {/* Vibe */}
          <div className="space-y-3">
            <h2 className="text-2xl font-display font-bold text-foreground">
              What are you in the mood for?
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {vibes.map((vibe) => {
                const selected = selectedVibe === vibe.id;
                return (
                  <button
                    key={vibe.id}
                    onClick={() => setSelectedVibe(vibe.id)}
                    className={`rounded-2xl overflow-hidden border-2 transition-all text-left ${
                      selected
                        ? "border-primary shadow-lg scale-[1.02]"
                        : "border-border/30 hover:border-border/60"
                    }`}
                  >
                    <div className="aspect-[4/5] overflow-hidden relative">
                      <img src={vibe.img} alt={vibe.label} width={512} height={640} loading="lazy" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      {selected && (
                        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-primary-foreground text-sm">✓</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-lg font-display font-bold text-white leading-tight">{vibe.label}</p>
                        <p className="text-white/70 font-body text-xs mt-0.5">{vibe.tagline}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group size */}
          <div className="space-y-3">
            <h2 className="text-2xl font-display font-bold text-foreground">Who's coming?</h2>
            <div className="flex gap-2">
              {groupSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setGroupSize(size)}
                  className={`px-5 py-2.5 rounded-full font-body text-sm font-semibold transition-all ${
                    groupSize === size
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card/60 text-foreground/80 border border-border/40 hover:bg-card"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-3">
            <h2 className="text-2xl font-display font-bold text-foreground">What's your budget?</h2>
            <div className="flex rounded-xl overflow-hidden border border-border/40">
              {budgets.map((b, i) => (
                <button
                  key={b}
                  onClick={() => setBudget(b)}
                  className={`flex-1 py-3 font-body text-sm font-semibold transition-all ${
                    budget === b ? "bg-primary text-primary-foreground" : "bg-card/40 text-foreground/70 hover:bg-card/70"
                  } ${i < budgets.length - 1 ? "border-r border-border/30" : ""}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Area */}
          <div className="space-y-3">
            <h2 className="text-2xl font-display font-bold text-foreground">Where should we start?</h2>
            {cityAreas ? (
              <div className="flex flex-wrap gap-2">
                {cityAreas.map((a) => (
                  <button
                    key={a}
                    onClick={() => setArea(a)}
                    className={`px-4 py-2.5 rounded-full font-body text-sm font-semibold transition-all ${
                      area === a
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card/60 text-foreground/80 border border-border/40 hover:bg-card"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-5 py-4 rounded-2xl bg-card/60 border border-border/40">
                <p className="font-display text-xl font-bold text-foreground">{cityName}</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">We'll find the best spots for you</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleCreate}
            disabled={!canSubmit}
            className={`w-full py-4 rounded-full font-body font-bold text-base transition-all ${
              canSubmit
                ? "bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.01]"
                : "bg-muted/50 text-muted-foreground cursor-not-allowed"
            }`}
          >
            Create my route ✨
          </button>
        </section>
      )}

      {/* LOADING PHASE */}
      {phase === "loading" && (
        <div className="w-full max-w-md mx-auto px-6 mt-20 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
          <h2 className="text-2xl font-display font-bold text-foreground text-center">Crafting your journey...</h2>
          <p className="text-sm font-body text-muted-foreground text-center max-w-xs">
            Veya is matching your vibes with the best spots in {cityName}
          </p>
        </div>
      )}

      {/* ROUTE PHASE */}
      {phase === "route" && route && (
        <section className="w-full max-w-md mx-auto px-6 mt-2 pb-16">
          <div className="mb-6">
            <h2 className="text-3xl font-display font-bold text-foreground leading-tight">{route.routeName}</h2>
            <p className="text-sm font-body text-foreground/70 mt-1 italic">{route.description}</p>
          </div>

          {/* Winding path with illustrations */}
          <div className="relative w-full" style={{ height: `${route.stops.length * 160 + 60}px` }}>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 390 ${route.stops.length * 160 + 60}`}
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <path d={generatePathD(route.stops)} stroke="hsl(340, 82%, 65%)" strokeWidth="32" strokeLinecap="round" fill="none" opacity="0.35" />
              <path d={generatePathD(route.stops)} stroke="hsl(340, 82%, 60%)" strokeWidth="18" strokeLinecap="round" fill="none" opacity="0.6" />
              <path d={generatePathD(route.stops)} stroke="hsl(340, 82%, 70%)" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5" />
            </svg>

            {route.stops.map((stop, i) => {
              const pos = getStopPosition(i);
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={i}
                  className="absolute flex items-center gap-3 animate-fade-up"
                  style={{
                    top: `${pos.y - 36}px`,
                    left: isLeft ? "12px" : "auto",
                    right: isLeft ? "auto" : "12px",
                    animationDelay: `${i * 150}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  {/* Stop illustration or emoji */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-white border border-border/30 shadow-md">
                    {stopImages[i] ? (
                      <img src={stopImages[i]} alt={stop.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {loadingImages ? (
                          <div className="w-5 h-5 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
                        ) : (
                          <span className="text-xl">{stopTypeEmoji[stop.type.toLowerCase()] || "📍"}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stop info card */}
                  <div className={`bg-card/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-border/40 shadow-sm max-w-[180px] ${isLeft ? "" : "text-right"}`}>
                    <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">
                      {stop.type} · {stop.duration}
                    </p>
                    <p className="text-sm font-display font-bold text-foreground leading-tight mt-0.5">
                      {stop.name}
                    </p>
                    <p className="text-[11px] font-body text-foreground/60 mt-0.5 leading-snug">
                      {stop.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Route poster */}
          <div className="mt-6">
            {posterImage ? (
              <div className="rounded-2xl overflow-hidden border border-border/30 shadow-lg">
                <img src={posterImage} alt={`${route.routeName} poster`} className="w-full" />
              </div>
            ) : loadingPoster ? (
              <div className="rounded-2xl border border-border/30 bg-card/40 p-8 flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
                <p className="text-sm font-body text-muted-foreground text-center">
                  Generating your route poster...
                </p>
              </div>
            ) : null}
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <button
              onClick={resetAll}
              className="w-full py-3 rounded-full border-2 border-border text-foreground font-body font-semibold text-sm hover:bg-card/50 transition-all"
            >
              Plan again 🔄
            </button>
            <button
              onClick={() => navigate("/cities")}
              className="w-full py-3 rounded-full bg-primary text-primary-foreground font-body font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            >
              Try another city ✨
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default CityVibes;
