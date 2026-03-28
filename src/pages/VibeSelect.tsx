import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import vibeCreative from "@/assets/vibe-creative.jpg";
import vibeRomantic from "@/assets/vibe-romantic.jpg";
import vibeEnergetic from "@/assets/vibe-energetic.jpg";
import vibeNew from "@/assets/vibe-new.jpg";
import vibeCozy from "@/assets/vibe-cozy.jpg";
import vibePlayful from "@/assets/vibe-playful.jpg";

const vibes = [
  { id: "creative", label: "Creative & Hands-on", subtitle: "Make something together", image: vibeCreative, accent: "hsl(var(--primary))" },
  { id: "romantic", label: "Slow & Romantic", subtitle: "Take your time, enjoy each other", image: vibeRomantic, accent: "hsl(var(--secondary))" },
  { id: "energetic", label: "Fun & Energetic", subtitle: "Dance, laugh, stay out late", image: vibeEnergetic, accent: "hsl(var(--accent))" },
  { id: "new", label: "Try Something New", subtitle: "Surprise me with the unexpected", image: vibeNew, accent: "hsl(var(--primary))" },
  { id: "cozy", label: "Cozy & Intimate", subtitle: "Warm corners, quiet conversations", image: vibeCozy, accent: "hsl(var(--secondary))" },
  { id: "playful", label: "Playful & Unexpected", subtitle: "Quirky spots, weird fun", image: vibePlayful, accent: "hsl(var(--accent))" },
];

const VibeSelect = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number } | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  const goNext = useCallback(() => {
    if (current < vibes.length - 1) goTo(current + 1);
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    if (current > 0) goTo(current - 1);
  }, [current, goTo]);

  const handleSelect = () => {
    navigate(`/preferences?vibe=${vibes[current].id}`);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX });
    setIsDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    setDragX(e.touches[0].clientX - touchStart.x);
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragX < -60) goNext();
    else if (dragX > 60) goPrev();
    setDragX(0);
    setTouchStart(null);
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart({ x: e.clientX });
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

  const cardVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      rotate: dir > 0 ? 8 : -8,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      rotate: 0,
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      rotate: dir > 0 ? -8 : 8,
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.25 },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen paper-texture flex flex-col overflow-hidden"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="w-full max-w-md mx-auto px-6 pt-12 pb-1"
      >
        <h1 className="text-5xl font-display font-bold text-ink leading-none">
          Choose a vibe
        </h1>
        <p className="text-ink/35 font-body text-sm mt-2">
          Swipe to explore · Tap to choose
        </p>
      </motion.header>

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
          if (diff < 1 || diff > 2) return null;
          return (
            <motion.div
              key={v.id}
              className="absolute inset-6 rounded-[24px] border-2 border-ink/8"
              animate={{
                scale: 1 - diff * 0.06,
                y: diff * 14,
                opacity: 1 - diff * 0.3,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ zIndex: 10 - diff, background: "hsl(var(--paper))" }}
            />
          );
        })}

        {/* Active card */}
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="relative w-full cursor-grab active:cursor-grabbing"
            style={{
              transform: isDragging ? `translateX(${dragX}px) rotate(${rotation}deg)` : undefined,
              transition: isDragging ? "none" : undefined,
              zIndex: 20,
            }}
          >
            <motion.button
              onClick={handleSelect}
              className="w-full text-left rounded-[24px] overflow-hidden border-2 border-ink/12 bg-paper shadow-xl"
              style={{ borderRadius: "28px 22px 26px 24px" }}
              whileHover={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Image */}
              <div className="w-full aspect-[3/4] relative overflow-hidden">
                <img
                  src={vibe.image}
                  alt={vibe.label}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
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
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + counter */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-md mx-auto px-6 pb-10 pt-4 flex flex-col items-center gap-4"
      >
        <div className="flex gap-2">
          {vibes.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => goTo(i)}
              animate={{
                width: i === current ? 24 : 8,
                background: i === current ? "hsl(var(--ink))" : "hsl(var(--ink) / 0.15)",
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="h-2 rounded-full"
            />
          ))}
        </div>
        <p className="text-xs font-body text-ink/30">
          {current + 1} of {vibes.length}
        </p>
      </motion.footer>
    </motion.div>
  );
};

export default VibeSelect;
