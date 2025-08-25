import axios from "axios";

const API_URL = "http://localhost:8080/api";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if(token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getAllCrops = async () => (await api.get("/crops")).data;
export const createCrop = async data => (await api.post("/crops", data)).data;
export const updateCrop = async (id,data) => (await api.put(`/crops/${id}`,data)).data;
export const deleteCrop = async id => (await api.delete(`/crops/${id}`)).data;
