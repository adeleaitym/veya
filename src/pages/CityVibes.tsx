import { useNavigate, useParams } from "react-router-dom";

const cityData: Record<string, { name: string; country: string; tagline: string }> = {
  stockholm: { name: "Stockholm", country: "Sweden", tagline: "Nordic flavours between the islands" },
  paris: { name: "Paris", country: "France", tagline: "Every corner hides a craving" },
  london: { name: "London", country: "England", tagline: "A melting pot on every street" },
  tokyo: { name: "Tokyo", country: "Japan", tagline: "Precision meets soul in every bite" },
  barcelona: { name: "Barcelona", country: "Spain", tagline: "Sun-drenched plates by the sea" },
  istanbul: { name: "Istanbul", country: "Turkey", tagline: "Where continents collide on a plate" },
  "new-york": { name: "New York", country: "USA", tagline: "The city that never stops eating" },
  "mexico-city": { name: "Mexico City", country: "Mexico", tagline: "Layered flavours, deep roots" },
  marrakech: { name: "Marrakech", country: "Morocco", tagline: "Spice-kissed streets and rooftop feasts" },
  bangkok: { name: "Bangkok", country: "Thailand", tagline: "Heat, sweet, sour — all at once" },
};

interface Vibe {
  id: string;
  emoji: string;
  label: string;
}

const vibeGroups: { title: string; vibes: Vibe[] }[] = [
  {
    title: "Mood",
    vibes: [
      { id: "date-night", emoji: "🌙", label: "Date night" },
      { id: "solo-adventure", emoji: "🎒", label: "Solo adventure" },
      { id: "sunday-brunch", emoji: "☀️", label: "Sunday brunch" },
      { id: "late-night", emoji: "🌃", label: "Late-night bites" },
    ],
  },
  {
    title: "Experience",
    vibes: [
      { id: "hidden-gems", emoji: "💎", label: "Hidden gems" },
      { id: "rooftop-views", emoji: "🏙️", label: "Rooftop views" },
      { id: "waterfront", emoji: "🌊", label: "Waterfront dining" },
      { id: "historic-quarter", emoji: "🏛️", label: "Historic quarter" },
    ],
  },
  {
    title: "Cuisine",
    vibes: [
      { id: "street-food", emoji: "🍜", label: "Street food" },
      { id: "fine-dining", emoji: "🍷", label: "Fine dining" },
      { id: "local-markets", emoji: "🧺", label: "Local markets" },
      { id: "bakery-hopping", emoji: "🥐", label: "Bakery hopping" },
    ],
  },
];

const CityVibes = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const city = cityData[cityId || ""] || { name: cityId, country: "", tagline: "" };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-6 pt-10 pb-2">
        <button
          onClick={() => navigate("/cities")}
          className="text-muted-foreground font-body text-sm mb-4 hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-display font-bold text-foreground leading-none">
          {city.name}
        </h1>
        <p className="text-foreground leading-none text-lg font-serif font-thin mt-2">
          {city.tagline}
        </p>
      </header>

      {/* Vibe groups */}
      <section className="w-full max-w-md mx-auto px-6 mt-8 pb-16 space-y-8">
        {vibeGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-xs font-body font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              {group.title}
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {group.vibes.map((vibe, i) => (
                <button
                  key={vibe.id}
                  onClick={() => navigate(`/city/${cityId}/vibe/${vibe.id}`)}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-card/40 px-4 py-3.5 text-left hover:bg-card/70 hover:scale-[1.03] hover:shadow-md transition-all animate-fade-up"
                  style={{
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <span className="text-xl">{vibe.emoji}</span>
                  <span className="text-sm font-body font-medium text-foreground leading-tight">
                    {vibe.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default CityVibes;
