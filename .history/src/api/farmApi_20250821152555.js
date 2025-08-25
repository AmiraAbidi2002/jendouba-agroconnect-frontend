import axios from "./axiosInstance"; // ton instance axios avec baseURL et token

// Récupérer toutes les fermes
export const getAllFarms = async () => {
  try {
    const response = await axios.get("api/farms");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération des fermes");
  }
};

// Récupérer la ferme du farmer connecté
export const getMyFarm = async () => {
  try {
    const response = await axios.get("api/farms/mine");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Erreur lors de la récupération de votre ferme");
  }
};
