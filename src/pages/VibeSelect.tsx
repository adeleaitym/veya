import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
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
    accent: "hsl(var(--primary))",
  },
  {
    id: "romantic",
    label: "Slow & Romantic",
    subtitle: "Take your time, enjoy each other",
    image: vibeRomantic,
    accent: "hsl(var(--secondary))",
  },
  {
    id: "energetic",
    label: "Fun & Energetic",
    subtitle: "Dance, laugh, stay out late",
    image: vibeEnergetic,
    accent: "hsl(var(--accent))",
  },
  {
    id: "new",
    label: "Try Something New",
    subtitle: "Surprise me with the unexpected",
    image: vibeNew,
    accent: "hsl(var(--primary))",
  },
  {
    id: "cozy",
    label: "Cozy & Intimate",
    subtitle: "Warm corners, quiet conversations",
    image: vibeCozy,
    accent: "hsl(var(--secondary))",
  },
  {
    id: "playful",
    label: "Playful & Unexpected",
    subtitle: "Quirky spots, weird fun",
    image: vibePlayful,
    accent: "hsl(var(--accent))",
  },
];

const VibeSelect = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const goNext = useCallback(() => {
    if (current < vibes.length - 1) {
      setExitDir("left");
      setTimeout(() => {
        setCurrent((c) => c + 1);
        setExitDir(null);
      }, 250);
    }
  }, [current]);

  const goPrev = useCallback(() => {
    if (current > 0) {
      setExitDir("right");
      setTimeout(() => {
        setCurrent((c) => c - 1);
        setExitDir(null);
      }, 250);
    }
  }, [current]);

  const handleSelect = () => {
    navigate(`/preferences?vibe=${vibes[current].id}`);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const dx = e.touches[0].clientX - touchStart.x;
    setDragX(dx);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragX < -60) goNext();
    else if (dragX > 60) goPrev();
    setDragX(0);
    setTouchStart(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !touchStart) return;
    setDragX(e.clientX - touchStart.x);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX < -60) goNext();
    else if (dragX > 60) goPrev();
    setDragX(0);
    setTouchStart(null);
  };

  const vibe = vibes[current];
  const rotation = isDragging ? dragX * 0.04 : 0;

  return (
    <div className="min-h-screen paper-texture flex flex-col overflow-hidden">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-6 pt-12 pb-1">
        <h1 className="text-5xl font-display font-bold text-ink leading-none">
          Choose a vibe
        </h1>
        <p className="text-ink/35 font-body text-sm mt-2">
          Swipe to explore · Tap to choose
        </p>
      </header>

      {/* Card stack area */}
      <div
        className="flex-1 relative w-full max-w-md mx-auto px-6 flex items-center justify-center select-none"
        style={{ minHeight: "380px" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => isDragging && handleMouseUp()}
      >
        {/* Background cards (stack effect) */}
        {vibes.map((v, i) => {
          const diff = i - current;
          if (diff < 0 || diff > 2) return null;
          if (diff === 0) return null; // rendered separately

          return (
            <div
              key={v.id}
              className="absolute inset-6 rounded-[24px] border-2 border-ink/8"
              style={{
                transform: `scale(${1 - diff * 0.06}) translateY(${diff * 14}px)`,
                opacity: 1 - diff * 0.3,
                zIndex: 10 - diff,
                background: "hsl(var(--paper))",
                transition: "all 0.3s ease",
              }}
            />
          );
        })}

        {/* Active card */}
        <div
          className="relative w-full cursor-grab active:cursor-grabbing"
          style={{
            transform: exitDir
              ? `translateX(${exitDir === "left" ? "-120%" : "120%"}) rotate(${exitDir === "left" ? "-12" : "12"}deg)`
              : `translateX(${dragX}px) rotate(${rotation}deg)`,
            opacity: exitDir ? 0 : 1,
            transition: isDragging ? "none" : "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
            zIndex: 20,
          }}
        >
          <button
            onClick={handleSelect}
            className="w-full text-left rounded-[24px] overflow-hidden border-2 border-ink/12 bg-paper shadow-xl hover:shadow-2xl transition-shadow"
            style={{ borderRadius: "28px 22px 26px 24px" }}
          >
            {/* Image */}
            <div className="w-full aspect-[4/3] bg-muted/15 flex items-center justify-center p-6 relative overflow-hidden">
              <img
                src={vibe.image}
                alt={vibe.label}
                width={512}
                height={640}
                className="h-full w-auto object-contain relative z-10"
                draggable={false}
              />
              {/* Soft glow behind image */}
              <div
                className="absolute inset-0 opacity-10 blur-3xl"
                style={{ background: vibe.accent }}
              />
            </div>

            {/* Text */}
            <div className="px-6 py-5">
              <h2 className="text-3xl font-display font-bold text-ink leading-tight">
                {vibe.label}
              </h2>
              <p className="text-sm font-body text-ink/40 mt-1.5">
                {vibe.subtitle}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Dots + counter */}
      <footer className="w-full max-w-md mx-auto px-6 pb-10 pt-4 flex flex-col items-center gap-4">
        {/* Dots */}
        <div className="flex gap-2">
          {vibes.map((_, i) => (
            <button
              key={i}
              onClick={() => { setExitDir(i > current ? "left" : "right"); setTimeout(() => { setCurrent(i); setExitDir(null); }, 200); }}
              className="transition-all duration-300"
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === current ? "hsl(var(--ink))" : "hsl(var(--ink) / 0.15)",
              }}
            />
          ))}
        </div>

        <p className="text-xs font-body text-ink/30">
          {current + 1} of {vibes.length}
        </p>
      </footer>
    </div>
  );
};

export default VibeSelect;
