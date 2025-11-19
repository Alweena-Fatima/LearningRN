import axios from "axios";

const API_URL = "http://192.168.29.140:4000";

// SIGNUP
export const signupApi = (data) => axios.post(`${API_URL}/auth/register`, data);

// LOGIN
export const loginApi = (data) => axios.post(`${API_URL}/auth/login`, data);

// Optional: Backend logout if exists
// export const logoutApi = () => axios.post(`${API_URL}/auth/logout`);
