import axios from 'axios';

import { clearAuth } from '@stores/authStore';

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;

export const axiosPublic = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const axiosPrivate = axios.create({
  baseURL: BASE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

axiosPrivate.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    // Handle token expiration or invalid token
    if (error.response?.status === 401) {
      const notification = error.response?.data?.message || 'Unauthorized';
      console.error('[ERROR]', notification);
      clearAuth();
    }
    return Promise.reject(error);
  }
);

export default axiosPrivate;
