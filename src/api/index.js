import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api`,
  withCredentials: true,
});

// Attach CSRF token from cookie on mutating requests
api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const match = document.cookie.match(/(^| )csrftoken=([^;]+)/);
    const csrfToken = match ? decodeURIComponent(match[2]) : null;
    if (csrfToken) config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Redirect to login on 401 (session expired)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('yd-user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
