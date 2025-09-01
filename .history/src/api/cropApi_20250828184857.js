import axios from "axios";

const API_URL = "http://localhost:8080/api";

// Create an Axios instance with basic configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // For authentication cookies
});

// Interceptor to add the authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't define Content-Type for FormData, Axios does it automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      // Expired or invalid token - log out user
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Create a new crop
export const createCrop = async (formData) => {
  try {
    console.log("Sending FormData to server...");
    // Axios automatically detects multipart/form-data
    const response = await api.post('/crops', formData);
    return response.data;
  } catch (error) {
    console.error("API Error details:", error.response?.data);
    throw new Error(error.response?.data?.message || 'Error while creating crop');
  }
};

// Update an existing crop
export const updateCrop = async (id, formData) => {
  try {
    console.log("Updating crop with ID:", id);
    
    // Debug: Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    const response = await api.put(`/crops/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error("Update crop error details:", error.response?.data);
    throw new Error(error.response?.data?.message || 'Error updating crop');
  }
};

// Other functions
export const getAllCrops = async () => {
  try {
    const response = await api.get('/crops');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error while getting crops');
  }
};

export const getCropById = async (id) => {
  try {
    const response = await api.get(`/crops/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error while getting crop');
  }
};

// Delete a crop
export const deleteCrop = async (id) => {
  try {
    const response = await api.delete(`/crops/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting crop');
  }
};

// Search crops
export const searchCrops = async (searchTerm) => {
  try {
    const response = await api.get(`/crops/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error searching for crops');
  }
};

// Get a farmer's crops
export const getCropsByFarmer = async () => {
  try {
    const response = await api.get(`/crops/mine`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error getting farmer crops');
  }
};

// Debug FormData
export const debugFormData = (formData) => {
  console.log('FormData contents:');
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
};
// Get crops by specific farmer ID
export const getCropsByFarmerId = async (farmerId) => {
  try {
    const response = await api.get(`/crops/farmer/${farmerId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error getting crops by farmer');
  }
};