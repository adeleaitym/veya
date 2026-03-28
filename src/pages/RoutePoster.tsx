import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const RoutePoster = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const routeName = searchParams.get("routeName") || "My Night";
  const city = searchParams.get("city") || "";

  let stops: any[] = [];
  try {
    stops = JSON.parse(searchParams.get("stops") || "[]");
  } catch {
    stops = [];
  }

  useEffect(() => {
    const generate = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "generate-route-poster",
          { body: { routeName, city, stops } }
        );
        if (fnError) throw fnError;
        if (data?.imageUrl) {
          setPosterUrl(data.imageUrl);
        } else if (data?.textContent) {
          setTextContent(data.textContent);
        } else {
          throw new Error("No poster content returned");
        }
      } catch (e: any) {
        setError(e.message || "Failed to generate poster");
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, [routeName, city]);

  const handleShare = async () => {
    if (!posterUrl) return;
    try {
      const resp = await fetch(posterUrl);
      const blob = await resp.blob();
      const file = new File([blob], "veya-night.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: routeName,
          text: `Check out my evening plan: ${routeName} ✦`,
          files: [file],
        });
      } else {
        // Fallback: download
        const a = document.createElement("a");
        a.href = posterUrl;
        a.download = "veya-night.png";
        a.click();
      }
    } catch {
      // Fallback: download
      const a = document.createElement("a");
      a.href = posterUrl!;
      a.download = "veya-night.png";
      a.click();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen paper-texture flex flex-col items-center justify-center gap-5 px-6">
        <div className="w-14 h-14 rounded-full border-[3px] border-ink/10 border-t-secondary animate-spin" />
        <p className="font-display text-2xl text-ink/70">Creating your poster...</p>
        <p className="font-body text-sm text-ink/30 text-center max-w-[260px]">
          Our artist is illustrating your evening — this takes a moment ✦
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen paper-texture flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-3xl text-ink">Oops ✦</p>
        <p className="font-body text-sm text-ink/50">{error}</p>
        <button onClick={() => navigate(-1)} className="zine-btn mt-4">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-texture flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-md mx-auto px-6 pt-10 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="text-ink/40 font-body text-sm mb-4 hover:text-ink transition-colors"
        >
          ← Back to route
        </button>
        <h1 className="text-3xl font-display font-bold text-ink leading-tight">
          Your night, illustrated ✦
        </h1>
        <p className="text-ink/40 font-body text-sm mt-1">
          Save it. Share it. Live it.
        </p>
      </header>

      {/* Poster */}
      <section className="w-full max-w-md mx-auto px-5 mt-6">
        {posterUrl ? (
          <div className="sketch-border overflow-hidden rounded-2xl shadow-xl">
            <img
              src={posterUrl}
              alt={`Illustrated poster of ${routeName}`}
              className="w-full h-auto"
            />
          </div>
        ) : textContent ? (
          <div className="sketch-border overflow-hidden rounded-2xl shadow-xl bg-paper p-6">
            <div className="text-center mb-6">
              <h2 className="font-display text-3xl font-bold text-ink">{routeName}</h2>
              {city && <p className="font-body text-sm text-ink/40 mt-1">{city}</p>}
            </div>
            <div className="space-y-4">
              {stops.map((stop: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center text-sm font-display font-bold text-secondary">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-ink">{stop.name}</p>
                    <p className="font-body text-xs text-ink/40">{stop.type}</p>
                  </div>
                </div>
              ))}
            </div>
            {textContent && (
              <p className="font-body text-xs text-ink/30 mt-6 whitespace-pre-line leading-relaxed">
                {textContent.substring(0, 500)}
              </p>
            )}
            <p className="text-center font-display text-sm text-secondary mt-6">Veya ✦</p>
          </div>
        ) : null}

        {/* Route name */}
        <div className="text-center mt-4">
          <h2 className="font-display text-2xl font-bold text-ink">{routeName}</h2>
          {city && (
            <p className="font-body text-sm text-ink/40 mt-1">{city}</p>
          )}
        </div>
      </section>

      {/* Actions */}
      <section className="w-full max-w-md mx-auto px-6 mt-8 mb-10 space-y-3">
        <button onClick={handleShare} className="zine-btn">
          Share your night ✦
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 font-body text-base text-ink/50 hover:text-ink transition-colors"
        >
          Back to route
        </button>
      </section>
    </div>
  );
};

export default RoutePoster;
