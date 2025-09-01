import axios from "axios";

const API_URL = "http://localhost:8080";

// On renvoie un token ou undefined
export const loginRequest = (email, password) => {
  return axios.post(`${API_URL}/auth/login`, { email, password }, {
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => {
      console.log("BACKEND DATA =>", res.data);
      
      return res.data.token;
    });
};

export const registerRequest = (payload) => {
  return axios.post(`${API_URL}/auth/register`, payload);
};
export const updateProfileRequest = async (userId, profileData) => {
  try {
    const response = await axios.put(`${API_URL}/${userId}`, profileData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};