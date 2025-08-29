import axios, { AxiosError } from 'axios';

import { ApiErrorResponse, ValidationErrors } from '@/types/apiType';
import { clearAuth } from '@stores/authStore';
import { mapErrorCodesToMessages } from '@utils/validationMapper';

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

axiosPrivate.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosPrivate.interceptors.response.use(
  (response) => {
    // Trả về response.data để đơn giản hóa việc sử dụng
    return response.data;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Xử lý validation error
    if (status === 422 && data?.error?.errors) {
      const errorData: ValidationErrors = data.error.errors;
      const mappedErrors = mapErrorCodesToMessages(errorData, 'vi');
      error.response.data.error.errors = mappedErrors;
    }

    // Central handling logic
    switch (status) {
      case 401: {
        // Unauthenticated — clear auth và redirect ngay lập tức
        clearAuth();

        // Redirect trực tiếp và ngay lập tức
        const currentPath = window.location.pathname + window.location.search;
        console.log(
          '401 Unauthorized - Redirecting to login from:',
          currentPath
        );

        // Force redirect to login page
        window.location.replace(
          `/login?redirect=${encodeURIComponent(currentPath)}`
        );
        break;
      }

      case 403:
        break;

      case 404:
        break;

      case 422:
        break;

      case 500:
        break;

      default:
        break;
    }

    // Always return the rejected error so component can catch if needed
    return Promise.reject(error);
  }
);

export default axiosPrivate;
