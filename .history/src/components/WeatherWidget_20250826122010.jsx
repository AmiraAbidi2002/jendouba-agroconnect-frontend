import React, { useEffect, useState } from "react";
import { getWeatherByCoords } from "../api/weatherService";
import {
  WiHumidity,
  WiStrongWind,
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiSnow,
} from "react-icons/wi";

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const data = await getWeatherByCoords(36.5, 8.8);
if (!weather || !weather.current) {
  return <div className="text-center text-red-500">Cannot load weather data</div>;
}

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );

  const current = weather.current;
  const daily = weather.daily;

  // Colorful dynamic icons
  const getIcon = (desc) => {
    desc = desc.toLowerCase();
    if (desc.includes("cloud")) return <WiCloudy size={48} className="text-gray-400" />;
    if (desc.includes("rain")) return <WiRain size={48} className="text-blue-500" />;
    if (desc.includes("snow")) return <WiSnow size={48} className="text-blue-200" />;
    if (desc.includes("sun") || desc.includes("clear")) return <WiDaySunny size={48} className="text-yellow-400" />;
    return <WiDaySunny size={48} className="text-gray-400" />;
  };

  return (
    <div className="space-y-8">

      {/* Current weather */}
      <div className="bg-white rounded-xl shadow-md p-6 text-gray-900">
        <h2 className="text-2xl font-bold mb-4">today weather</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-semibold">{current.main.temp}°C</p>
            <p className="capitalize">{current.weather[0].description}</p>
          </div>
          <div>{getIcon(current.weather[0].description)}</div>
        </div>
        <div className="mt-4 flex space-x-6 text-sm">
          <span className="flex items-center">
            <WiHumidity size={20} className="mr-1 text-blue-400" /> {current.main.humidity}%
          </span>
          <span className="flex items-center">
            <WiStrongWind size={20} className="mr-1 text-gray-600" /> {current.wind.speed} m/s
          </span>
        </div>
      </div>

      {/*  7 days forecast */}
      <div className="bg-white rounded-xl shadow-md p-6 text-gray-900">
        <h3 className="text-xl font-bold mb-4"> 7 days forecast</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {daily.slice(0, 7).map((day, idx) => {
            const date = new Date(day.dt * 1000);
            const desc = day.weather[0].description;
            return (
              <div
                key={idx}
                className="flex flex-col items-center bg-gray-50 rounded-lg p-4 border shadow-sm transform transition hover:scale-105"
              >
                <p className="font-semibold">
                  {date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
                </p>
                <div className="my-2">{getIcon(desc)}</div>
                <p className="font-medium">{day.main.temp}°C</p>
                <span className="capitalize text-xs">{desc}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
