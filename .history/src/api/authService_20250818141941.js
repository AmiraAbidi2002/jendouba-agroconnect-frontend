import axios from "axios";

const API_URL = "http://localhost:8080/auth";

export const loginRequest = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  return response.data.token;         // 
};