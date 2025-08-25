import React, { useEffect, useState } from "react";
import { getWeatherByCoords } from "../api/weatherService";

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      const data = await getWeatherByCoords(36.5, 8.8); //  Jendouba
      setWeather(data);
    };
    fetchWeather();
  }, []);

  if (!weather) return <p>Loading weather...</p>;

  return (
    <div className="space-y-6">
      {/* Météo actuelle */}
      <div className="bg-[#e0f2f1] p-4 rounded shadow-md">
        <h2 className="text-xl font-bold mb-2">Météo actuelle</h2>
        <p>Température : {weather.current.temp}°C</p>
        <p>{weather.current.weather[0].description}</p>
        <p>Humidité : {weather.current.humidity}%</p>
        <p>Vent : {weather.current.wind_speed} m/s</p>
      </div>

      {/* Prévisions journalières */}
      <div className="bg-[#f0fdf4] p-4 rounded shadow-md">
        <h2 className="text-xl font-bold mb-2">Prévisions 7 jours</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {weather.daily.slice(0, 7).map((day, idx) => (
            <div key={idx} className="p-3 border rounded text-center">
              <p className="font-semibold">
                {new Date(day.dt * 1000).toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
              <p>Temp : {day.temp.day}°C</p>
              <p>{day.weather[0].description}</p>
              <p>Humidité : {day.humidity}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prévisions horaires */}
      <div className="bg-[#fef3c7] p-4 rounded shadow-md overflow-x-auto">
        <h2 className="text-xl font-bold mb-2">Prévisions 24h</h2>
        <div className="flex space-x-2">
          {weather.hourly.slice(0, 24).map((hour, idx) => (
            <div key={idx} className="p-2 border rounded text-center min-w-[60px]">
              <p className="font-semibold">{new Date(hour.dt * 1000).getHours()}h</p>
              <p>{hour.temp}°C</p>
              <p className="text-sm">{hour.weather[0].description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alertes météo */}
      {weather.alerts && weather.alerts.length > 0 && (
        <div className="bg-[#fee2e2] p-4 rounded shadow-md">
          <h2 className="text-xl font-bold mb-2 text-red-600">Alertes météo</h2>
          {weather.alerts.map((alert, idx) => (
            <div key={idx} className="mb-2">
              <p className="font-semibold">{alert.event}</p>
              <p>{alert.description}</p>
              <p>Début : {new Date(alert.start * 1000).toLocaleString("fr-FR")}</p>
              <p>Fin : {new Date(alert.end * 1000).toLocaleString("fr-FR")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
