import heroMap from "@/assets/hero-map.jpg";
import iconNoodles from "@/assets/icon-noodles.png";
import iconCoffee from "@/assets/icon-coffee.png";
import iconPin from "@/assets/icon-pin.png";
import { Button } from "@/components/ui/button";

const features = [
  { icon: iconPin, label: "Curated routes", desc: "Handpicked paths through iconic neighborhoods" },
  { icon: iconNoodles, label: "Local eats", desc: "From street stalls to hidden gems" },
  { icon: iconCoffee, label: "Café stops", desc: "Rest, refuel, and people-watch" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-6 pt-10 pb-4 text-center">
        <p className="text-xs font-body tracking-[0.35em] uppercase text-muted-foreground mb-2">
          Explore · Taste · Wander
        </p>
        <h1 className="text-5xl font-display text-foreground leading-tight">
          Veya
        </h1>
        <p className="mt-3 text-base font-body text-muted-foreground leading-relaxed">
          Curated city journeys<br />through food
        </p>
      </header>

      {/* Hero map */}
      <section className="w-full max-w-md mx-auto px-4 mt-2">
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <img
            src={heroMap}
            alt="Illustrated city food map"
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
            className="flex items-start gap-4 animate-fade-up"
            style={{ animationDelay: `${i * 150}ms`, animationFillMode: "backwards" }}
          >
            <img
              src={f.icon}
              alt={f.label}
              width={48}
              height={48}
              loading="lazy"
              className="w-12 h-12 object-contain flex-shrink-0 animate-float"
              style={{ animationDelay: `${i * 600}ms` }}
            />
            <div>
              <h3 className="text-sm font-body font-medium tracking-wide uppercase text-foreground">
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
        <Button
          size="lg"
          className="w-full rounded-full text-base font-body font-medium tracking-wide h-14 bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Start your route
        </Button>
        <p className="text-center text-xs font-body text-muted-foreground mt-4">
          Available in Kuala Lumpur, Bangkok & Lisbon
        </p>
      </section>
    </div>
  );
};

export default Index;
