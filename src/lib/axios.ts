import axios from 'axios';

console.log("Backend URL", process.env.NEXT_PUBLIC_BACKEND_URL);

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,  
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  // console.log(config);
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
