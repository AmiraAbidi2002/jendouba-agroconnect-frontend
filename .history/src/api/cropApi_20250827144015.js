import axios from "axios";

const API_URL = "http://localhost:8080/api";

// create an instance Axios with basic configuration 
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // cookies of authentication
});

// Interceptor to add the  authentication's token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // d'ont  define Content-Type for FormData, Axios make it automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to manage the global error 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      // expired or invalid token - log out user
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// create a new crop
export const createCrop = async (formData) => {
  try {
    console.log("Sending FormData to server...");
    // Axios automatically detects  multipart/form-data
    const response = await api.post('/crops', formData);
    return response.data;
  } catch (error) {
    console.error("API Error details:", error.response?.data);
    throw new Error(error.response?.data?.message || 'Error while create crops');
  }
};

// Update an existed crop
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

// other functions
export const getAllCrops = async () => {
  try {
    const response = await api.get('/crops');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'error while getting crops');
  }
};

export const getCropById = async (id) => {
  try {
    const response = await api.get(`/crops/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'error while getting crops related to this farmer');
  }
};

// delete a crop
export const deleteCrop = async (id) => {
  try {
    const response = await api.delete(`/crops/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error deleting crops');
  }
};

// search  crops
export const searchCrops = async (searchTerm) => {
  try {
    const response = await api.get(`/crops/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error searching for crops');
  }
};

// recover a farmer's crops
export const getCropsByFarmer = async () => {
  try {
    const response = await api.get(`/crops/mine`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error recover a farmer s crops');
  }
};

// Debug FormData
export const debugFormData = (formData) => {
  console.log('content of FormData:');
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }
};
