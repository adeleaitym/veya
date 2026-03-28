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
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-6 pt-10 pb-2 text-center">
        <h1 className="text-7xl font-display font-bold text-foreground leading-none">
          Veya
        </h1>
        <p className="text-foreground leading-none text-lg font-serif font-thin">
          Curated city journeys<br />through food
        </p>
      </header>

      {/* Hero map */}
      <section className="w-full max-w-md mx-auto px-4 mt-4">
        <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-border">
          <img
            src={heroMap}
            alt="Illustrated city food map with winding pink path through green neighborhoods"
            width={768}
            height={960}
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-md mx-auto px-6 mt-10 space-y-6">
        {features.map((f, i) => (
          <div
            key={f.label}
            className="flex items-start gap-4 bg-card/50 rounded-xl p-4 animate-fade-up"
            style={{ animationDelay: `${i * 150}ms`, animationFillMode: "backwards" }}
          >
            <div className="w-12 h-12 rounded-lg bg-secondary/60 flex items-center justify-center flex-shrink-0">
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
              <h3 className="text-sm font-body font-semibold tracking-wide uppercase text-foreground">
                {f.label}
              </h3>
              <p className="text-sm font-body text-muted-foreground mt-0.5">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="w-full max-w-md mx-auto px-6 mt-12 mb-16">
        <button className="w-full rounded-full text-base font-body font-semibold tracking-wide h-14 bg-primary text-primary-foreground hover:brightness-110 transition-all shadow-lg">
          Start your route
        </button>
        <p className="text-center text-xs font-body text-muted-foreground mt-4">
          Available in Kuala Lumpur, Bangkok & Lisbon
        </p>
      </section>
    </div>
  );
};

export default Index;
