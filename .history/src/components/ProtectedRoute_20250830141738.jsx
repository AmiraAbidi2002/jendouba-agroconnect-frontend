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
  const [weather, setWeather] = useState(null); // Stores weather data
  const [loading, setLoading] = useState(true); // Loading spinner state
  const [minimized, setMinimized] = useState(false); // Controls minimize/expand for today's forecast

  // ===== Fetch weather data when component mounts =====
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true); // Show spinner
      try {
        // Example coordinates (Tunisia). Replace with real dynamic user coordinates if needed.
        const data = await getWeatherByCoords(36.5, 8.8);
        setWeather(data); // Save fetched weather data
      } catch (err) {
        console.error("Weather fetch error:", err); // Error handling
      } finally {
        setLoading(false); // Hide spinner once request finishes
      }
    };
    fetchWeather();
  }, []);

  // ===== Toggle widget minimize/expand =====
  const toggleMinimize = () => setMinimized(!minimized);

  // ===== Show loading spinner while fetching data =====
  if (loading)
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );

  // ===== Show error UI if no weather data is available =====
  if (!weather || !weather.current)
    return (
      <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
        Failed to load weather data
      </div>
    );

  // ===== Helpers =====
  const current = weather.current; // Today's weather
  const daily = weather.daily; // Forecast for next days

  // Choose weather icon based on description
  const getIcon = (desc) => {
    desc = desc.toLowerCase();
    if (desc.includes("cloud")) return <WiCloudy size={48} className="text-white" />;
    if (desc.includes("rain")) return <WiRain size={48} className="text-white" />;
    if (desc.includes("snow")) return <WiSnow size={48} className="text-white" />;
    if (desc.includes("sun") || desc.includes("clear")) return <WiDaySunny size={48} className="text-white" />;
    return <WiDaySunny size={48} className="text-white" />; // Default icon
  };

  // Change text color based on temperature
  const getTempColor = (temp) => {
    if (temp < 0) return "text-blue-300"; // Very cold
    if (temp < 10) return "text-blue-200"; // Cold
    if (temp < 20) return "text-green-200"; // Mild
    if (temp < 30) return "text-yellow-300"; // Warm
    return "text-orange-300"; // Hot
  };

  return (
    <div className="space-y-6 px-4 md:px-8 py-6">
      {/* ===== Title ===== */}
      <div className="text-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Agricultural Weather Forecast
        </h1>
      </div>

      {/* ===== Today Forecast (can be minimized) ===== */}
      <div className="flex justify-center mb-6">
        <div
          className="relative bg-[#1d4c43] text-white p-6 rounded-2xl shadow-lg transition-all duration-300"
          style={{ width: "min(100%, 350px)" }} // Responsive width (max 350px)
        >
          {/* Minimize / Expand button */}
          <button
            onClick={toggleMinimize}
            className="absolute top-4 right-4 bg-white bg-opacity-30 rounded-full w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-opacity-50 transition-all"
          >
            {minimized ? "+" : "-"}
          </button>

          {/* Today's weather details (hidden when minimized) */}
          <h2 className="text-lg font-semibold mb-3 text-center">Today</h2>

          {!minimized && (
            <div className="today-details">
              {/* Temperature */}
              <div className="text-4xl md:text-5xl font-bold mb-2 text-center">
                {Math.round(current.main.temp)}°C
              </div>

              {/* Weather description */}
              <div className="capitalize mb-4 text-center">
                {current.weather[0].description}
              </div>

              {/* Weather icon */}
              <div className="flex justify-center mb-4">
                {getIcon(current.weather[0].description)}
              </div>

              {/* Humidity, wind speed, and pressure */}
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

      {/* ===== Forecast for Next 6 Days ===== */}
      <div className="forecast-container">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Forecast for the Next Days
        </h2>
        <div className="flex flex-wrap justify-between w-full">
          {daily.slice(1, 7).map((day, idx) => {
            const date = new Date(day.dt * 1000); // Convert timestamp to date
            const desc = day.weather[0].description;
            const temp = Math.round(day.main.temp);

            // Alternate background (dark / light) for better readability
            const bgClass =
              idx % 2 === 0
                ? "bg-[#1d4c43] text-white"
                : "bg-gray-100 text-gray-800";

            return (
              <div
                key={idx}
                className={
