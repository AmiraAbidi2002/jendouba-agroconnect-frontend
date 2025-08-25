import axios from "./axiosInstance"; // ton instance axios avec baseURL

export const getAllFarms = async () => {
  const response = await axios.get("/farms");
  return response.data;
};

export const getMyFarm = async (token) => {
  const response = await axios.get("/farms/mine", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
