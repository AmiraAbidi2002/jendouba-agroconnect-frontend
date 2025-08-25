import React, { useEffect, useState } from "react";
import { getWeatherByCoords } from "../api/weatherService";
import { WiHumidity, WiStrongWind, WiDaySunny, WiCloudy, WiRain } from "react-icons/wi";

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const data = await getWeatherByCoords(36.5, 8.8);
      setWeather(data);
    };
    fetchWeather();
  }, []);

  if (!weather) return <p>Chargement météo...</p>;

  // Adaptation avec forecast
  const current = weather.current;
  const daily = weather.daily;

  return (
    <div className="space-y-8">

      {/* Météo actuelle */}
      <div className="bg-white text-gray-900 shadow-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-4">Météo aujourd’hui</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-semibold">{current.main.temp}°C</p>
            <p className="capitalize">{current.weather[0].description}</p>
          </div>
          <div>
            <WiDaySunny size={64} /> 
          </div>
        </div>
        <div className="mt-4 flex space-x-6 text-sm">
          <span className="flex items-center"><WiHumidity size={24} /> { current.main.humidity }%</span>
          <span className="flex items-center"><WiStrongWind size={24} /> { current.wind.speed } m/s</span>
        </div>
      </div>

      {/* Prévisions 7 jours */}
      <div className="bg-white text-gray-900 shadow-lg rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">Prévisions 7 jours</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {daily.slice(0, 7).map((day, idx) => {
            const date = new Date(day.dt * 1000);
            return (
              <div key={idx} className="bg-gray-50 rounded-lg p-4 shadow-sm border flex flex-col items-center">
                <p className="font-semibold">
                  {date.toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric' })}
                </p>
                <WiDaySunny size={40} className="my-2" />
                <p>{day.main.temp}°C</p>
                <span className="text-xs capitalize">{day.weather[0].description}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
