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
    return <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">Impossible de charger les données météo</div>;

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

  // Fonction pour obtenir la couleur de fond en fonction de la température
  const getTempBackground = (temp) => {
    if (temp < 0) return "bg-blue-100 border-blue-200";
    if (temp < 10) return "bg-blue-50 border-blue-100";
    if (temp < 20) return "bg-green-50 border-green-100";
    if (temp < 30) return "bg-yellow-50 border-yellow-100";
    return "bg-orange-50 border-orange-100";
  };

  // Fonction pour obtenir la couleur de texte en fonction de la température
  const getTempColor = (temp) => {
    if (temp < 0) return "text-blue-700";
    if (temp < 10) return "text-blue-600";
    if (temp < 20) return "text-green-600";
    if (temp < 30) return "text-yellow-600";
    return "text-orange-600";
  };

  // Couleurs de fond différentes pour chaque jour de prévision
  const dailyColors = [
    "bg-blue-50 border-blue-200",
    "bg-purple-50 border-purple-200",
    "bg-green-50 border-green-200",
    "bg-yellow-50 border-yellow-200",
    "bg-orange-50 border-orange-200",
    "bg-pink-50 border-pink-200",
    "bg-indigo-50 border-indigo-200"
  ];

  return (
    <div className="space-y-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header avec titre */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-xl shadow-md p-4">
        <h1 className="text-2xl font-bold">Météo Agricole</h1>
        <p className="text-green-100">Données météorologiques pour votre exploitation</p>
      </div>

      {/* Météo actuelle - Carte principale */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-green-800 mb-4">Conditions Actuelles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-5xl font-bold text-green-700">{Math.round(current.main.temp)}°C</div>
            <div className="capitalize text-green-600 mt-2">{current.weather[0].description}</div>
            <div className="mt-4">{getIcon(current.weather[0].description)}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-green-700 mb-3">Indices Agricoles</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-700">Risque gel: </span>
                <span className={`font-medium ${current.main.temp < 2 ? 'text-red-600' : 'text-green-600'}`}>
                  {current.main.temp < 2 ? 'Élevé' : 'Faible'}
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

      {/* Prévisions 7 jours */}
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-amber-800 mb-4">Prévisions sur 7 Jours</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
          {daily.slice(0, 7).map((day, idx) => {
            const date = new Date(day.dt * 1000);
            const desc = day.weather[0].description;
            const temp = Math.round(day.main.temp);
            
            return (
              <div
                key={idx}
                className={`flex flex-col items-center p-3 rounded-lg shadow-sm border-2 ${dailyColors[idx]}`}
              >
                <p className="font-semibold text-gray-700 text-sm">
                  {date.toLocaleDateString("fr-FR", { weekday: "short" })}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </p>
                <div className="my-1">{getIcon(desc)}</div>
                <p className={`font-bold text-lg ${getTempColor(temp)}`}>
                  {temp}°C
                </p>
                <div className="flex items-center mt-1">
                  <WiHumidity size={14} className="text-blue-500 mr-1" />
                  <span className="text-xs text-gray-600">{day.main.humidity}%</span>
                </div>
                <span className="capitalize text-xs text-gray-600 mt-1 text-center">
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
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-blue-700 mb-2">Irrigation</h3>
            <p className="text-gray-700">
              Les conditions actuelles suggèrent un besoin d'irrigation modéré. 
              Privilégiez un arrosage tôt le matin pour réduire l'évaporation.
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
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