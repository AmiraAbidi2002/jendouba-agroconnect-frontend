import axios from "axios";

const API_URL = "http://localhost:8080/messages"; // backend 
//Fetch all messages between the logged-in user and another user.
export const getMessages = (userId, otherUserId) => {
  return axios.get(`${API_URL}/${userId}?with=${otherUserId}`);
};
// Send a new message from one user to another.
export const sendMessage = (senderId, receiverId, content) => {
  return axios.post(API_URL, { senderId, receiverId, content });
};
