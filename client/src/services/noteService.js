import axios from 'axios';

const API_URL = "https://real-time-note-o578i0grt-sharus-projects-18105f44.vercel.app/api/notes";

export const getNotes = async (token) => {
    return await axios.get(API_URL, { headers: { Authorization: token } });
};

export const createNote = async (note, token) => {
    return await axios.post(API_URL, note, { headers: { Authorization: token } });
};

export const updateNote = async (id, note, token) => {
    return await axios.put(`${API_URL}/${id}`, note, { headers: { Authorization: token } });
};

export const deleteNote = async (id, token) => {
    return await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: token } });
};
