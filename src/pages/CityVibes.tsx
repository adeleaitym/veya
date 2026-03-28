import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
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
      const parsed = JSON.parse(jsonMatch[1] || message);
      setRoute(parsed);
      setPhase("route");
    } catch (err) {
      console.error("Route generation error:", err);
      toast.error("Couldn't generate your route. Try again!");
      setPhase("plan");
    }
  };

  const resetAll = () => {
    setSelectedVibe(null);
    setGroupSize(null);
    setBudget(null);
    setArea(null);
    setRoute(null);
    setPhase("plan");
  };

  const stopTypeEmoji: Record<string, string> = {
    drink: "🍷", appetizer: "🥗", main: "🍽️", dessert: "🍰",
    experience: "✨", snack: "🥐", cocktail: "🍸", coffee: "☕",
  };

  const getStopPosition = (index: number) => {
    const y = 60 + index * 140;
    const isEven = index % 2 === 0;
    return { x: isEven ? 75 : 315, y };
  };

  const generatePathD = (stops: RouteStop[]) => {
    if (stops.length === 0) return "";
    const points = stops.map((_, i) => getStopPosition(i));
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      d += ` C ${prev.x} ${prev.y + 70}, ${curr.x} ${curr.y - 70}, ${curr.x} ${curr.y}`;
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
          {/* Title */}
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground leading-none">
              Plan your evening
            </h1>
            <p className="text-foreground/70 text-base font-body mt-1">
              A few details, then Veya builds your route.
            </p>
          </div>

          {/* Section 1: Vibe */}
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
                      <img
                        src={vibe.img}
                        alt={vibe.label}
                        width={512}
                        height={640}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      {selected && (
                        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-primary-foreground text-sm">✓</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-lg font-display font-bold text-white leading-tight">
                          {vibe.label}
                        </p>
                        <p className="text-white/70 font-body text-xs mt-0.5">
                          {vibe.tagline}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Group size */}
          <div className="space-y-3">
            <h2 className="text-2xl font-display font-bold text-foreground">
              Who's coming?
            </h2>
            <div className="flex gap-2">
              {groupSizes.map((size) => {
                const selected = groupSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setGroupSize(size)}
                    className={`px-5 py-2.5 rounded-full font-body text-sm font-semibold transition-all ${
                      selected
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-card/60 text-foreground/80 border border-border/40 hover:bg-card"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Budget */}
          <div className="space-y-3">
            <h2 className="text-2xl font-display font-bold text-foreground">
              What's your budget?
            </h2>
            <div className="flex rounded-xl overflow-hidden border border-border/40">
              {budgets.map((b, i) => {
                const selected = budget === b;
                return (
                  <button
                    key={b}
                    onClick={() => setBudget(b)}
                    className={`flex-1 py-3 font-body text-sm font-semibold transition-all ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-card/40 text-foreground/70 hover:bg-card/70"
                    } ${i < budgets.length - 1 ? "border-r border-border/30" : ""}`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Area */}
          <div className="space-y-3">
            <h2 className="text-2xl font-display font-bold text-foreground">
              Where should we start?
            </h2>
            {cityAreas ? (
              <div className="flex flex-wrap gap-2">
                {cityAreas.map((a) => {
                  const selected = area === a;
                  return (
                    <button
                      key={a}
                      onClick={() => setArea(a)}
                      className={`px-4 py-2.5 rounded-full font-body text-sm font-semibold transition-all ${
                        selected
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-card/60 text-foreground/80 border border-border/40 hover:bg-card"
                      }`}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-5 py-4 rounded-2xl bg-card/60 border border-border/40">
                <p className="font-display text-xl font-bold text-foreground">{cityName}</p>
                <p className="font-body text-xs text-muted-foreground mt-0.5">
                  We'll find the best spots for you
                </p>
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
          <h2 className="text-2xl font-display font-bold text-foreground text-center">
            Crafting your journey...
          </h2>
          <p className="text-sm font-body text-muted-foreground text-center max-w-xs">
            Veya is matching your vibes with the best spots in {cityName}
          </p>
        </div>
      )}

      {/* ROUTE PHASE */}
      {phase === "route" && route && (
        <section className="w-full max-w-md mx-auto px-6 mt-2 pb-16">
          <div className="mb-6">
            <h2 className="text-3xl font-display font-bold text-foreground leading-tight">
              {route.routeName}
            </h2>
            <p className="text-sm font-body text-foreground/70 mt-1 italic">
              {route.description}
            </p>
          </div>

          {/* Winding path */}
          <div className="relative w-full" style={{ height: `${route.stops.length * 140 + 40}px` }}>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 390 ${route.stops.length * 140 + 40}`}
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              <path d={generatePathD(route.stops)} stroke="hsl(352, 58%, 78%)" strokeWidth="28" strokeLinecap="round" fill="none" opacity="0.4" />
              <path d={generatePathD(route.stops)} stroke="hsl(352, 58%, 72%)" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.7" />
              <path d={generatePathD(route.stops)} stroke="hsl(352, 58%, 84%)" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.6" />
            </svg>

            {route.stops.map((stop, i) => {
              const pos = getStopPosition(i);
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={i}
                  className="absolute flex items-center gap-3 animate-fade-up"
                  style={{
                    top: `${pos.y - 28}px`,
                    left: isLeft ? "24px" : "auto",
                    right: isLeft ? "auto" : "24px",
                    animationDelay: `${i * 150}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-lg">
                      {stopTypeEmoji[stop.type.toLowerCase()] || "📍"}
                    </span>
                  </div>
                  <div className={`bg-card/70 backdrop-blur-sm rounded-xl px-3.5 py-2.5 border border-border/50 shadow-md max-w-[200px] ${isLeft ? "" : "text-right"}`}>
                    <p className="text-xs font-body text-muted-foreground uppercase tracking-wide">
                      {stop.type} · {stop.duration}
                    </p>
                    <p className="text-sm font-display font-bold text-foreground leading-tight mt-0.5">
                      {stop.name}
                    </p>
                    <p className="text-xs font-body text-foreground/70 mt-0.5 leading-snug">
                      {stop.description}
                    </p>
                  </div>
                </div>
              );
            })}
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
