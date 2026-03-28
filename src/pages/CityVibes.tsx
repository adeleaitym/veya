import { useNavigate, useParams } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

import vibeDateNight from "@/assets/vibe-date-night.jpg";
import vibeSoloAdventure from "@/assets/vibe-solo-adventure.jpg";
import vibeSundayBrunch from "@/assets/vibe-sunday-brunch.jpg";
import vibeStreetFood from "@/assets/vibe-street-food.jpg";
import vibeHiddenGems from "@/assets/vibe-hidden-gems.jpg";
import vibeRooftop from "@/assets/vibe-rooftop.jpg";
import vibeLocalMarkets from "@/assets/vibe-local-markets.jpg";
import vibeBakery from "@/assets/vibe-bakery.jpg";

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

const vibes = [
  {
    id: "date-night",
    label: "Date night",
    tagline: "The city slows down after dark",
    img: vibeDateNight,
  },
  {
    id: "solo-adventure",
    label: "Solo adventure",
    tagline: "Get lost on purpose",
    img: vibeSoloAdventure,
  },
  {
    id: "sunday-brunch",
    label: "Sunday brunch",
    tagline: "Morning light and warm pastries",
    img: vibeSundayBrunch,
  },
  {
    id: "street-food",
    label: "Street food",
    tagline: "Follow the smoke and the crowd",
    img: vibeStreetFood,
  },
  {
    id: "hidden-gems",
    label: "Hidden gems",
    tagline: "Behind the unmarked door",
    img: vibeHiddenGems,
  },
  {
    id: "rooftop-views",
    label: "Rooftop views",
    tagline: "Sip above the skyline",
    img: vibeRooftop,
  },
  {
    id: "local-markets",
    label: "Local markets",
    tagline: "Taste what the locals taste",
    img: vibeLocalMarkets,
  },
  {
    id: "bakery-hopping",
    label: "Bakery hopping",
    tagline: "One croissant is never enough",
    img: vibeBakery,
  },
];

const CityVibes = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const cityName = cityNames[cityId || ""] || cityId;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const cardHeight = container.clientHeight;
      const index = Math.round(scrollTop / cardHeight);
      setActiveIndex(Math.min(index, vibes.length - 1));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Fixed header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 pt-8 pb-4 bg-gradient-to-b from-background/95 via-background/70 to-transparent">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate("/cities")}
            className="text-foreground/80 font-body text-sm hover:text-foreground transition-colors"
          >
            ← {cityName}
          </button>
          {/* Dot indicators */}
          <div className="flex gap-1.5">
            {vibes.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "bg-foreground scale-125"
                    : "bg-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Snap-scroll vibe cards */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto snap-y snap-mandatory"
        style={{ scrollBehavior: "smooth" }}
      >
        {vibes.map((vibe) => (
          <div
            key={vibe.id}
            className="h-screen w-full snap-start snap-always relative flex flex-col"
          >
            {/* Full-bleed illustration */}
            <div className="absolute inset-0">
              <img
                src={vibe.img}
                alt={vibe.label}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            </div>

            {/* Bottom content */}
            <div className="relative mt-auto px-6 pb-12 max-w-md mx-auto w-full">
              <p className="text-white/70 font-body text-sm tracking-wide uppercase mb-1">
                Choose your vibe
              </p>
              <h2 className="text-4xl font-display font-bold text-white leading-tight">
                {vibe.label}
              </h2>
              <p className="text-white/80 font-serif font-thin text-lg mt-1 italic">
                {vibe.tagline}
              </p>
              <button
                onClick={() => navigate(`/city/${cityId}/vibe/${vibe.id}`)}
                className="mt-5 w-full py-3.5 rounded-full bg-primary text-primary-foreground font-body font-semibold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Explore this vibe →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CityVibes;
