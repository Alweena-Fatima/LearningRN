import axios from "axios";

const API_URL = "http://192.168.29.140:4000/api"; // `/api` add kiya

// GET ALL EVENTS
export const getEventsApi = () => axios.get(`${API_URL}/events`);

// CREATE EVENT
export const createEventApi = (data) => axios.post(`${API_URL}/events`, data);

// GET SINGLE EVENT
export const getEventApi = (id) => axios.get(`${API_URL}/events/${id}`);

// UPDATE EVENT
export const updateEventApi = (id, data) => axios.put(`${API_URL}/events/${id}`, data);

// DELETE EVENT
export const deleteEventApi = (id) => axios.delete(`${API_URL}/events/${id}`);
