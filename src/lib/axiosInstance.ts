import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const backend_url = process.env.BACKEND_URL

const createAxiosInstance = (contentType?: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: backend_url,
    headers: contentType ? { 'Content-Type': contentType } : {},
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return instance;
};

export const instance = createAxiosInstance('application/json');
export const instanceBinary = createAxiosInstance();