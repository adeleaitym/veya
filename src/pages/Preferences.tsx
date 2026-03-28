import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";

const budgetOptions = ["$", "$$", "$$$", "$$$$"];
const timeOptions = ["Early (17–19)", "Classic (19–22)", "Late (22+)"];
const foodOptions = ["Anything", "Vegetarian", "Vegan", "No preference"];

const nearbyAreas = [
  "Nearby",
  "Old Town",
  "Downtown",
  "Waterfront",
  "Arts District",
  "University Area",
];

const Preferences = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vibe = searchParams.get("vibe") || "creative";

  const [where, setWhere] = useState("");
  const [budget, setBudget] = useState("$$");
  const [time, setTime] = useState("Classic (19–22)");
  const [food, setFood] = useState("Anything");
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "done" | "denied">("idle");
  const [geoLabel, setGeoLabel] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=14`
          );
          const data = await resp.json();
          const area =
            data.address?.suburb ||
            data.address?.neighbourhood ||
            data.address?.city_district ||
            data.address?.city ||
            "Your area";
          setGeoLabel(area);
          setWhere(area);
          setGeoStatus("done");
        } catch {
          setGeoStatus("done");
          setGeoLabel("Near you");
          setWhere("Near you");
        }
      },
      () => {
        setGeoStatus("denied");
      },
      { timeout: 8000 }
    );
  }, []);

  const handleChipSelect = (area: string) => {
    if (area === "Nearby" && geoLabel) {
      setWhere(geoLabel);
    } else if (area === "Nearby") {
      setWhere("Surprise me");
    } else {
      setWhere(area);
    }
  };

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

          {/* Location status */}
          {geoStatus === "loading" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/10">
              <div className="w-3 h-3 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
              <span className="text-xs font-body text-ink/50">Finding your location...</span>
            </div>
          )}

          {geoStatus === "done" && geoLabel && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/10">
              <span className="text-sm">📍</span>
              <span className="text-xs font-body text-secondary font-semibold">{geoLabel}</span>
            </div>
          )}

          {/* Area chips */}
          <div className="flex flex-wrap gap-2">
            {nearbyAreas
              .filter((area) => area !== "Nearby" || !geoLabel)
              .filter((area) => area !== geoLabel)
              .map((area) => (
                <button
                  key={area}
                  onClick={() => handleChipSelect(area)}
                  className={`zine-chip ${where === area ? "selected" : ""}`}
                >
                  {area}
                </button>
              ))}
          </div>

          {/* Free text fallback */}
          <input
            type="text"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="Or type a neighborhood..."
            className="w-full px-4 py-3 rounded-2xl border-2 border-ink/12 bg-paper font-body text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-secondary/40 transition-colors"
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
