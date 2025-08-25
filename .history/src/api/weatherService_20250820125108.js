import axios from "axios";

export const getWeatherByCoords = async (lat, lon) => {
  try {
    const res = await axios.get(`http://localhost:8080/weather?lat=${lat}&lon=${lon}`);
    return res.data;
  } catch (error) {
    console.error("Erreur météo :", error);
    throw error;
  }
};
