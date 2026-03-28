import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const cityNames: Record<string, string> = {
  stockholm: "Stockholm",
  paris: "Paris",
  london: "London",
  tokyo: "Tokyo",
  barcelona: "Barcelona",
  istanbul: "Istanbul",
  "new-york": "New York",
  "mexico-city": "Mexico City",
  marrakech: "Marrakech",
  bangkok: "Bangkok",
};

const quickVibes = [
  "Spanish night 🌙",
  "Street food crawl 🍜",
  "Romantic date 🌹",
  "Sunday brunch ☀️",
  "Hidden gems 💎",
  "Local markets 🧺",
];

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

  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [route, setRoute] = useState<GeneratedRoute | null>(null);

  const generateRoute = async (input: string) => {
    if (!input.trim()) return;
    setIsLoading(true);
    setRoute(null);

    try {
      const { data, error } = await supabase.functions.invoke("dust-chat", {
        body: { message: input, city: cityName },
      });

      if (error) throw error;

      const message = data?.message || "";

      // Try to parse JSON from the response
      try {
        // Extract JSON from possible markdown code blocks
        const jsonMatch = message.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, message];
        const parsed = JSON.parse(jsonMatch[1] || message);
        setRoute(parsed);
      } catch {
        // If not valid JSON, show as a simple single-stop route
        toast.error("Couldn't parse route. Try a more specific vibe!");
        console.error("Parse error, raw message:", message);
      }
    } catch (err: any) {
      console.error("Route generation error:", err);
      toast.error(err.message || "Something went wrong. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateRoute(prompt);
  };

  const stopTypeEmoji: Record<string, string> = {
    drink: "🍷",
    appetizer: "🥗",
    main: "🍽️",
    dessert: "🍰",
    experience: "✨",
    snack: "🥐",
    cocktail: "🍸",
    coffee: "☕",
  };

  // SVG path points for the winding route
  const getStopPosition = (index: number, total: number) => {
    const spacing = 140;
    const y = 60 + index * spacing;
    const isEven = index % 2 === 0;
    const x = isEven ? 75 : 315;
    return { x, y };
  };

  const generatePathD = (stops: RouteStop[]) => {
    if (stops.length === 0) return "";
    const points = stops.map((_, i) => getStopPosition(i, stops.length));
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x;
      const cpy1 = prev.y + 70;
      const cpx2 = curr.x;
      const cpy2 = curr.y - 70;
      d += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${curr.x} ${curr.y}`;
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
        <h1 className="text-4xl font-display font-bold text-foreground leading-none">
          {cityName}
        </h1>
        <p className="text-foreground/80 leading-none text-base font-serif font-thin mt-1">
          Describe your perfect evening
        </p>
      </header>

      {/* Prompt input */}
      <section className="w-full max-w-md mx-auto px-6 mt-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Spanish night vibes, 4 people, cozy budget, love wine and seafood..."
            className="w-full rounded-2xl border border-border bg-card/40 px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            rows={3}
            maxLength={500}
            disabled={isLoading}
          />

          {/* Quick vibe pills */}
          <div className="flex flex-wrap gap-2">
            {quickVibes.map((vibe) => (
              <button
                key={vibe}
                type="button"
                onClick={() => {
                  setPrompt(vibe);
                  generateRoute(vibe);
                }}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-full bg-card/60 border border-border text-xs font-body text-foreground/80 hover:bg-primary/20 hover:border-primary/40 transition-all disabled:opacity-50"
              >
                {vibe}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full py-3 rounded-full bg-primary text-primary-foreground font-body font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
          >
            {isLoading ? "Crafting your route..." : "Generate my route ✨"}
          </button>
        </form>
      </section>

      {/* Loading state */}
      {isLoading && (
        <div className="w-full max-w-md mx-auto px-6 mt-10 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-body text-muted-foreground animate-pulse">
            Curating your journey through {cityName}...
          </p>
        </div>
      )}

      {/* Generated route — winding path */}
      {route && !isLoading && (
        <section className="w-full max-w-md mx-auto px-6 mt-8 pb-16">
          <div className="mb-6">
            <h2 className="text-3xl font-display font-bold text-foreground leading-tight">
              {route.routeName}
            </h2>
            <p className="text-sm font-serif font-thin text-foreground/70 mt-1 italic">
              {route.description}
            </p>
          </div>

          {/* Winding path visualization */}
          <div
            className="relative w-full"
            style={{ height: `${route.stops.length * 140 + 40}px` }}
          >
            {/* SVG path */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 390 ${route.stops.length * 140 + 40}`}
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Shadow path */}
              <path
                d={generatePathD(route.stops)}
                stroke="hsl(352, 58%, 78%)"
                strokeWidth="28"
                strokeLinecap="round"
                fill="none"
                opacity="0.4"
              />
              {/* Main ribbon */}
              <path
                d={generatePathD(route.stops)}
                stroke="hsl(352, 58%, 72%)"
                strokeWidth="16"
                strokeLinecap="round"
                fill="none"
                opacity="0.7"
              />
              {/* Highlight */}
              <path
                d={generatePathD(route.stops)}
                stroke="hsl(352, 58%, 84%)"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />
            </svg>

            {/* Stop cards along the path */}
            {route.stops.map((stop, i) => {
              const pos = getStopPosition(i, route.stops.length);
              const isLeft = i % 2 === 0;

              return (
                <div
                  key={i}
                  className="absolute flex items-center gap-3 animate-fade-in"
                  style={{
                    top: `${pos.y - 28}px`,
                    left: isLeft ? "24px" : "auto",
                    right: isLeft ? "auto" : "24px",
                    animationDelay: `${i * 150}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  {/* Order circle */}
                  <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-lg">
                      {stopTypeEmoji[stop.type.toLowerCase()] || "📍"}
                    </span>
                  </div>

                  {/* Info */}
                  <div
                    className={`bg-card/70 backdrop-blur-sm rounded-xl px-3.5 py-2.5 border border-border/50 shadow-md max-w-[200px] ${
                      isLeft ? "" : "text-right"
                    }`}
                  >
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

          {/* Action buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={() => generateRoute(prompt)}
              className="w-full py-3 rounded-full border-2 border-border text-foreground font-body font-semibold text-sm hover:bg-card/50 transition-all"
            >
              Regenerate route 🔄
            </button>
            <button
              onClick={() => {
                setRoute(null);
                setPrompt("");
              }}
              className="w-full py-3 rounded-full bg-primary text-primary-foreground font-body font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            >
              Try a different vibe ✨
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default CityVibes;
