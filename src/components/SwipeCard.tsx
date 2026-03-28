import { useState, useRef, useCallback } from "react";

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
}

const SwipeCard = ({ children, onSwipeLeft, onSwipeRight, isTop }: SwipeCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const [exiting, setExiting] = useState<"left" | "right" | null>(null);

  const threshold = 100;

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!isTop) return;
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
  }, [isTop]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const dx = clientX - startPos.current.x;
    const dy = (clientY - startPos.current.y) * 0.3;
    setOffset({ x: dx, y: dy });
  }, [isDragging]);

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (offset.x > threshold) {
      setExiting("right");
      setTimeout(onSwipeRight, 300);
    } else if (offset.x < -threshold) {
      setExiting("left");
      setTimeout(onSwipeLeft, 300);
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [isDragging, offset.x, onSwipeLeft, onSwipeRight]);

  const rotation = offset.x * 0.08;
  const opacity = exiting ? 0 : 1;

  const getExitTransform = () => {
    if (exiting === "right") return "translateX(150%) rotate(20deg)";
    if (exiting === "left") return "translateX(-150%) rotate(-20deg)";
    return `translateX(${offset.x}px) translateY(${offset.y}px) rotate(${rotation}deg)`;
  };

  // Swipe indicator
  const swipeIndicator = offset.x > 30 ? "right" : offset.x < -30 ? "left" : null;

  return (
    <div
      ref={cardRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
      style={{
        transform: getExitTransform(),
        opacity,
        transition: isDragging ? "none" : "transform 0.3s ease, opacity 0.3s ease",
        zIndex: isTop ? 10 : 1,
      }}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={() => isDragging && handleEnd()}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
    >
      {/* Swipe indicators */}
      {swipeIndicator === "right" && (
        <div className="absolute top-6 left-6 z-20 px-4 py-2 rounded-xl border-3 border-green-400 text-green-400 font-display text-2xl font-bold rotate-[-15deg] opacity-90">
          YES ✨
        </div>
      )}
      {swipeIndicator === "left" && (
        <div className="absolute top-6 right-6 z-20 px-4 py-2 rounded-xl border-3 border-red-300 text-red-300 font-display text-2xl font-bold rotate-[15deg] opacity-90">
          SKIP
        </div>
      )}

      {children}
    </div>
  );
};

export default SwipeCard;
