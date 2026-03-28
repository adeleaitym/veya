import { useNavigate } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";
import iconNoodles from "@/assets/icon-noodles.png";
import iconCoffee from "@/assets/icon-coffee.png";
import iconPin from "@/assets/icon-pin.png";

const features = [
  { icon: iconPin, label: "Pick your vibe", desc: "Choose a mood and we design the night" },
  { icon: iconNoodles, label: "Curated experiences", desc: "Dinner, drinks, activities — all planned for you" },
  { icon: iconCoffee, label: "Share & enjoy", desc: "Send it as a card, live it together" },
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
          Curated evenings that just work ✦
        </p>
      </header>

      {/* Hero map */}
      <section className="w-full max-w-md mx-auto px-5 mt-6">
        <div className="sketch-border overflow-hidden tilt-2">
          <img
            src={heroIllustration}
            alt="Illustrated character dancing in Stockholm tunnelbana"
            width={768}
            height={960}
            className="w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* Features */}
      <section className="w-full max-w-md mx-auto px-6 mt-10 space-y-4">
        {features.map((f, i) => (
          <div
            key={f.label}
            className={`zine-card flex items-center gap-5 p-5 animate-fade-up ${["tilt-1", "tilt-5", "tilt-3"][i]}`}
            style={{ animationDelay: `${i * 150}ms`, animationFillMode: "backwards" }}
          >
            {i === 0 && <div className="tape-strip" />}
            <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 rounded-2xl bg-muted/20">
              <img
                src={f.icon}
                alt={f.label}
                width={40}
                height={40}
                loading="lazy"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-ink font-bold text-xl leading-snug">
                {f.label}
              </h3>
              <p className="text-sm font-body text-ink/45 mt-1 leading-relaxed">
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
          className="w-full py-4 px-6 rounded-2xl text-primary-foreground font-body font-semibold text-lg tracking-wide shadow-lg shadow-primary/25 active:scale-[0.98] transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 bg-secondary"
        >
          Plan my night
        </button>
        <p className="text-center font-body text-ink/30 mt-4 text-sm">
          Evenings designed around your mood ✦
        </p>
      </section>
    </div>
  );
};

export default Index;
