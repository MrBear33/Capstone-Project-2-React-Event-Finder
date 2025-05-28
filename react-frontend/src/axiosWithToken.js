import axios from 'axios';

// Base URL for the backend
const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Create a reusable axios instance
const axiosWithToken = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'  //  Always tell Flask we're sending JSON
  }
});

// Auto-attach the token on every request
axiosWithToken.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default axiosWithToken;
