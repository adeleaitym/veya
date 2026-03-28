import { useNavigate } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";

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
            className="w-full h-[380px] object-cover object-center"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* Overlay text */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-6">
            <h2 className="text-3xl font-display font-bold text-white leading-tight drop-shadow-lg">
              Curated evenings<br />that just work ✦
            </h2>
            <p className="font-body text-white/70 text-sm mt-1.5">
              Swipe a vibe. Get a plan. Live it tonight.
            </p>
          </div>
        </div>
      </section>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA */}
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
