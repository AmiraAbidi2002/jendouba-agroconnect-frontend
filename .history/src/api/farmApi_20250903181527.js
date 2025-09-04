import axios from "axios";

const getToken = () => localStorage.getItem("token");

/**
 * Recover the farm from the connected farmer
 */
export const getMyFarm = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Missing Token ");
    
    const response = await axios.get(`https://jendouba-agroconnect-backend-1.onrender.com/api/farms/mine?userId=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("response API getMyFarm:", response.data);
    return response.data; //axios already returns the data 
  } catch (error) {
    console.error("Error API getMyFarm:", error.response?.data || error);
    throw new Error(
      error.response?.data?.message || "error while retrieving your farm"
    );
  }
};
/**
 * Update farm information
 */
export const updateFarm = async (farmId, farmData) => {
  try {
    const token = getToken();
    const response = await axios.put(`https://jendouba-agroconnect-backend-1.onrender.com/api/farms/${farmId}`,
       farmData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error API updateFarm:", error.response?.data || error);
    throw new Error(
      error.response?.data?.message || `HTTP ${error.response?.status} ${error.response?.statusText}`
    );
  }
};
/**
 * Collect all farms
 */
export const getAllFarms = async () => {
  try {
    const token = getToken();
    const response = await axios.get("https://jendouba-agroconnect-backend-1.onrender.com/api/farms", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("error API getAllFarms:", error.response?.data || error);
    throw new Error(
      error.response?.data?.message || "Error retrieving farms"
    );
  }
};
