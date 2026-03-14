import axios from 'axios';

// Create an Axios instance with your Spring Boot backend URL
const API = axios.create({
  baseURL: 'http://localhost:8080/api', // Adjust if your Spring Boot runs on a different port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add JWT token
API.interceptors.request.use(
  (config) => {
    // Retrieve token from localStorage (assuming you save it there upon login)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for handling global errors (like 401 Unauthorized)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default API;