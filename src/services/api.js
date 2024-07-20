import axios from 'axios';

const API_URL = 'http://localhost:5001'; // Ensure this matches your backend port

export const getSongs = () => axios.get(`${API_URL}/songs`);
export const addSong = (song) => axios.post(`${API_URL}/songs`, song);
export const updateSong = (id, song) => axios.put(`${API_URL}/songs/${id}`, song);
export const deleteSong = (id) => axios.delete(`${API_URL}/songs/${id}`);

export const getSetLists = () => axios.get(`${API_URL}/setlists`);
export const getSetListById = (id) => axios.get(`${API_URL}/setlists/${id}`);
export const addSetList = (setList) => axios.post(`${API_URL}/setlists`, setList);
export const updateSetList = (id, setList) => axios.put(`${API_URL}/setlists/${id}`, setList);
export const deleteSetList = (id) => axios.delete(`${API_URL}/setlists/${id}`);

// src/services/api.js

export const duplicateSetList = (id) => axios.post(`${API_URL}/setlists/${id}/duplicate`);
