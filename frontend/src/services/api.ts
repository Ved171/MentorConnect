import axios from 'axios';

// Use an environment variable for the API URL.
// In local development (vite dev), this will be undefined, and requests will default to the relative path '/api', which is handled by the vite proxy.
// In production on Vercel, we will set VITE_API_URL to our deployed backend URL.
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the JWT token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (userString) {
      const user = JSON.parse(userString);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;