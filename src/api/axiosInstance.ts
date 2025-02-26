import axios from 'axios';
import { store } from '@stores/index'; // Adjust the import path as necessary
import { logout } from '@stores/authSlice';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export const axiosPublic = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosPrivate = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Attach Authorization Header
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Check Token Expiry Before Sending Request
axiosPrivate.interceptors.request.use(
  (config) => {
    const tokenExpiresAt = store.getState().auth.tokenExpiresAt;
    if (tokenExpiresAt && tokenExpiresAt < Date.now() / 1000) {
      store.dispatch(logout());
      return Promise.reject(new Error('Token expired'));
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 Unauthorized (Token Expired)
axiosPrivate.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (
      window.location.pathname != '/login' &&
      error?.response?.status === 401
    ) {
      store.dispatch(logout()); // Logout user
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosPrivate;
