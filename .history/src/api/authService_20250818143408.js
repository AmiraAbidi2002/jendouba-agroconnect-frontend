import axios from "axios";

const API_URL = "http://localhost:8080/auth";

export const loginRequest = (email, password) => {
  return axios.post(`${API_URL}/login`, { email, password })
      .then(res => res.data.token);
};


export const registerRequest = (payload) => {
  return axios.post(`${API_URL}/register`, payload);
};