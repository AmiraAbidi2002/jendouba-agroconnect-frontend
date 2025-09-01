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
    <div className="space-y-6 px-4 md:px-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-xl shadow-md p-4">
        <h1 className="text-2xl font-bold">Météo Agricole</h1>
        <p className="text-green-100">Données météorologiques pour votre exploitation</p>
      </div>

      {/* Today Forecast - centrée et légèrement plus petite */}
      <div className="flex justify-center">
        <div className="bg-[#B8CBD0] rounded-3xl shadow-lg p-6 w-full max-w-sm text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Aujourd'hui</h2>
          <div className="text-5xl font-bold text-gray-900">
            {Math.round(current.main.temp)}°C
          </div>
          <div className="capitalize text-gray-700 mt-1 mb-4">{current.weather[0].description}</div>
          <div className="flex justify-center mb-4">{getIcon(current.weather[0].description)}</div>
          <div className="flex justify-between text-xs md:text-sm text-gray-700 mt-4">
            <div className="flex flex-col items-center">
              <WiHumidity size={18} className="text-blue-500 mb-1" />
              {current.main.humidity}%
            </div>
            <div className="flex flex-col items-center">
              <WiStrongWind size={18} className="text-gray-600 mb-1" />
              {current.wind.speed} m/s
            </div>
            <div className="flex flex-col items-center">
              <WiSunrise size={18} className="text-yellow-500 mb-1" />
              {current.main.pressure} hPa
            </div>
          </div>
        </div>
      </div>

      {/* Other daily forecasts - 6 jours sur toute la largeur */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">Prévisions des prochains jours</h2>
        <div className="flex justify-between gap-3 overflow-x-auto">
          {daily.slice(1, 7).map((day, idx) => {
            const date = new Date(day.dt * 1000);
            const desc = day.weather[0].description;
            const temp = Math.round(day.main.temp);

            // Background alterné
            const bgClass = idx % 2 === 0 ? "bg-[#1d4c43] text-white" : "bg-gray-100 text-gray-800";

            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl shadow-md flex-1 min-w-[80px] ${bgClass}`}
              >
                <p className="text-xs font-semibold">
                  {date.toLocaleDateString("fr-FR", { weekday: "short" })}
                </p>
                <p className="text-[10px] mb-1">
                  {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </p>
                <div className="my-1">{getIcon(desc)}</div>
                <p className={`font-bold text-sm ${getTempColor(temp)}`}>{temp}°C</p>
                <span className="text-[10px] text-center capitalize">{desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
