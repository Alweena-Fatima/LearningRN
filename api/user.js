import axios from "axios";

// Use your actual IP address
const API_URL = "http://192.168.29.140:4000/api"; 

export const getLeaderboardApi = () => axios.get(`${API_URL}/users/leaderboard`);