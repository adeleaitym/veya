import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const budgetOptions = ["$", "$$", "$$$", "$$$$"];
const timeOptions = ["Early (17–19)", "Classic (19–22)", "Late (22+)"];
const foodOptions = [
  "Anything", "Vegetarian", "Vegan", "Gluten-free", "Halal",
  "Kosher", "Pescatarian", "Dairy-free", "Keto / Low-carb", "No preference",
];

const cityNeighborhoods: Record<string, string[]> = {
  Stockholm: ["Södermalm", "Gamla Stan", "Östermalm", "Vasastan", "Kungsholmen", "Djurgården"],
  Gothenburg: ["Haga", "Linné", "Majorna", "Nordstan", "Avenyn", "Långgatorna"],
  Malmö: ["Möllevången", "Davidshall", "Västra Hamnen", "Gamla Staden", "Triangeln"],
  Copenhagen: ["Nørrebro", "Vesterbro", "Frederiksberg", "Christianshavn", "Indre By"],
  Oslo: ["Grünerløkka", "Aker Brygge", "Frogner", "Majorstuen", "Torshov"],
  Helsinki: ["Kallio", "Punavuori", "Kruununhaka", "Kamppi", "Eira"],
  London: ["Soho", "Shoreditch", "Covent Garden", "Camden", "Brixton", "Notting Hill"],
  Berlin: ["Kreuzberg", "Mitte", "Prenzlauer Berg", "Friedrichshain", "Neukölln"],
  Paris: ["Le Marais", "Montmartre", "Saint-Germain", "Bastille", "Belleville"],
  Barcelona: ["El Born", "Gràcia", "Raval", "Eixample", "Barceloneta"],
  Amsterdam: ["De Pijp", "Jordaan", "De 9 Straatjes", "Oud-West", "Oost"],
  "New York": ["East Village", "Williamsburg", "West Village", "Lower East Side", "SoHo"],
};
const defaultNeighborhoods = ["Old Town", "Downtown", "Waterfront", "Arts District", "University Area"];

const getNeighborhoods = (city: string): string[] => {
  const exact = cityNeighborhoods[city];
  if (exact) return exact;
  const lower = city.toLowerCase();
  for (const [key, areas] of Object.entries(cityNeighborhoods)) {
    if (key.toLowerCase() === lower || lower.includes(key.toLowerCase())) return areas;
  }
  return defaultNeighborhoods;
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

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
  const [detectedCity, setDetectedCity] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) { setGeoStatus("denied"); return; }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=14`);
          const data = await resp.json();
          const area = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || data.address?.city || "Your area";
          const city = data.address?.city || data.address?.town || "";
          setGeoLabel(area); setWhere(area); setDetectedCity(city); setGeoStatus("done");
        } catch { setGeoStatus("done"); setGeoLabel("Near you"); setWhere("Near you"); }
      },
      () => setGeoStatus("denied"),
      { timeout: 8000 }
    );
  }, []);

  const neighborhoods = getNeighborhoods(detectedCity);

  const handleCreate = () => {
    const cityContext = detectedCity || where;
    const params = new URLSearchParams({ vibe, where: where || "Surprise me", budget, time, food, city: cityContext });
    navigate(`/route?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen paper-texture flex flex-col"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-auto px-6 pt-12 pb-2"
      >
        <button onClick={() => navigate(-1)} className="text-ink/40 font-body text-sm mb-4 hover:text-ink transition-colors">
          ← Back
        </button>
        <h1 className="text-5xl font-display font-bold text-ink leading-none">Set the scene</h1>
        <p className="text-ink/35 font-body text-sm mt-2">Fine-tune your perfect evening</p>
      </motion.header>

      {/* Form */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex-1 w-full max-w-md mx-auto px-6 mt-8 space-y-8"
      >
        {/* Where */}
        <motion.div variants={fadeUp} className="space-y-3">
          <label className="text-lg font-display font-bold text-ink">Where? ✦</label>
          {geoStatus === "loading" && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/10">
              <div className="w-3 h-3 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
              <span className="text-xs font-body text-ink/50">Finding your location...</span>
            </div>
          )}
          {geoStatus === "done" && geoLabel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/10"
            >
              <span className="text-sm">📍</span>
              <span className="text-xs font-body text-secondary font-semibold">
                {geoLabel}{detectedCity ? `, ${detectedCity}` : ""}
              </span>
            </motion.div>
          )}
          <div className="flex flex-wrap gap-2">
            {geoLabel && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setWhere(geoLabel)}
                className={`zine-chip ${where === geoLabel ? "selected" : ""}`}
              >
                📍 {geoLabel}
              </motion.button>
            )}
            {neighborhoods.filter((a) => a !== geoLabel).map((area) => (
              <motion.button
                key={area}
                whileTap={{ scale: 0.95 }}
                onClick={() => setWhere(area)}
                className={`zine-chip ${where === area ? "selected" : ""}`}
              >
                {area}
              </motion.button>
            ))}
          </div>
          <input
            type="text"
            value={where}
            onChange={(e) => setWhere(e.target.value)}
            placeholder="Or type a neighborhood..."
            className="w-full px-4 py-3 rounded-2xl border-2 border-ink/12 bg-paper font-body text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-secondary/40 transition-colors"
          />
        </motion.div>

        {/* Budget */}
        <motion.div variants={fadeUp} className="space-y-3">
          <label className="text-lg font-display font-bold text-ink">Budget</label>
          <div className="flex gap-2">
            {budgetOptions.map((b) => (
              <motion.button
                key={b}
                whileTap={{ scale: 0.92 }}
                onClick={() => setBudget(b)}
                className={`zine-chip flex-1 ${budget === b ? "selected" : ""}`}
              >
                {b}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Time */}
        <motion.div variants={fadeUp} className="space-y-3">
          <label className="text-lg font-display font-bold text-ink">When?</label>
          <div className="flex flex-col gap-2">
            {timeOptions.map((t) => (
              <motion.button
                key={t}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTime(t)}
                className={`zine-chip text-left ${time === t ? "selected" : ""}`}
              >
                {t}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Food */}
        <motion.div variants={fadeUp} className="space-y-3">
          <label className="text-lg font-display font-bold text-ink">Food preferences</label>
          <div className="flex flex-wrap gap-2">
            {foodOptions.map((f) => (
              <motion.button
                key={f}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFood(f)}
                className={`zine-chip ${food === f ? "selected" : ""}`}
              >
                {f}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md mx-auto px-6 py-8"
      >
        <motion.button
          onClick={handleCreate}
          className="zine-btn"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          Create my night →
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Preferences;
