import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor — redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response?.status === 401) {
      // Don't redirect if already on auth pages
      const authPages = ['/login', '/register', '/verify-otp'];
      if (!authPages.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
