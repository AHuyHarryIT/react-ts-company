import axiosPrivate from '@/api/axiosInstance';
import { handleApiError } from '@utils/handleApiError';
import { message } from 'antd';

const expiresInMins = parseInt(import.meta.env.VITE_EXPIRES_TIME) || 0;

export const authLogin = async (
  username: string,
  password: string,
  remember?: boolean
) => {
  const data = {
    phone: username,
    password: password,
    remember: remember || false,
    expiresInMins: expiresInMins,
  };

  try {
    await axiosPrivate.get('/sanctum/csrf-cookie');
    const response = await axiosPrivate.post('/api/login', data);

    return response;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const authLogout = async () => {
  try {
    const response = await axiosPrivate.post('/api/logout');
    const notification = response.data.message || 'Logout successfully';
    message.success(notification);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
