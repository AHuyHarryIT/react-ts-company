import axios from 'axios';

type apiError = {
  code: string;
  message: string;
};

export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError<apiError>(error)) {
    return error.response?.data.message || 'An API error occurred';
  }
  return 'An unexpected error occurred';
};
