// src/api/farmApi.js
import axios from "axios";

// Fonction utilitaire pour récupérer le token
const getToken = () => localStorage.getItem("token");

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

/**
 * Récupérer la ferme du farmer connecté
 */
export const getMyFarm = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:8080/api/farms/mine", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Réponse API getMyFarm:", response.data);
    if (!response.ok) throw new Error("Request failed.");
   return response.data;
  } catch (error) {
    console.error("Erreur API getMyFarm:", error.response?.data || error);
    throw new Error(
      error.response?.data?.message || "Erreur lors de la récupération de votre ferme"
    );
  }
};
