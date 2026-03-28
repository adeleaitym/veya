import { useNavigate } from "react-router-dom";
import { useState } from "react";

const moodEmojis = [
  { emoji: "😍", label: "Amazing" },
  { emoji: "😊", label: "Great" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😕", label: "Meh" },
];

const Feedback = () => {
  const navigate = useNavigate();
  const [mood, setMood] = useState<string | null>(null);
  const [favorite, setFavorite] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen paper-texture flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-6xl">✦</p>
        <h1 className="text-4xl font-display font-bold text-ink">Thanks!</h1>
        <p className="font-body text-sm text-ink/40 max-w-xs">
          Your feedback helps us craft even better evenings.
        </p>
        <button onClick={() => navigate("/")} className="zine-btn mt-6">
          Plan another night →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-texture flex flex-col">
      <header className="w-full max-w-md mx-auto px-6 pt-12 pb-2">
        <h1 className="text-5xl font-display font-bold text-ink leading-none">
          How was your night?
        </h1>
        <p className="text-ink/35 font-body text-sm mt-2">
          Quick thoughts — no pressure
        </p>
      </header>

      <div className="flex-1 w-full max-w-md mx-auto px-6 mt-10 space-y-10">
        {/* Mood */}
        <div className="space-y-4">
          <label className="text-lg font-display font-bold text-ink">
            Did it feel special?
          </label>
          <div className="flex gap-3 justify-center">
            {moodEmojis.map((m) => (
              <button
                key={m.label}
                onClick={() => setMood(m.label)}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${
                  mood === m.label
                    ? "bg-primary/10 scale-110"
                    : "hover:bg-ink/5"
                }`}
              >
                <span className="text-4xl">{m.emoji}</span>
                <span className="text-xs font-body text-ink/50">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Favorite part */}
        <div className="space-y-3">
          <label className="text-lg font-display font-bold text-ink">
            Favorite part?
          </label>
          <textarea
            value={favorite}
            onChange={(e) => setFavorite(e.target.value)}
            placeholder="The cocktails were incredible..."
            rows={3}
            className="w-full px-4 py-3 rounded-[16px_12px_18px_10px] border-2 border-ink/12 bg-paper font-body text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/30 transition-colors resize-none"
          />
        </div>
      </div>

      {/* CTA */}
      <div className="w-full max-w-md mx-auto px-6 py-8">
        <button
          onClick={() => setSubmitted(true)}
          disabled={!mood}
          className="zine-btn"
        >
          Send feedback ✦
        </button>
      </div>
    </div>
  );
};

export default Feedback;
