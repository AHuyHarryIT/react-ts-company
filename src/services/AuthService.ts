import axiosPrivate from '@/api/axiosInstance';
import { handleApiError } from '@utils/handleApiError';
import { message } from 'antd';

const expiresInMins = parseInt(import.meta.env.VITE_EXPIRES_TIME) || 0;

type AuthLoginResponse = {
  token: string;
  name: string;
  role_id: number;
  role_name: string;
  expires_at: string;
  image: string;
};

type AuthLogoutResponse = {
  message: string;
};

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
    const response: AuthLoginResponse = await axiosPrivate.post(
      '/api/login',
      data
    );

    return response;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const authLogout = async () => {
  try {
    const response: AuthLogoutResponse =
      await axiosPrivate.post('/api/admin/logout');
    const notification = response.message || 'Logout successfully';
    message.success(notification);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
