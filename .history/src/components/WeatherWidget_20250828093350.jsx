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
  WiSunset,
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

  const toggleMinimize = () => {
    setMinimized(!minimized);
  };

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
    if (desc.includes("cloud")) return <WiCloudy size={48} className="text-gray-700" />;
    if (desc.includes("rain")) return <WiRain size={48} className="text-blue-600" />;
    if (desc.includes("snow")) return <WiSnow size={48} className="text-blue-300" />;
    if (desc.includes("sun") || desc.includes("clear")) return <WiDaySunny size={48} className="text-yellow-500" />;
    return <WiDaySunny size={48} className="text-gray-400" />;
  };

  const getTempColor = (temp) => {
    if (temp < 0) return "text-blue-700";
    if (temp < 10) return "text-blue-600";
    if (temp < 20) return "text-green-600";
    if (temp < 30) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <div className="space-y-8 px-4 md:px-8 py-6">
      {/* Titre */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Prévisions Météo Agricole</h1>
      </div>

      {/* Section Aujourd'hui + Conseils */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Today Forecast - Encadré à gauche */}
        <div className={`bg-[#B8CBD0] rounded-3xl shadow-lg p-6 lg:w-1/3 w-full relative border-2 border-gray-300 ${minimized ? 'min-h-[120px]' : ''}`}>
          <button 
            onClick={toggleMinimize}
            className="absolute top-4 right-4 bg-white bg-opacity-30 rounded-full w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-opacity-50 transition-all"
          >
            {minimized ? '+' : '-'}
          </button>

          <h2 className="text-lg font-semibold text-gray-800 mb-3">Aujourd'hui</h2>

          {!minimized && (
            <div className="today-details">
              <div className="text-4xl md:text-5xl font-bold text-gray-900">
                {Math.round(current.main.temp)}°C
              </div>
              <div className="capitalize text-gray-700 mt-1 mb-4">{current.weather[0].description}</div>
              <div className="flex justify-center mb-4">{getIcon(current.weather[0].description)}</div>
              <div className="flex justify-between text-sm text-gray-700 mt-4 px-2">
                <div className="flex flex-col items-center">
                  <WiHumidity size={20} className="text-blue-500 mb-1" />
                  <span className="text-xs">{current.main.humidity}%</span>
                </div>
                <div className="flex flex-col items-center">
                  <WiStrongWind size={20} className="text-gray-600 mb-1" />
                  <span className="text-xs">{current.wind.speed} m/s</span>
                </div>
                <div className="flex flex-col items-center">
                  <WiSunrise size={20} className="text-yellow-500 mb-1" />
                  <span className="text-xs">{current.main.pressure} hPa</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Conseils - À droite des prévisions du jour */}
        <div className="flex flex-col gap-4 lg:w-2/3 w-full">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-md flex-1 border border-red-200">
            <h3 className="font-semibold text-red-800 mb-3 text-lg">Prioritize Harvest:</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              If severe weather is forecast, focus all efforts on harvesting vulnerable, mature crops first to avoid losses.
            </p>
          </div>
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-md flex-1 border border-red-200">
            <h3 className="font-semibold text-red-800 mb-3 text-lg">Protect Assets:</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Secure soil (e.g., cover seedbeds) and protect high-value crops with nets or covers from hail/heavy rain. Ensure drainage is clear.
            </p>
          </div>
        </div>
      </div>

      {/* Prévisions 6 jours - Sur une ligne avec espacement */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Prévisions des prochains jours</h2>
        <div className="px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-full">
            {daily.slice(1, 7).map((day, idx) => {
              const date = new Date(day.dt * 1000);
              const desc = day.weather[0].description;
              const temp = Math.round(day.main.temp);

              const bgClass = idx % 2 === 0 ? "bg-[#1d4c43] text-white" : "bg-gray-100 text-gray-800";

              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center justify-center p-4 m-2 rounded-2xl shadow-lg border-2 border-gray-200 min-h-[180px] ${bgClass} transition-transform hover:scale-105`}
                >
                  <p className="text-sm font-semibold mb-1">
                    {date.toLocaleDateString("fr-FR", { weekday: "short" })}
                  </p>
                  <p className="text-xs mb-3">
                    {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </p>
                  <div className="my-3 flex-1 flex items-center justify-center">
                    {getIcon(desc)}
                  </div>
                  <p className={`font-bold text-lg mb-2 ${idx % 2 === 0 ? 'text-white' : getTempColor(temp)}`}>
                    {temp}°C
                  </p>
                  <span className="text-xs text-center capitalize leading-tight px-1">
                    {desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .today-details {
          transition: all 0.3s ease;
        }
        
        @media (max-width: 768px) {
          .grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (min-width: 768px) and (max-width: 1024px) {
          .grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}