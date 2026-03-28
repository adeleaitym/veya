import { useNavigate } from "react-router-dom";
import vibeCreative from "@/assets/vibe-creative.png";
import vibeRomantic from "@/assets/vibe-romantic.png";
import vibeEnergetic from "@/assets/vibe-energetic.png";
import vibeNew from "@/assets/vibe-new.png";
import vibeCozy from "@/assets/vibe-cozy.png";
import vibePlayful from "@/assets/vibe-playful.png";

const vibes = [
  {
    id: "creative",
    label: "Creative & Hands-on",
    subtitle: "Make something together",
    image: vibeCreative,
  },
  {
    id: "romantic",
    label: "Slow & Romantic",
    subtitle: "Take your time, enjoy each other",
    image: vibeRomantic,
  },
  {
    id: "energetic",
    label: "Fun & Energetic",
    subtitle: "Dance, laugh, stay out late",
    image: vibeEnergetic,
  },
  {
    id: "new",
    label: "Try Something New",
    subtitle: "Surprise me with the unexpected",
    image: vibeNew,
  },
  {
    id: "cozy",
    label: "Cozy & Intimate",
    subtitle: "Warm corners, quiet conversations",
    image: vibeCozy,
  },
  {
    id: "playful",
    label: "Playful & Unexpected",
    subtitle: "Quirky spots, weird fun",
    image: vibePlayful,
  },
];

const tiltClasses = ["tilt-1", "tilt-5", "tilt-3", "tilt-6", "tilt-2", "tilt-7"];

const VibeSelect = () => {
  const navigate = useNavigate();

  const handleSelect = (vibeId: string) => {
    navigate(`/preferences?vibe=${vibeId}`);
  };

  return (
    <div className="min-h-screen paper-texture flex flex-col">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-6 pt-14 pb-2">
        <h1 className="text-6xl font-display font-bold text-ink leading-none">
          Choose a vibe
        </h1>
        <p className="text-ink/40 font-body text-sm mt-3">
          How do you want to feel tonight?
        </p>
      </header>

      {/* Vibe Cards */}
      <section className="w-full max-w-md mx-auto px-6 pt-8 pb-20 space-y-5">
        {vibes.map((vibe, i) => (
          <button
            key={vibe.id}
            onClick={() => handleSelect(vibe.id)}
            className={`group w-full zine-card p-0 overflow-hidden flex items-stretch min-h-[140px] text-left transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] ${tiltClasses[i]}`}
          >
            {/* Image side */}
            <div className="w-[120px] flex-shrink-0 bg-muted/20 flex items-center justify-center p-3">
              <img
                src={vibe.image}
                alt={vibe.label}
                width={512}
                height={640}
                loading={i < 2 ? "eager" : "lazy"}
                className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </div>

            {/* Text side */}
            <div className="flex-1 flex flex-col justify-center px-5 py-4">
              <h2 className="text-2xl font-display font-bold text-ink leading-tight group-hover:text-primary transition-colors">
                {vibe.label}
              </h2>
              <p className="text-sm font-body text-ink/40 mt-1.5 leading-relaxed">
                {vibe.subtitle}
              </p>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
};

export default VibeSelect;
