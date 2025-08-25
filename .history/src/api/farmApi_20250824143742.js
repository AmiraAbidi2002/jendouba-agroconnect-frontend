import axios from "axios";

const getToken = () => localStorage.getItem("token");

/**
 * Récupérer la ferme du farmer connecté
 */
export const getMyFarm = async (getToken) => {
  try {
    const token = getToken();
    if (!token) throw new Error("Token manquant");
    
    const response = await axios.get("http://localhost:8080/api/farms/mine", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Réponse API getMyFarm:", response.data);
    return response.data; // axios renvoie déjà les données
  } catch (error) {
    console.error("Erreur API getMyFarm:", error.response?.data || error);
    throw new Error(
      error.response?.data?.message || "Erreur lors de la récupération de votre ferme"
    );
  }
};

/**
 * Récupérer toutes les fermes
 */
export const getAllFarms = async () => {
  try {
    const token = getToken();
    const response = await axios.get("http://localhost:8080/api/farms", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erreur API getAllFarms:", error.response?.data || error);
    throw new Error(
      error.response?.data?.message || "Erreur lors de la récupération des fermes"
    );
  }
};
