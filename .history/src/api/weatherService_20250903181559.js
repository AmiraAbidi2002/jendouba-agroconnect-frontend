import axios from "axios";
/**
 * This function calls the backend API at `http://localhost:8080/weather`
 */
export const getWeatherByCoords = async (lat, lon) => {
  try {
    const res = await axios.get(`https://jendouba-agroconnect-backend-1.onrender.com/weather?lat=${lat}&lon=${lon}`);
    return res.data;
  } catch (error) {
    console.error("error weather :", error);
    throw error;// Re-throw to allow handling in the calling component
  }
};
