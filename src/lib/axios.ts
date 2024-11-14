import axios from 'axios';

const api = axios.create({
  baseURL: "https://jobfairbackend.tsunyanapat.com/api/v1",
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// console.log(api);

// console.log("hello");

// axios.get(`https://jobfairbackend.tsunyanapat.com/api/v1/me`)
//   .then(response => console.log(response))
//   .catch(error => console.error(error));

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
