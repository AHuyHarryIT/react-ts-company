import axios from 'axios';

type apiError = {
  code: string;
  message: string;
};

export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError<apiError>(error)) {
    return error.response?.data.message || 'Đã xảy ra lỗi API';
  }
  return 'Đã xảy ra lỗi không mong muốn';
};
