import axios from "axios";

const API_KEY = "def24126ddcdbcea53a18b62e956302f"; 
const BASE_URL = "https://api.openweathermap.org/data/2.5/onecall";

export const getWeatherByCoords = async (lat, lon) => {
  try {
    const res = await axios.get(BASE_URL, {
      params: {
        lat,
        lon,
        exclude: "minutely",
        units: "metric",
        lang: "en",
        appid: API_KEY
      }
    });
    return res.data;
  } catch (error) {
    console.error("Erreur météo :", error);
    return null;
  }
};
