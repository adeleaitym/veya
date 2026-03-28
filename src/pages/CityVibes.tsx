import { useNavigate, useParams } from "react-router-dom";

import iconDateNight from "@/assets/icon-date-night.png";
import iconSoloAdventure from "@/assets/icon-solo-adventure.png";
import iconBrunch from "@/assets/icon-brunch.png";
import iconStreetFood from "@/assets/icon-street-food.png";
import iconHiddenGems from "@/assets/icon-hidden-gems.png";
import iconRooftop from "@/assets/icon-rooftop.png";
import iconMarkets from "@/assets/icon-markets.png";
import iconBakery from "@/assets/icon-bakery.png";

const cityNames: Record<string, { name: string; tagline: string }> = {
  stockholm: { name: "Stockholm", tagline: "Nordic flavours between the islands" },
  paris: { name: "Paris", tagline: "Every corner hides a craving" },
  london: { name: "London", tagline: "A melting pot on every street" },
  tokyo: { name: "Tokyo", tagline: "Precision meets soul in every bite" },
  barcelona: { name: "Barcelona", tagline: "Sun-drenched plates by the sea" },
  istanbul: { name: "Istanbul", tagline: "Where continents collide on a plate" },
  "new-york": { name: "New York", tagline: "The city that never stops eating" },
  "mexico-city": { name: "Mexico City", tagline: "Layered flavours, deep roots" },
  marrakech: { name: "Marrakech", tagline: "Spice-kissed streets and rooftop feasts" },
  bangkok: { name: "Bangkok", tagline: "Heat, sweet, sour — all at once" },
};

const vibes = [
  { id: "date-night", label: "Date night", tagline: "The city slows down after dark", icon: iconDateNight },
  { id: "solo-adventure", label: "Solo adventure", tagline: "Get lost on purpose", icon: iconSoloAdventure },
  { id: "sunday-brunch", label: "Sunday brunch", tagline: "Morning light, warm pastries", icon: iconBrunch },
  { id: "street-food", label: "Street food", tagline: "Follow the smoke", icon: iconStreetFood },
  { id: "hidden-gems", label: "Hidden gems", tagline: "Behind the unmarked door", icon: iconHiddenGems },
  { id: "rooftop-views", label: "Rooftop views", tagline: "Sip above the skyline", icon: iconRooftop },
  { id: "local-markets", label: "Local markets", tagline: "Taste what the locals taste", icon: iconMarkets },
  { id: "bakery-hopping", label: "Bakery hopping", tagline: "One croissant is never enough", icon: iconBakery },
];

// Positions along the winding path — alternating left/right
const vibePositions = [
  { x: "72%", y: "6%" },
  { x: "12%", y: "18%" },
  { x: "65%", y: "28%" },
  { x: "8%",  y: "38%" },
  { x: "62%", y: "48%" },
  { x: "10%", y: "58%" },
  { x: "60%", y: "68%" },
  { x: "15%", y: "78%" },
];

const CityVibes = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const city = cityNames[cityId || ""] || { name: cityId, tagline: "" };

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-6 pt-8 pb-2 relative z-10">
        <button
          onClick={() => navigate("/cities")}
          className="text-foreground/70 font-body text-sm mb-3 hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-display font-bold text-foreground leading-none">
          {city.name}
        </h1>
        <p className="text-foreground/80 leading-none text-base font-serif font-thin mt-1">
          {city.tagline}
        </p>
        <p className="text-foreground/50 font-body text-xs uppercase tracking-widest mt-4">
          Choose your vibe
        </p>
      </header>

      {/* Poster-style illustrated path */}
      <section className="w-full max-w-md mx-auto relative" style={{ height: "1200px" }}>
        {/* Winding pink ribbon SVG */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 390 1200"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M 310 60 
               C 310 120, 80 120, 80 200 
               C 80 280, 300 280, 300 360 
               C 300 440, 70 440, 70 520 
               C 70 600, 290 600, 290 680 
               C 290 760, 80 760, 80 840 
               C 80 920, 280 920, 280 1000
               C 280 1080, 100 1080, 100 1160"
            stroke="hsl(352, 58%, 78%)"
            strokeWidth="38"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M 310 60 
               C 310 120, 80 120, 80 200 
               C 80 280, 300 280, 300 360 
               C 300 440, 70 440, 70 520 
               C 70 600, 290 600, 290 680 
               C 290 760, 80 760, 80 840 
               C 80 920, 280 920, 280 1000
               C 280 1080, 100 1080, 100 1160"
            stroke="hsl(352, 58%, 84%)"
            strokeWidth="22"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
        </svg>

        {/* Vibe stops along the path */}
        {vibes.map((vibe, i) => {
          const pos = vibePositions[i];
          const isLeft = parseFloat(pos.x) < 40;

          return (
            <button
              key={vibe.id}
              onClick={() => navigate(`/city/${cityId}/vibe/${vibe.id}`)}
              className="absolute group"
              style={{
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, 0)",
              }}
            >
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white/90 shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-200 mx-auto">
                <img
                  src={vibe.icon}
                  alt={vibe.label}
                  width={512}
                  height={512}
                  loading="lazy"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              {/* Label */}
              <div className={`mt-1.5 ${isLeft ? "text-left" : "text-center"}`}>
                <p className="text-sm font-display font-bold text-foreground leading-tight whitespace-nowrap">
                  {vibe.label}
                </p>
                <p className="text-[10px] font-body text-foreground/60 leading-tight whitespace-nowrap">
                  {vibe.tagline}
                </p>
              </div>
            </button>
          );
        })}

        {/* Decorative small elements */}
        <div className="absolute top-[14%] left-[50%] text-foreground/20 text-lg">✦</div>
        <div className="absolute top-[34%] right-[15%] text-foreground/15 text-sm">✦</div>
        <div className="absolute top-[54%] left-[42%] text-foreground/20 text-base">✦</div>
        <div className="absolute top-[74%] right-[30%] text-foreground/15 text-lg">✦</div>
        <div className="absolute top-[90%] left-[50%] text-foreground/20 text-sm">✦</div>
      </section>
    </div>
  );
};

export default CityVibes;
