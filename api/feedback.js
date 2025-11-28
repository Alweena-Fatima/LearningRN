import axios from "axios";

// API_URL should be imported from your config or defined here
const API_URL = "http://192.168.29.140:4000/api"; // Verify your IP

export const submitFeedbackApi = (data) => axios.post(`${API_URL}/feedbacks`, data);
export const getFeedbacksApi = () => axios.get(`${API_URL}/feedbacks`);