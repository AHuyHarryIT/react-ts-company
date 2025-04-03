import axios from 'axios';

import { clearAuth } from '@stores/authStore';

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
// axiosPrivate.interceptors.request.use(
//   (config) => {
//     // const token = Cookies.get('access_token');
//     // if (token && config.headers) {
//     //   config.headers.Authorization = `Bearer ${token}`;
//     // }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Check Token Expiry Before Sending Request
// axiosPrivate.interceptors.request.use(
//   (config) => {
//     const tokenExpiresAt = store.getState().auth.tokenExpiresAt;
//     if (tokenExpiresAt && tokenExpiresAt < Date.now()) {
//       store.dispatch(logout());
//       return Promise.reject(new Error('Token expired'));
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Handle 401 Unauthorized (Token Expired)
axiosPrivate.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration or invalid token
      const notification = error.response?.data?.message || 'Unauthorized';
      console.error(notification);
      clearAuth();
    }
    return Promise.reject(error);
  }
);

export default axiosPrivate;
