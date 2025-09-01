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
    if (desc.includes("cloud")) return <WiCloudy size={48} className="text-gray-500" />;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-xl shadow-md p-4">
        <h1 className="text-2xl font-bold">Météo Agricole</h1>
        <p className="text-green-100">Données météorologiques pour votre exploitation</p>
      </div>

      {/* Conditions actuelles */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-green-800 mb-4">Conditions Actuelles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl shadow-sm">
            <div className="text-5xl font-bold text-green-700">{Math.round(current.main.temp)}°C</div>
            <div className="capitalize text-green-600 mt-2">{current.weather[0].description}</div>
            <div className="mt-4">{getIcon(current.weather[0].description)}</div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-green-700 mb-3">Détails</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <WiHumidity size={24} className="text-blue-500 mr-2" />
                <span className="text-gray-700">Humidité: </span>
                <span className="ml-auto font-medium">{current.main.humidity}%</span>
              </div>
              <div className="flex items-center">
                <WiStrongWind size={24} className="text-gray-600 mr-2" />
                <span className="text-gray-700">Vent: </span>
                <span className="ml-auto font-medium">{current.wind.speed} m/s</span>
              </div>
              <div className="flex items-center">
                <WiSunrise size={24} className="text-yellow-500 mr-2" />
                <span className="text-gray-700">Pression: </span>
                <span className="ml-auto font-medium">{current.main.pressure} hPa</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-green-700 mb-3">Indices Agricoles</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Risque gel: </span>
                <span className={`font-medium ${current.main.temp < 2 ? "text-red-600" : "text-green-600"}`}>
                  {current.main.temp < 2 ? "Élevé" : "Faible"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Évapotranspiration: </span>
                <span className="font-medium text-blue-600">Modérée</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Besoins irrigation: </span>
                <span className="font-medium text-blue-600">Moyens</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prévisions 7 jours alternées */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Prévisions sur 7 Jours</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
          {daily.slice(0, 7).map((day, idx) => {
            const date = new Date(day.dt * 1000);
            const desc = day.weather[0].description;
            const temp = Math.round(day.main.temp);

            const isEven = idx % 2 === 0;
            const bgClass = isEven ? "bg-[#1d4c43] text-white" : "bg-gray-50 text-gray-800";
            const borderClass = isEven ? "border-green-700" : "border-gray-200";

            return (
              <div
                key={idx}
                className={`flex flex-col items-center p-4 rounded-2xl shadow-lg border ${borderClass} ${bgClass} hover:scale-105 transition`}
              >
                <p className={`font-semibold text-sm ${isEven ? "text-green-200" : "text-gray-700"}`}>
                  {date.toLocaleDateString("fr-FR", { weekday: "short" })}
                </p>
                <p className={`text-xs mb-2 ${isEven ? "text-green-100" : "text-gray-500"}`}>
                  {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </p>
                <div className="my-1">{getIcon(desc)}</div>
                <p className={`font-bold text-lg ${getTempColor(temp)}`}>{temp}°C</p>
                <div className="flex items-center mt-1">
                  <WiHumidity size={14} className={`mr-1 ${isEven ? "text-blue-300" : "text-blue-500"}`} />
                  <span className={`text-xs ${isEven ? "text-green-100" : "text-gray-600"}`}>{day.main.humidity}%</span>
                </div>
                <span className={`capitalize text-xs mt-1 text-center ${isEven ? "text-green-100" : "text-gray-600"}`}>
                  {desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conseils agricoles */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-blue-800 mb-4">Conseils Agricoles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-blue-700 mb-2">Irrigation</h3>
            <p className="text-gray-700">
              Les conditions actuelles suggèrent un besoin d'irrigation modéré. 
              Privilégiez un arrosage tôt le matin pour réduire l'évaporation.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-blue-700 mb-2">Travaux des champs</h3>
            <p className="text-gray-700">
              Conditions favorables pour les travaux agricoles. 
              Profitez des prochains jours pour planifier vos semis et récoltes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
