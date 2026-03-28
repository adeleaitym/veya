import { useNavigate, useSearchParams } from "react-router-dom";

const stopIcons: Record<string, string> = {
  drink: "🍷",
  cocktail: "🍸",
  coffee: "☕",
  appetizer: "🥗",
  main: "🍽️",
  dessert: "🍰",
  snack: "🥨",
  experience: "✨",
};

const StopDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name") || "Stop";
  const type = searchParams.get("type") || "experience";
  const desc = searchParams.get("desc") || "";
  const duration = searchParams.get("duration") || "";

  const goBack = () => {
    // Try browser history first, fallback to /route
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/route");
    }
  };

  return (
    <div className="min-h-screen paper-texture flex flex-col">
      <header className="w-full max-w-md mx-auto px-6 pt-12 pb-2">
        <button
          onClick={goBack}
          className="text-ink/40 font-body text-sm mb-6 hover:text-ink transition-colors"
        >
          ← Back to route
        </button>
      </header>

      <div className="flex-1 w-full max-w-md mx-auto px-6 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-muted/20 border-2 border-ink/10 flex items-center justify-center text-5xl mb-6">
          {stopIcons[type] || "📍"}
        </div>

        <h1 className="text-4xl font-display font-bold text-ink leading-tight">
          {name}
        </h1>
        <span className="inline-block mt-2 px-3 py-1 rounded-full bg-ink/5 font-body text-xs text-ink/50 capitalize">
          {type} · {duration}
        </span>
        <p className="font-body text-sm text-ink/50 mt-6 max-w-xs leading-relaxed">
          {desc}
        </p>
      </div>

      <div className="w-full max-w-md mx-auto px-6 py-8 space-y-3">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="zine-btn"
        >
          Get directions →
        </a>
        <button
          onClick={goBack}
          className="w-full py-3 font-display text-lg text-ink/50 hover:text-ink transition-colors"
        >
          Back to route
        </button>
      </div>
    </div>
  );
};

export default StopDetail;
