import React, { useEffect, useState } from "react";
import { getWeatherByCoords } from "../api/weatherService";

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getWeatherByCoords(36.5, 8.8); // Jendouba
        setWeather(data);
      } catch (error) {
        console.error("Erreur météo :", error);
      }
    };
    fetchWeather();
  }, []);

  if (!weather) return <p>Loading weather...</p>;

  const current = weather?.current;
  const hourly = weather?.hourly ?? [];
  const daily = weather?.daily ?? [];
  const alerts = weather?.alerts ?? [];

  return (
    <div className="space-y-6">

      {/* Météo actuelle */}
      <div className="bg-white p-4 rounded shadow-lg text-gary-900">
        <h2 className="text-xl font-bold mb-2">Météo actuelle</h2>
        <p>Température : {current?.main?.temp ?? "N/A"}°C</p>
        <p>{current?.weather?.[0]?.description ?? "N/A"}</p>
        <p>Humidité : {current?.main?.humidity ?? "N/A"}%</p>
        <p>Vent : {current?.wind?.speed ?? "N/A"} m/s</p>
      </div>

      {/* Prévisions journalières */}
      <div className="bg-white p-4 rounded shadow-lg text-gray-900">
        <h2 className="text-xl font-bold mb-2">Prévisions 7 jours</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-gray-800">
          {daily.map((day, idx) => (
            <div key={idx} className="p-3 border rounded text-center">
              <p className="font-semibold">
                {new Date(day.dt * 1000).toLocaleDateString("fr-FR", { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
              <p>Temp : {day?.main?.temp ?? "N/A"}°C</p>
              <p>{day?.weather?.[0]?.description ?? "N/A"}</p>
              <p>Humidité : {day?.main?.humidity ?? "N/A"}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prévisions horaires */}
      <div className="bg-white p-4 rounded shadow-lg overflow-x-auto text-gray-900">
        <h2 className="text-xl font-bold mb-2">Prévisions 24h</h2>
        <div className="flex space-x-2">
          {hourly.map((hour, idx) => (
            <div key={idx} className="p-2 border rounded text-center min-w-[60px]">
              <p className="font-semibold">{new Date(hour.dt * 1000).getHours()}h</p>
              <p>{hour?.main?.temp ?? "N/A"}°C</p>
              <p className="text-sm">{hour?.weather?.[0]?.description ?? "N/A"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alertes météo */}
      <div className="bg-white p-4 rounded shadow-lg text-gray-900">
        <h2 className="text-xl font-bold mb-2 text-red-600">Alertes météo</h2>
        {alerts.length > 0 ? (
          alerts.map((alert, idx) => (
            <div key={idx} className="mb-2">
              <p className="font-semibold">{alert.event}</p>
              <p>{alert.description}</p>
            </div>
          ))
        ) : (
          <p>Aucune alerte disponible pour cette version gratuite.</p>
        )}
      </div>
    </div>
  );
}
