import axios from 'axios';

const API_URL = "https://real-time-note-o578i0grt-sharus-projects-18105f44.vercel.app/api/auth";

export const signup = async (userData) => {
    return await axios.post(`${API_URL}/signup`, userData);
};

export const login = async (userData) => {
    return await axios.post(`${API_URL}/login`, userData);
};

export const logout = () => {
    localStorage.removeItem('token');
};
