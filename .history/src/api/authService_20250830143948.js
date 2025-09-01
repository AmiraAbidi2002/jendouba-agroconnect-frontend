import axios from "axios";

const API_URL = "http://localhost:8080"; // Base URL for backend API

/**
 * Send a login request to the backend.
 * Returns a JWT token if the login is successful.
 *
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Promise<string|undefined>} A promise that resolves to the JWT token, or undefined if login fails
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
 *
 * @param {Object} payload - The user registration data
 * @returns {Promise<Object>} A promise that resolves to the backend response
 */
export const registerRequest = (payload) => {
  return axios.post(`${API_URL}/auth/register`, payload);
};

/**
 * Update an existing user profile by ID.
 *
 * @param {number|string} userId - The ID of the user to update
 * @param {Object} profileData - The updated profile information
 * @returns {Promise<Object>} A promise that resolves to the updated user data
 * @throws {Error} If the backend request fails
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
