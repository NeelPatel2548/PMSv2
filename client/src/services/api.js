import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — redirect to login on 401
// BUT only for protected pages, not auth pages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/', '/login', '/register', '/verify-otp', '/change-password', '/contact'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Build a proxied PDF URL for Cloudinary raw files.
 * Cloudinary serves raw uploads with Content-Type: application/octet-stream
 * which causes downloads as ".file". This helper routes through our backend
 * /api/pdf-proxy which re-serves with Content-Type: application/pdf.
 *
 * Uses VITE_API_URL env var for the base — works in any environment.
 *
 * @param {string} cloudinaryUrl - The raw Cloudinary URL
 * @returns {string} The proxied URL for inline PDF display
 */
export const getPdfProxyUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return '';

  // Derive backend base from the same env var the axios instance uses.
  // VITE_API_URL is typically "http://localhost:5000/api" in dev
  // and "https://your-server.com/api" in prod.
  const base = import.meta.env.VITE_API_URL || '/api';
  return `${base}/pdf-proxy?url=${encodeURIComponent(cloudinaryUrl)}`;
};

export default api;
