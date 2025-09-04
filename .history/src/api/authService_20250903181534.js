import axios from "axios";

const API_URL = "https://jendouba-agroconnect-backend-1.onrender.com"; // Base URL for backend API

/**
 * Send a login request to the backend.
 * Returns a JWT token if the login is successful.
 */
export const loginRequest = (email, password) => {
  return axios.post(`${API_URL}/auth/login`, { email, password }, {
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => {
      console.log("BACKEND DATA =>", res.data);
      return res.data.token;
    });
};

/**
 * Send a registration request to create a new user.
 */
export const registerRequest = (payload) => {
  return axios.post(`${API_URL}/auth/register`, payload);
};

/**
 * Update an existing user profile by ID.
*/
export const updateProfileRequest = async (userId, profileData) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, profileData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
