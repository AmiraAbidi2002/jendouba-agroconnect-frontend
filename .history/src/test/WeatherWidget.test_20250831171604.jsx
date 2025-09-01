// src/components/WeatherWidget.jsx
import React, { useEffect, useState } from "react";
import { getWeatherByCoords } from "../api/weather"; // ton module API

export default function WeatherWidget() {
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setError(null);
      try {
        // Exemple : coordonnées fictives
        const data = await getWeatherByCoords(36.5, 8.8);
        setCurrent(data.current);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div role="status" data-testid="loader" className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error) {
    return <div>Weather fetch error: {error.message}</div>;
  }

  if (!current) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded shadow-md w-64 mx-auto text-center">
      <div className="text-2xl font-bold mb-2">{Math.round(current.main.temp)}°C</div>
      <div className="capitalize mb-4 text-center">{current.weather?.[0]?.description}</div>
      <div className="flex justify-center mb-4">
        {current.weather?.[0]?.icon && (
          <img
            src={`http://openweathermap.org/img/wn/${current.weather[0].icon}.png`}
            alt={current.weather[0].description}
          />
        )}
      </div>
      <div className="flex justify-between text-sm mt-4 px-2">
        <div>Humidity: {current.main.humidity ?? "N/A"}%</div>
        <div>Pressure: {current.main.pressure ?? "N/A"} hPa</div>
      </div>
    </div>
  );
}
