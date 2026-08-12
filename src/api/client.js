import axios from 'axios';

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn('[api/client] VITE_API_BASE_URL is not set — API calls will fail in production.');
}

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || ''}/api`,
  withCredentials: true, // sends the httpOnly yd_token cookie automatically
});

// Attach CSRF token on state-changing requests
api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    const match = document.cookie.match(/(^| )csrftoken=([^;]+)/);
    const csrfToken = match ? decodeURIComponent(match[2]) : null;
    if (csrfToken) config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Redirect to login on 401 (session expired or invalid)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('yd-user');
      localStorage.removeItem('yd-custom-picture');
      // yd_token is an httpOnly cookie — the server clears it on logout or expiry
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
