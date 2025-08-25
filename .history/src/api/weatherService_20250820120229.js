import axios from "axios";


export const getWeatherByCoords = async (lat, lon) => {
  try {
    const response = await axios.get(`http://localhost:8080/weather?lat=${lat}&lon=${lon}`);
    return response.data;
  } catch (error) {
    console.error("Erreur météo :", error);
    return null;
  }
};
