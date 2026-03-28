import { useNavigate } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";
import iconNoodles from "@/assets/icon-noodles.png";
import iconCoffee from "@/assets/icon-coffee.png";
import iconPin from "@/assets/icon-pin.png";

const features = [
  { icon: iconPin, label: "Pick your vibe", desc: "Choose a mood and we design the night" },
  { icon: iconNoodles, label: "Curated stops", desc: "Dinner, drinks, activities — all planned" },
  { icon: iconCoffee, label: "Share & enjoy", desc: "Send it as a card, live it together" },
];

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen paper-texture flex flex-col">
      {/* Top bar */}
      <header className="w-full max-w-md mx-auto px-6 pt-6 pb-0 flex items-center justify-between">
        <h1 className="text-4xl font-display font-bold text-secondary leading-none">
          Veya
        </h1>
        <span className="text-ink/25 font-body text-xs tracking-widest uppercase">
          Stockholm
        </span>
      </header>

      {/* Hero — full-width immersive */}
      <section className="w-full max-w-md mx-auto px-4 mt-4">
        <div className="relative rounded-3xl overflow-hidden shadow-xl">
          <img
            src={heroIllustration}
            alt="Illustrated character dancing in Stockholm tunnelbana"
            width={768}
            height={960}
            className="w-full h-[320px] object-cover object-center"
          />
          {/* Gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* Overlay text */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <h2 className="text-3xl font-display font-bold text-white leading-tight drop-shadow-lg">
              Curated evenings<br />that just work ✦
            </h2>
            <p className="font-body text-white/70 text-sm mt-1.5">
              Swipe a vibe. Get a plan. Live it tonight.
            </p>
          </div>
        </div>
      </section>

      {/* Quick features — horizontal scroll */}
      <section className="w-full max-w-md mx-auto mt-6 px-4">
        <div className="flex gap-3">
          {features.map((f, i) => (
            <div
              key={f.label}
              className="flex-1 min-w-0 rounded-2xl border-2 border-ink/8 bg-paper p-4 flex flex-col items-center text-center gap-2 animate-fade-up"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
            >
              <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-secondary/10">
                <img
                  src={f.icon}
                  alt={f.label}
                  width={28}
                  height={28}
                  loading="lazy"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <h3 className="font-display text-ink font-bold text-base leading-tight">
                {f.label}
              </h3>
              <p className="text-[11px] font-body text-ink/40 leading-snug">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA — sticky at bottom */}
      <section className="w-full max-w-md mx-auto px-5 pb-8 pt-4">
        <button
          onClick={() => navigate("/vibes")}
          className="zine-btn"
        >
          Plan my night →
        </button>
        <p className="text-center font-body text-ink/25 mt-3 text-xs">
          Evenings designed around your mood ✦
        </p>
      </section>
    </div>
  );
};

export default Index;
