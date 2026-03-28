import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

const budgetOptions = ["$", "$$", "$$$", "$$$$"];
const timeOptions = ["Early (17–19)", "Classic (19–22)", "Late (22+)"];
const foodOptions = ["Anything", "Vegetarian", "Vegan", "No preference"];

const Preferences = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vibe = searchParams.get("vibe") || "creative";

  const [where, setWhere] = useState("");
  const [budget, setBudget] = useState("$$");
  const [time, setTime] = useState("Classic (19–22)");
  const [food, setFood] = useState("Anything");

  const handleCreate = () => {
    const params = new URLSearchParams({
      vibe,
      where: where || "Surprise me",
      budget,
      time,
      food,
    });
    navigate(`/route?${params.toString()}`);
  };

  return (
    <div className="min-h-screen paper-texture flex flex-col">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-6 pt-12 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="text-ink/40 font-body text-sm mb-4 hover:text-ink transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-5xl font-display font-bold text-ink leading-none">
          Set the scene
        </h1>
        <p className="text-ink/35 font-body text-sm mt-2">
          Fine-tune your perfect evening
        </p>
      </header>

      {/* Form */}
      <div className="flex-1 w-full max-w-md mx-auto px-6 mt-8 space-y-8">
        {/* Where */}
        <div className="space-y-3">
          <label className="text-lg font-display font-bold text-ink">
            Where? ✦
          </label>
          <input
            type="text"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="Neighborhood, area, or surprise me..."
            className="w-full px-4 py-3 rounded-[16px_12px_18px_10px] border-2 border-ink/12 bg-paper font-body text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink/30 transition-colors"
          />
        </div>

        {/* Budget */}
        <div className="space-y-3">
          <label className="text-lg font-display font-bold text-ink">
            Budget
          </label>
          <div className="flex gap-2">
            {budgetOptions.map((b) => (
              <button
                key={b}
                onClick={() => setBudget(b)}
                className={`zine-chip flex-1 ${budget === b ? "selected" : ""}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="space-y-3">
          <label className="text-lg font-display font-bold text-ink">
            When?
          </label>
          <div className="flex flex-col gap-2">
            {timeOptions.map((t) => (
              <button
                key={t}
                onClick={() => setTime(t)}
                className={`zine-chip text-left ${time === t ? "selected" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Food */}
        <div className="space-y-3">
          <label className="text-lg font-display font-bold text-ink">
            Food preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {foodOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFood(f)}
                className={`zine-chip ${food === f ? "selected" : ""}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="w-full max-w-md mx-auto px-6 py-8">
        <button onClick={handleCreate} className="zine-btn">
          Create my night →
        </button>
      </div>
    </div>
  );
};

export default Preferences;
