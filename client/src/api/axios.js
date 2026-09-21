import axios from 'axios';

// In production (Vercel + Render split deploy), VITE_API_URL is set to the
// Render backend URL at build time (e.g. https://staynest-api.onrender.com).
// In development, it falls back to the Vite proxy via '/api'.
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // send session cookie with every request
});

export default api;
