import React, { useEffect, useState } from "react";
import { getWeatherByCoords } from "../api/weatherService";
import {
  WiHumidity,
  WiStrongWind,
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiSnow,
  WiSunrise,
} from "react-icons/wi";

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const data = await getWeatherByCoords(36.5, 8.8);
        setWeather(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  const toggleMinimize = () => setMinimized(!minimized);

  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );

  if (!weather || !weather.current)
    return (
      <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
        Impossible de charger les données météo
      </div>
    );

  const current = weather.current;
  const daily = weather.daily;

  const getIcon = (desc) => {
    desc = desc.toLowerCase();
    if (desc.includes("cloud")) return <WiCloudy size={48} className="text-white" />;
    if (desc.includes("rain")) return <WiRain size={48} className="text-white" />;
    if (desc.includes("snow")) return <WiSnow size={48} className="text-white" />;
    if (desc.includes("sun") || desc.includes("clear")) return <WiDaySunny size={48} className="text-white" />;
    return <WiDaySunny size={48} className="text-white" />;
  };

  const getTempColor = (temp) => {
    if (temp < 0) return "text-blue-300";
    if (temp < 10) return "text-blue-200";
    if (temp < 20) return "text-green-200";
    if (temp < 30) return "text-yellow-300";
    return "text-orange-300";
  };

  return (
    <div className="space-y-6 px-4 md:px-8 py-6">

      {/* Titre */}
      <div className="text-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Prévisions Météo Agricole</h1>
      </div>

      {/* Ligne avec Conseils à GAUCHE et Today Forecast à DROITE */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        {/* Conseils Agricoles - À GAUCHE */}
        <div className="bg-[#FEF2F2] p-6 rounded-2xl shadow-lg lg:flex-1">
          <h2 className="text-xl font-bold mb-6 text-gray-800 text-center border-b-2 border-red-200 pb-3">
            Conseils Agricoles
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-red-700 mb-3 text-lg">Prioriser la Récolte:</h3>
              <p className="text-gray-700 leading-relaxed">
                Si des conditions météorologiques sévères sont prévues, concentrez tous les efforts sur la récolte des cultures vulnérables et matures en premier pour éviter les pertes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-red-700 mb-3 text-lg">Protéger les Actifs:</h3>
              <p className="text-gray-700 leading-relaxed">
                Sécurisez le sol et protégez les cultures à haute valeur avec des filets ou des couvertures. Assurez-vous que le drainage est dégagé.
              </p>
            </div>
          </div>
        </div>

        {/* Today Forecast - À DROITE */}
        <div className="lg:w-96 flex justify-center lg:block">
          <div
            className="relative bg-[#1d4c43] text-white p-6 rounded-2xl shadow-lg transition-all duration-300 w-full"
          >
            <button 
              onClick={toggleMinimize}
              className="absolute top-4 right-4 bg-white bg-opacity-30 rounded-full w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-opacity-50 transition-all"
            >
              {minimized ? '+' : '-'}
            </button>

            <h2 className="text-xl font-bold mb-4 text-center border-b border-white border-opacity-30 pb-3">Aujourd'hui</h2>

            {!minimized && (
              <div className="today-details space-y-4">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">
                    {Math.round(current.main.temp)}°C
                  </div>
                  <div className="capitalize text-lg">{current.weather[0].description}</div>
                </div>
                
                <div className="flex justify-center mb-4">{getIcon(current.weather[0].description)}</div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <WiHumidity size={24} className="mb-1" />
                    <span className="text-sm">{current.main.humidity}%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <WiStrongWind size={24} className="mb-1" />
                    <span className="text-sm">{current.wind.speed} m/s</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <WiSunrise size={24} className="mb-1" />
                    <span className="text-sm">{current.main.pressure} hPa</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prévisions 6 jours - inchangées en dessous */}
      <div className="forecast-container">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Prévisions des prochains jours
        </h2>
        <div className="flex flex-wrap justify-between w-full">
          {daily.slice(1, 7).map((day, idx) => {
            const date = new Date(day.dt * 1000);
            const desc = day.weather[0].description;
            const temp = Math.round(day.main.temp);

            const bgClass =
              idx % 2 === 0
                ? "bg-[#1d4c43] text-white"
                : "bg-gray-100 text-gray-800";

            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl shadow-md min-w-[120px] flex-1 mx-2 my-2 ${bgClass}`}
              >
                <p className="text-xs font-semibold">
                  {date.toLocaleDateString("fr-FR", { weekday: "short" })}
                </p>
                <p className="text-[10px] mb-1">
                  {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </p>
                <div className="my-1">{getIcon(desc)}</div>
                <p className={`font-bold text-sm ${getTempColor(temp)}`}>
                  {temp}°C
                </p>
                <span className="text-[10px] text-center capitalize">
                  {desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .today-details {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}