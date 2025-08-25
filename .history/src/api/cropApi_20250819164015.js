import axios from "axios";

const API_URL = "http://localhost:8080/api";

// Créer une instance Axios avec configuration de base
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important pour les cookies d'authentification
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ne pas définir Content-Type pour FormData, le navigateur le fera automatiquement
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // Token expiré ou invalide - déconnecter l'utilisateur
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Récupérer toutes les cultures
export const getAllCrops = async () => {
  try {
    const response = await api.get('/crops');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des cultures');
  }
};

// Récupérer une culture par ID
export const getCropById = async (id) => {
  try {
    const response = await api.get(`/crops/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération de la culture');
  }
};

// Créer une nouvelle culture
export const createCrop = async (formData) => {
  try {
    console.log("Sending FormData to server...");
    const response = await api.post('/crops', formData, {
      // Axios définira automatiquement le bon Content-Type avec boundary pour FormData
    });
    return response.data;
  } catch (error) {
    console.error("API Error details:", error.response?.data);
    throw new Error(error.response?.data?.message || 'Erreur lors de la création de la culture');
  }
};

// Mettre à jour une culture existante
export const updateCrop = async (id, formData) => {
  try {
    const response = await api.put(`/crops/${id}`, formData, {
      // Axios définira automatiquement le bon Content-Type avec boundary pour FormData
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour de la culture');
  }
};

// Supprimer une culture
export const deleteCrop = async (id) => {
  try {
    const response = await api.delete(`/crops/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la suppression de la culture');
  }
};

// Rechercher des cultures par terme
export const searchCrops = async (searchTerm) => {
  try {
    const response = await api.get(`/crops/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la recherche des cultures');
  }
};

// Récupérer les cultures d'un agriculteur spécifique
export const getCropsByFarmer = async (farmerId) => {
  try {
    const response = await api.get(`/crops/farmer/${farmerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur lors de la récupération des cultures de l\'agriculteur');
  }
};

// Fonction utilitaire pour debugger les requêtes FormData
export const debugFormData = (formData) => {
  console.log('Contenu du FormData:');
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
};