import { useNavigate } from "react-router-dom";
import cityKL from "@/assets/city-kuala-lumpur.jpg";
import cityBangkok from "@/assets/city-bangkok.jpg";
import cityLisbon from "@/assets/city-lisbon.jpg";

const cities = [
  { id: "kuala-lumpur", name: "Kuala Lumpur", country: "Malaysia", routes: 8, img: cityKL },
  { id: "bangkok", name: "Bangkok", country: "Thailand", routes: 12, img: cityBangkok },
  { id: "lisbon", name: "Lisbon", country: "Portugal", routes: 6, img: cityLisbon },
];

const CitySelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-6 pt-10 pb-2">
        <button
          onClick={() => navigate("/")}
          className="text-muted-foreground font-body text-sm mb-4 hover:text-foreground transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-5xl font-display font-bold text-foreground leading-none">
          Pick a city
        </h1>
        <p className="text-foreground leading-none text-lg font-serif font-thin mt-2">
          Where are you heading?
        </p>
      </header>

      {/* City cards */}
      <section className="w-full max-w-md mx-auto px-6 mt-8 space-y-5 pb-16">
        {cities.map((city, i) => (
          <button
            key={city.id}
            onClick={() => navigate(`/city/${city.id}`)}
            className="w-full rounded-2xl overflow-hidden bg-card/50 border-2 border-border shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all animate-fade-up text-left"
            style={{ animationDelay: `${i * 120}ms`, animationFillMode: "backwards" }}
          >
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={city.img}
                alt={`Illustrated view of ${city.name}`}
                width={512}
                height={640}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5">
              <h2 className="text-2xl font-display font-bold text-foreground leading-tight">
                {city.name}
              </h2>
              <p className="text-sm font-body text-muted-foreground mt-1">
                {city.country} · {city.routes} routes
              </p>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
};

export default CitySelect;
