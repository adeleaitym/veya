import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Wine, Martini, Coffee, Salad, UtensilsCrossed, Cake, Cookie, Sparkles, Sunrise, Palette, Music, Moon, Footprints, MapPin } from "lucide-react";

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

const stopIconMap: Record<string, React.ElementType> = {
  drink: Wine, cocktail: Martini, coffee: Coffee, appetizer: Salad,
  main: UtensilsCrossed, dessert: Cake, snack: Cookie, experience: Sparkles,
  viewpoint: Sunrise, culture: Palette, music: Music, nightlife: Moon, walk: Footprints,
};

const stopLabels: Record<string, string> = {
  drink: "Drinks", cocktail: "Cocktails", coffee: "Coffee", appetizer: "Starter",
  main: "Main Course", dessert: "Dessert", snack: "Snack", experience: "Experience",
  viewpoint: "Viewpoint", culture: "Culture", music: "Live Music", nightlife: "Nightlife", walk: "Walk",
};

const stopColors: Record<string, string> = {
  drink: "#C75B3A", cocktail: "#8B4F6E", coffee: "#D4943A", appetizer: "#2A7B6F",
  main: "#C75B3A", dessert: "#8B4F6E", snack: "#D4943A", experience: "#5B7FA5",
  viewpoint: "#2A7B6F", culture: "#5B7FA5", music: "#8B4F6E", nightlife: "#6B8E5A", walk: "#2A7B6F",
};

const loadingSteps = [
  { emoji: "🗺️", text: "Exploring the neighborhood...", sub: "Scanning hidden gems nearby" },
  { emoji: "🍷", text: "Picking the best spots...", sub: "Matching your vibe perfectly" },
  { emoji: "✨", text: "Curating experiences...", sub: "Mixing food, culture & nightlife" },
  { emoji: "🎨", text: "Designing your route...", sub: "Ordering stops for the perfect flow" },
  { emoji: "🌙", text: "Almost there...", sub: "Putting the finishing touches" },
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
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    const generateRoute = async () => {
      setLoading(true);
      setError(null);
      try {
        const message = `Vibe: ${vibe}. Neighborhood: ${where}. City: ${city}. Budget: ${budget}. Time: ${time}. Food: ${food}. Please suggest REAL existing venues in ${city}.`;
        const { data, error: fnError } = await supabase.functions.invoke("generate-route", { body: { message, city } });
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

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    const step = loadingSteps[loadingStep];
    return (
      <div className="min-h-screen paper-texture flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={loadingStep}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center"
          >
            <motion.div
              className="text-6xl mb-6"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {step.emoji}
            </motion.div>
            <p className="font-display text-3xl text-ink text-center">{step.text}</p>
            <p className="font-body text-sm text-ink/40 mt-2 text-center">{step.sub}</p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div className="flex gap-2 mt-8">
          {loadingSteps.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i <= loadingStep ? 24 : 8,
                background: i <= loadingStep ? "hsl(var(--primary))" : "hsl(var(--ink) / 0.15)",
              }}
              className="h-2 rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 2 }}
          className="mt-12 zine-card max-w-xs text-center"
        >
          <p className="font-body text-xs text-ink/50">
            💡 Tip: {city} has {vibe.toLowerCase().includes("chill") ? "amazing rooftop bars" : "incredible hidden speakeasies"} worth exploring
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !route) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen paper-texture flex flex-col items-center justify-center gap-4 px-6"
      >
        <p className="font-display text-3xl text-ink">Oops ✦</p>
        <p className="font-body text-sm text-ink/50 text-center">{error || "Could not generate route"}</p>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate(-1)} className="zine-btn mt-4">Try again</motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen paper-texture flex flex-col"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto px-6 pt-12 pb-2"
      >
        <button onClick={() => navigate(-1)} className="text-ink/40 font-body text-sm mb-4 hover:text-ink transition-colors">
          ← Back
        </button>
        <h1 className="text-4xl font-display font-bold text-ink leading-tight">{route.routeName}</h1>
        <p className="text-ink/40 font-body text-sm mt-1">{route.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="font-body text-xs text-ink/30 bg-ink/5 px-2.5 py-1 rounded-full">{route.stops.length} stops</span>
          <span className="font-body text-xs text-ink/30 bg-ink/5 px-2.5 py-1 rounded-full">{city}</span>
        </div>
      </motion.header>

      {/* Stops timeline */}
      <div className="flex-1 w-full max-w-md mx-auto px-6 mt-8 pb-8">
        <div className="relative">
          <div className="absolute left-5 top-2 bottom-2 w-[2px] bg-ink/10" />
          <div className="space-y-1">
            {route.stops.map((stop, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => navigate(`/stop?index=${i}&name=${encodeURIComponent(stop.name)}&type=${stop.type}&desc=${encodeURIComponent(stop.description)}&duration=${encodeURIComponent(stop.duration)}`)}
                className="relative w-full text-left pl-14 pr-2 py-4 group"
              >
                {/* Dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 500 }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-paper border-2 flex items-center justify-center z-10 group-hover:scale-110 transition-all"
                  style={{ borderColor: `${stopColors[stop.type] || '#999'}60` }}
                >
                  {(() => { const Icon = stopIconMap[stop.type] || MapPin; return <Icon size={14} color={stopColors[stop.type] || '#999'} strokeWidth={2} />; })()}
                </motion.div>

                <div className="zine-card group-hover:border-ink/25 transition-all group-hover:shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-body text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: `${stopColors[stop.type] || '#999'}12`, color: stopColors[stop.type] || '#999' }}
                    >
                      {stopLabels[stop.type] || stop.type}
                    </span>
                    <span className="text-[10px] font-body text-ink/25">{stop.duration}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-ink leading-snug">{stop.name}</h3>
                  <p className="font-body text-xs text-ink/40 mt-1 line-clamp-2">{stop.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-md mx-auto px-6 py-6 space-y-3"
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            const params = new URLSearchParams({ route: JSON.stringify(route), city });
            navigate(`/booking?${params.toString()}`);
          }}
          className="zine-btn"
        >
          Book this night →
        </motion.button>
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
          className="w-full py-3 font-body text-sm text-secondary hover:text-secondary/80 transition-colors"
        >
          Get your poster ✦
        </button>
      </motion.div>
    </motion.div>
  );
};

export default RouteView;
