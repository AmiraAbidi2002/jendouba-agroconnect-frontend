const API_BASE = 'http://localhost:8080/api';

// Fonction utilitaire pour les appels API
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('authToken'); // Supposant que vous stockez le JWT ici
  
  const defaultOptions = {
    credentials: 'include', // Important pour les cookies d'authentification
    headers: {
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  // Ne pas définir Content-Type pour FormData, le navigateur le fera automatiquement
  if (options.body && options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    // Gérer les réponses sans contenu (comme les DELETE réussis)
    if (response.status === 204) {
      return null;
    }
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error at ${url}:`, error);
    throw error;
  }
}

// Récupérer toutes les cultures
export const getAllCrops = async () => {
  return fetchApi('/crops');
};

// Récupérer une culture par ID
export const getCropById = async (id) => {
  return fetchApi(`/crops/${id}`);
};

// Créer une nouvelle culture
export const createCrop = async (formData) => {
  return fetchApi('/crops', {
    method: 'POST',
    body: formData,
    // Note: Ne pas définir Content-Type pour FormData
  });
};

// Mettre à jour une culture existante
export const updateCrop = async (id, formData) => {
  return fetchApi(`/crops/${id}`, {
    method: 'PUT',
    body: formData,
    // Note: Ne pas définir Content-Type pour FormData
  });
};

// Supprimer une culture
export const deleteCrop = async (id) => {
  return fetchApi(`/crops/${id}`, {
    method: 'DELETE',
  });
};

// Rechercher des cultures par terme
export const searchCrops = async (searchTerm) => {
  return fetchApi(`/crops/search?q=${encodeURIComponent(searchTerm)}`);
};

// Récupérer les cultures d'un agriculteur spécifique
export const getCropsByFarmer = async (farmerId) => {
  return fetchApi(`/crops/farmer/${farmerId}`);
};