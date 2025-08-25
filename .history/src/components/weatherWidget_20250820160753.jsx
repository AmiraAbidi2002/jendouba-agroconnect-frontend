import React, { useEffect, useState } from "react";
import { getWeatherByCoords } from "../api/weatherService";
import {
  WiHumidity,
  WiStrongWind,
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiDayCloudy,
} from "react-icons/wi";

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const data = await getWeatherByCoords(36.5, 8.8);
      setWeather(data);
    };
    fetchWeather();
  }, []);

  if (!weather) return <p>Loading...</p>;

  const current = weather.current;
  const daily = weather.daily;

  // petite fonction pour choisir icône
  const getIcon = (desc) => {
    if (desc.includes("cloud")) return <WiCloudy size={48} />;
    if (desc.includes("rain")) return <WiRain size={48} />;
    if (desc.includes("few") || desc.includes("sun")) return <WiDaySunny size={48} />;
    return <WiDayCloudy size={48} />;
  };

  return (
    <div className="space-y-8">

      {/* météo actuelle */}
      <div className="bg-white rounded-xl shadow-md p-6 text-gray-900">
        <h2 className="text-2xl font-bold mb-4">Météo aujourd’hui</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-semibold">{current.main.temp}°C</p>
            <p className="capitalize">{current.weather[0].description}</p>
          </div>
          <div className="text-yellow-500">
            {getIcon(current.weather[0].description.toLowerCase())}
          </div>
        </div>
        <div className="mt-4 flex space-x-6 text-sm">
          <span className="flex items-center">
            <WiHumidity size={20} className="mr-1" /> {current.main.humidity}%
          </span>
          <span className="flex items-center">
            <WiStrongWind size={20} className="mr-1" /> {current.wind.speed} m/s
          </span>
        </div>
      </div>

      {/* prévisions */}
      <div className="bg-white rounded-xl shadow-md p-6 text-gray-900">
        <h3 className="text-xl font-bold mb-4">Prévisions 7 jours</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {daily.slice(0, 7).map((day, idx) => {
            const date = new Date(day.dt * 1000);
            const desc = day.weather[0].description.toLowerCase();
            return (
              <div
                key={idx}
                className="flex flex-col items-center bg-gray-50 rounded-lg p-4 border shadow-sm"
              >
                <p className="font-semibold">
                  {date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })}
                </p>
                <div className="my-2 text-yellow-500">
                  {getIcon(desc)}
                </div>
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
