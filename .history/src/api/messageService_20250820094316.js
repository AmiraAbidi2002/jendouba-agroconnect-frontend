import axios from "axios";

const API_URL = "http://localhost:8080/messages"; // backend Dropwizard

export const getMessages = (userId, otherUserId) => {
  return axios.get(`${API_URL}/${userId}?with=${otherUserId}`);
};

export const sendMessage = (senderId, receiverId, content) => {
  return axios.post(API_URL, { senderId, receiverId, content });
};
