import axios from "axios";

const API_URL = "http://192.168.29.140:4000"; // <- PORT REQUIRED

// SIGNUP
export const signupApi = (data) => {
  return axios.post(`${API_URL}/auth/register`, data);
};

// LOGIN
export const loginApi = (data) => {
  return axios.post(`${API_URL}/auth/login`, data);
};
