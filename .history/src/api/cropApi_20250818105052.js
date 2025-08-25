import axios from "axios";

const API_URL = "http://localhost:8080/api"; // URL backend

export const getAllCrops = async () => {
  const response = await axios.get(`${API_URL}/crops`);
  return response.data;
};

export const createCrop = async (cropData) => {
  const response = await axios.post(`${API_URL}/crops`, cropData);
  return response.data;
};

export const updateCrop = async (id, cropData) => {
  const response = await axios.put(`${API_URL}/crops/${id}`, cropData);
  return response.data;
};

export const deleteCrop = async (id) => {
  const response = await axios.delete(`${API_URL}/crops/${id}`);
  return response.data;
};
