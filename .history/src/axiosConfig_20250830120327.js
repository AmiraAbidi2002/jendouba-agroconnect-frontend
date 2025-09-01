/**
 * Axios HTTP Client Setup with Authorization
 * -------------------------------------------
 * This configuration automatically attaches a JWT token from localStorage
 * to all outgoing requests. It also provides a clean structure for future enhancements.
 */

import axios from "axios";

/**
 * Create an Axios instance for centralized configuration.
 * Using an instance allows setting a base URL and common headers.
 */
const api = axios.create({
  baseURL: "https://your-api.com", // Replace with your actual API base URL
  timeout: 10000, // Optional: 10s timeout for requests
});

/**
 * Request Interceptor
 * -------------------
 * Automatically adds the Authorization header to requests if a token exists.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Set Authorization header
    }
    return config; // Return the modified config for the request
  },
  (error) => {
    // Forward request errors
    return Promise.reject(error);
  }
);

/**
 * Optional: Response Interceptor
 * -------------------------------
 * Can be used to handle common errors (e.g., token expiration)
 * and improve user experience on mobile by handling failed requests gracefully.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or unauthorized; clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login"; // Adjust to your routing
    }
    return Promise.reject(error);
  }
);

export default api;


 
