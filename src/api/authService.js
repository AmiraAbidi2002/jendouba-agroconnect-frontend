import axios from "axios";

const API_URL = "http://localhost:8080/auth";

// On renvoie un token ou undefined
export const loginRequest = (email, password) => {
  return axios.post(`${API_URL}/login`, { email, password }, {
    headers: { 'Content-Type': 'application/json' }
  })
    .then(res => {
      console.log("BACKEND DATA =>", res.data);
      
      return res.data.token;
    });
};

export const registerRequest = (payload) => {
  return axios.post(`${API_URL}/register`, payload);
};
