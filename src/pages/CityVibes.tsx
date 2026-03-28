import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SwipeCard from "@/components/SwipeCard";

import swipeRomantic from "@/assets/swipe-romantic.jpg";
import swipeStreetFood from "@/assets/swipe-street-food.jpg";
import swipeBrunch from "@/assets/swipe-brunch.jpg";
import swipeCocktails from "@/assets/swipe-cocktails.jpg";
import swipeHidden from "@/assets/swipe-hidden.jpg";
import swipeCozy from "@/assets/swipe-cozy.jpg";
import swipeTapas from "@/assets/swipe-tapas.jpg";
import swipeMarket from "@/assets/swipe-market.jpg";

const cityNames: Record<string, string> = {
  stockholm: "Stockholm", paris: "Paris", london: "London", tokyo: "Tokyo",
  barcelona: "Barcelona", istanbul: "Istanbul", "new-york": "New York",
  "mexico-city": "Mexico City", marrakech: "Marrakech", bangkok: "Bangkok",
};

interface VibeCard {
  id: string;
  label: string;
  tagline: string;
  img: string;
  category: string;
}

const vibeCards: VibeCard[] = [
  { id: "romantic", label: "Romantic evening", tagline: "Candlelight & conversation", img: swipeRomantic, category: "mood" },
  { id: "street-food", label: "Street food crawl", tagline: "Follow the smoke", img: swipeStreetFood, category: "cuisine" },
  { id: "brunch", label: "Lazy brunch", tagline: "Croissants & sunshine", img: swipeBrunch, category: "mood" },
  { id: "cocktails", label: "Rooftop cocktails", tagline: "Sip above the skyline", img: swipeCocktails, category: "experience" },
  { id: "hidden", label: "Hidden gems", tagline: "Behind the unmarked door", img: swipeHidden, category: "experience" },
  { id: "cozy", label: "Cozy & intimate", tagline: "Rain outside, warmth inside", img: swipeCozy, category: "mood" },
  { id: "tapas", label: "Tapas & sharing", tagline: "Small plates, big flavours", img: swipeTapas, category: "cuisine" },
  { id: "market", label: "Market hopping", tagline: "Taste what the locals taste", img: swipeMarket, category: "experience" },
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

  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [phase, setPhase] = useState<"swipe" | "loading" | "route">("swipe");
  const [route, setRoute] = useState<GeneratedRoute | null>(null);

  const remaining = vibeCards.length - currentIndex;
  const progress = currentIndex / vibeCards.length;

  const handleSwipe = (direction: "left" | "right") => {
    const card = vibeCards[currentIndex];
    if (direction === "right") {
      setLiked((prev) => [...prev, card.id]);
    } else {
      setSkipped((prev) => [...prev, card.id]);
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    // After all cards, generate route
    if (nextIndex >= vibeCards.length) {
      const finalLiked = direction === "right" ? [...liked, card.id] : liked;
      generateRoute(finalLiked);
    }
  };

  const generateRoute = async (likedVibes: string[]) => {
    setPhase("loading");

    const vibeLabels = likedVibes
      .map((id) => vibeCards.find((v) => v.id === id)?.label)
      .filter(Boolean)
      .join(", ");

    const prompt = likedVibes.length > 0
      ? `I'm in ${cityName} and I'm vibing with: ${vibeLabels}. Create me a perfect food journey for tonight!`
      : `I'm in ${cityName} and open to anything! Surprise me with an amazing food journey!`;

    try {
      const { data, error } = await supabase.functions.invoke("dust-chat", {
        body: { message: prompt, city: cityName },
      });

      if (error) throw error;

      const message = data?.message || "";
      const jsonMatch = message.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, message];
      const parsed = JSON.parse(jsonMatch[1] || message);
      setRoute(parsed);
      setPhase("route");
    } catch (err: any) {
      console.error("Route generation error:", err);
      toast.error("Couldn't generate your route. Try again!");
      setPhase("swipe");
      setCurrentIndex(0);
      setLiked([]);
      setSkipped([]);
    }
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

  const resetAll = () => {
    setCurrentIndex(0);
    setLiked([]);
    setSkipped([]);
    setRoute(null);
    setPhase("swipe");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-6 pt-8 pb-2 relative z-20">
        <button
          onClick={() => navigate("/cities")}
          className="text-muted-foreground font-body text-sm mb-3 hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-display font-bold text-foreground leading-none">
          {cityName}
        </h1>

        {phase === "swipe" && (
          <>
            <p className="text-foreground/80 leading-none text-base font-serif font-thin mt-1">
              Swipe right on what speaks to you
            </p>
            {/* Progress bar */}
            <div className="mt-4 w-full h-1.5 rounded-full bg-border/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-xs font-body text-muted-foreground mt-1.5">
              {remaining} cards left · {liked.length} vibes matched
            </p>
          </>
        )}
      </header>

      {/* SWIPE PHASE */}
      {phase === "swipe" && currentIndex < vibeCards.length && (
        <section className="w-full max-w-md mx-auto px-6 mt-4 flex-1 relative" style={{ minHeight: "420px" }}>
          {/* Card stack — show top 2 */}
          <div className="relative w-full" style={{ height: "400px" }}>
            {vibeCards
              .slice(currentIndex, currentIndex + 2)
              .reverse()
              .map((card, stackIndex) => {
                const isTop = stackIndex === (Math.min(2, vibeCards.length - currentIndex) - 1);
                return (
                  <SwipeCard
                    key={card.id}
                    isTop={isTop}
                    onSwipeRight={() => handleSwipe("right")}
                    onSwipeLeft={() => handleSwipe("left")}
                  >
                    <div className="w-full h-full rounded-3xl overflow-hidden shadow-xl border border-border/30">
                      <div className="relative w-full h-full">
                        <img
                          src={card.img}
                          alt={card.label}
                          className="w-full h-full object-cover"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        {/* Category badge */}
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                          <span className="text-xs font-body text-white/90 uppercase tracking-wider">
                            {card.category}
                          </span>
                        </div>
                        {/* Text content */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h2 className="text-3xl font-display font-bold text-white leading-tight">
                            {card.label}
                          </h2>
                          <p className="text-white/80 font-serif font-thin text-lg mt-1 italic">
                            {card.tagline}
                          </p>
                        </div>
                      </div>
                    </div>
                  </SwipeCard>
                );
              })}
          </div>

          {/* Swipe buttons */}
          <div className="flex justify-center gap-8 mt-4">
            <button
              onClick={() => handleSwipe("left")}
              className="w-14 h-14 rounded-full border-2 border-border flex items-center justify-center text-xl hover:bg-destructive/10 hover:border-destructive/40 transition-all"
            >
              ✕
            </button>
            <button
              onClick={() => handleSwipe("right")}
              className="w-14 h-14 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-xl hover:bg-primary/20 transition-all"
            >
              ♥
            </button>
          </div>
        </section>
      )}

      {/* LOADING PHASE */}
      {phase === "loading" && (
        <div className="w-full max-w-md mx-auto px-6 mt-20 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-3 border-primary border-t-transparent animate-spin" />
          <h2 className="text-2xl font-display font-bold text-foreground text-center">
            Crafting your journey...
          </h2>
          <p className="text-sm font-body text-muted-foreground text-center max-w-xs">
            Our AI is matching your vibes with the best spots in {cityName}
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {liked.map((id) => {
              const v = vibeCards.find((c) => c.id === id);
              return v ? (
                <span key={id} className="px-3 py-1 rounded-full bg-primary/20 text-xs font-body text-foreground/80">
                  {v.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* ROUTE PHASE */}
      {phase === "route" && route && (
        <section className="w-full max-w-md mx-auto px-6 mt-6 pb-16">
          <div className="mb-6">
            <h2 className="text-3xl font-display font-bold text-foreground leading-tight">
              {route.routeName}
            </h2>
            <p className="text-sm font-serif font-thin text-foreground/70 mt-1 italic">
              {route.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {liked.map((id) => {
                const v = vibeCards.find((c) => c.id === id);
                return v ? (
                  <span key={id} className="px-2.5 py-1 rounded-full bg-primary/20 text-xs font-body text-foreground/80">
                    {v.label}
                  </span>
                ) : null;
              })}
            </div>
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
                  className="absolute flex items-center gap-3 animate-fade-in"
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
              Swipe again 🔄
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
