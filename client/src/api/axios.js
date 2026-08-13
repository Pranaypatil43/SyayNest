import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send session cookie with every request
});

export default api;
