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
  // ===== States =====
  const [weather, setWeather] = useState(null); // Weather data
  const [loading, setLoading] = useState(true); // Loading state
  const [minimized, setMinimized] = useState(false); // Toggle for minimizing today's forecast

  // ===== Fetch weather data on mount =====
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        // Example coordinates (Tunisia). Replace with dynamic coords if needed.
        const data = await getWeatherByCoords(36.5, 8.8);
        setWeather(data);
      } catch (err) {
        console.error("Weather fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  // ===== Toggle widget minimize state =====
  const toggleMinimize = () => setMinimized(!minimized);

  // ===== Loading UI =====
  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );

  // ===== Error / No data UI =====
  if (!weather || !weather.current)
    return (
      <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
        Failed to load weather data
      </div>
    );

  // ===== Helpers =====
  const current = weather.current;
  const daily = weather.daily;

  // Get weather icon based on description
  const getIcon = (desc) => {
    desc = desc.toLowerCase();
    if (desc.includes("cloud")) return <WiCloudy size={48} className="text-white" />;
    if (desc.includes("rain")) return <WiRain size={48} className="text-white" />;
    if (desc.includes("snow")) return <WiSnow size={48} className="text-white" />;
    if (desc.includes("sun") || desc.includes("clear")) return <WiDaySunny size={48} className="text-white" />;
    return <WiDaySunny size={48} className="text-white" />;
  };

  // Apply temperature-based color styling
  const getTempColor = (temp) => {
    if (temp < 0) return "text-blue-300";
    if (temp < 10) return "text-blue-200";
    if (temp < 20) return "text-green-200";
    if (temp < 30) return "text-yellow-300";
    return "text-orange-300";
  };

  return (
    <div className="space-y-6 px-4 md:px-8 py-6">
      {/* ===== Title ===== */}
      <div className="text-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Agricultural Weather Forecast
        </h1>
      </div>

      {/* ===== Today Forecast ===== */}
      <div className="flex justify-center mb-6">
        <div
          className="relative bg-[#1d4c43] text-white p-6 rounded-2xl shadow-lg transition-all duration-300"
          style={{ width: "min(100%, 350px)" }} // Mobile responsive width
        >
          {/* Minimize button */}
          <button
            onClick={toggleMinimize}
            className="absolute top-4 right-4 bg-white bg-opacity-30 rounded-full w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-opacity-50 transition-all"
          >
            {minimized ? "+" : "-"}
          </button>

          {/* Today details */}
          <h2 className="text-lg font-semibold mb-3 text-center">Today</h2>

          {!minimized && (
            <div className="today-details">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-center">
                {Math.round(current.main.temp)}°C
              </div>
              <div className="capitalize mb-4 text-center">{current.weather[0].description}</div>
              <div className="flex justify-center mb-4">{getIcon(current.weather[0].description)}</div>
              <div className="flex justify-between text-sm mt-4 px-2">
                <div className="flex flex-col items-center">
                  <WiHumidity size={20} className="mb-1" />
                  {current.main.humidity}%
                </div>
                <div className="flex flex-col items-center">
                  <WiStrongWind size={20} className="mb-1" />
                  {current.wind.speed} m/s
                </div>
                <div className="flex flex-col items-center">
                  <WiSunrise size={20} className="mb-1" />
                  {current.main.pressure} hPa
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Next 6 Days Forecast ===== */}
      <div className="forecast-container">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Forecast for the Next Days
        </h2>
        <div className="flex flex-wrap justify-between w-full">
          {daily.slice(1, 7).map((day, idx) => {
            const date = new Date(day.dt * 1000);
            const desc = day.weather[0].description;
            const temp = Math.round(day.main.temp);

            // Alternate background style for variety
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
                  {date.toLocaleDateString("en-US", { weekday: "short" })}
                </p>
                <p className="text-[10px] mb-1">
                  {date.toLocaleDateString("en-US", { day: "numeric", month: "short" })}
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

      {/* Smooth animation on minimize */}
      <style jsx>{`
        .today-details {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}
