import { useNavigate } from "react-router-dom";
import cityStockholm from "@/assets/city-stockholm.jpg";
import cityParis from "@/assets/city-paris.jpg";
import cityLondon from "@/assets/city-london.jpg";
import cityTokyo from "@/assets/city-tokyo.jpg";
import cityBarcelona from "@/assets/city-barcelona.jpg";
import cityIstanbul from "@/assets/city-istanbul.jpg";
import cityNewYork from "@/assets/city-new-york.jpg";
import cityMexicoCity from "@/assets/city-mexico-city.jpg";
import cityMarrakech from "@/assets/city-marrakech.jpg";
import cityBangkok from "@/assets/city-bangkok.jpg";

const cities = [
  { id: "stockholm", name: "Stockholm", country: "Sweden", routes: 7, img: cityStockholm },
  { id: "paris", name: "Paris", country: "France", routes: 14, img: cityParis },
  { id: "london", name: "London", country: "England", routes: 10, img: cityLondon },
  { id: "tokyo", name: "Tokyo", country: "Japan", routes: 11, img: cityTokyo },
  { id: "barcelona", name: "Barcelona", country: "Spain", routes: 9, img: cityBarcelona },
  { id: "istanbul", name: "Istanbul", country: "Turkey", routes: 8, img: cityIstanbul },
  { id: "new-york", name: "New York", country: "USA", routes: 16, img: cityNewYork },
  { id: "mexico-city", name: "Mexico City", country: "Mexico", routes: 12, img: cityMexicoCity },
  { id: "marrakech", name: "Marrakech", country: "Morocco", routes: 6, img: cityMarrakech },
  { id: "bangkok", name: "Bangkok", country: "Thailand", routes: 13, img: cityBangkok },
];

const tiltClasses = ["tilt-1", "tilt-2", "tilt-3", "tilt-4", "tilt-5", "tilt-6", "tilt-7", "tilt-8"];

const CitySelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen paper-texture flex flex-col">
      <header className="w-full max-w-md mx-auto px-6 pt-10 pb-2">
        <button
          onClick={() => navigate("/")}
          className="text-ink/40 font-display text-lg mb-4 hover:text-ink/70 transition-colors"
        >
          ← back
        </button>
        <h1 className="text-5xl font-display font-bold text-ink leading-none ink-underline">
          Pick a city
        </h1>
        <p className="text-ink/40 text-xl font-display mt-3 tilt-3">
          Where are you heading? ✈
        </p>
      </header>

      <section className="w-full max-w-md mx-auto px-6 mt-8 grid grid-cols-2 gap-4 pb-16">
        {cities.map((city, i) => (
          <button
            key={city.id}
            onClick={() => navigate(`/city/${city.id}`)}
            className={`sketch-border overflow-hidden hover:scale-[1.03] transition-all animate-fade-up bg-paper ${tiltClasses[i % tiltClasses.length]}`}
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards", padding: 0 }}
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={city.img}
                alt={`Illustrated view of ${city.name}`}
                width={512}
                height={512}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-3 py-2.5">
              <h2 className="text-lg font-display font-bold text-ink leading-tight">
                {city.name}
              </h2>
              <p className="text-xs font-body text-ink/35 mt-0.5">
                {city.country} · {city.routes} routes
              </p>
            </div>
          </button>
        ))}
      </section>
    </div>
  );
};

export default CitySelect;
