import { useNavigate } from "react-router-dom";
import heroMap from "@/assets/hero-map.jpg";
import iconNoodles from "@/assets/icon-noodles.png";
import iconCoffee from "@/assets/icon-coffee.png";
import iconPin from "@/assets/icon-pin.png";

const features = [
  { icon: iconPin, label: "Curated routes", desc: "Handpicked paths through iconic neighborhoods" },
  { icon: iconNoodles, label: "Local eats", desc: "From street stalls to hidden gems" },
  { icon: iconCoffee, label: "Café stops", desc: "Rest, refuel, and people-watch" },
];

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen paper-texture flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-6 pt-12 pb-2 text-center">
        <h1 className="text-8xl font-display font-bold text-secondary leading-none">
          Veya
        </h1>
        <p className="text-ink/40 text-xl font-display mt-2">
          Curated city journeys through food ✦
        </p>
      </header>

      {/* Hero map */}
      <section className="w-full max-w-md mx-auto px-5 mt-6">
        <div className="sketch-border overflow-hidden tilt-2">
          <img
            src={heroMap}
            alt="Illustrated city food map with winding path"
            width={768}
            height={960}
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-md mx-auto px-6 mt-10 space-y-5">
        {features.map((f, i) => (
          <div
            key={f.label}
            className={`zine-card flex items-start gap-4 animate-fade-up ${["tilt-1", "tilt-5", "tilt-3"][i]}`}
            style={{ animationDelay: `${i * 150}ms`, animationFillMode: "backwards" }}
          >
            {i === 0 && <div className="tape-strip" />}
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <img
                src={f.icon}
                alt={f.label}
                width={32}
                height={32}
                loading="lazy"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h3 className="text-sm font-display text-ink font-bold text-lg">
                {f.label}
              </h3>
              <p className="text-xs font-body text-ink/40 mt-0.5">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="w-full max-w-md mx-auto px-6 mt-12 mb-16">
        <button
          onClick={() => navigate("/vibes")}
          className="zine-btn"
        >
          Start your route →
        </button>
        <p className="text-center text-xs font-display text-ink/30 mt-4 text-base">
          Available in 10 cities worldwide ✦
        </p>
      </section>
    </div>
  );
};

export default Index;
