import axios, { AxiosError } from 'axios';

import { clearAuth } from '@stores/authStore';
import { ApiErrorResponse, ValidationErrors } from '@/types/apiType';
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

axiosPrivate.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 422 && error.response.data?.error?.errors) {
      const errorData: ValidationErrors = error.response.data.error.errors;

      // Example: setting language manually
      const mappedErrors = mapErrorCodesToMessages(errorData, 'vi');

      error.response.data.error.errors = mappedErrors;
    }

    return Promise.reject(error);
  }
);

axiosPrivate.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    if (!error.response) {
      console.error('Network/server error');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Central handling logic
    switch (status) {
      case 401:
        // Unauthenticated — maybe redirect to login
        console.warn('Unauthorized');
        clearAuth();
        break;

      case 403:
        console.warn('Forbidden');
        break;

      case 404:
        console.warn('Not found');
        break;

      case 422:
        console.warn('Validation error', data.error);
        break;

      case 500:
        console.error('Server error:', data.error.message);
        break;

      default:
        console.error(`Unhandled error [${status}]`);
    }

    // Always return the rejected error so component can catch if needed
    return Promise.reject(error);
  }
);

export default axiosPrivate;
