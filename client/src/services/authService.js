import axios from 'axios';

const API_URL = "http://localhost:8080/api/auth";

export const signup = async (userData) => {
    return await axios.post(`${API_URL}/signup`, userData);
};

export const login = async (userData) => {
    return await axios.post(`${API_URL}/login`, userData);
};

export const logout = () => {
    localStorage.removeItem('token');
};
