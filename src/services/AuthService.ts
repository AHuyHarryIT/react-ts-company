import { message } from 'antd';

import axiosPrivate from '@/api/axiosInstance';
import { User } from '@/types/authType';
import { clearAuth, setAuth, setUser } from '@stores/authStore';
import { handleApiError } from '@utils/handleApiError';

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
    expiresInMins: expiresInMins
  };

  try {
    // await axiosPrivate.get('/sanctum/csrf-cookie');
    const response: AuthLoginResponse = await axiosPrivate.post(
      '/api/login',
      data
    );

    const userData: User = {
      name: response.name,
      role: {
        id: response.role_id.toString(),
        name: response.role_name
      }
    };

    if (response?.image && response?.role_id == 15) {
      userData.image_url = ['storage', 'admin', response.image].join('/');
    } else if (response?.image) {
      userData.image_url = ['storage', 'employee', response.image].join('/');
    }

    setUser(userData);
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const authLogout = async () => {
  try {
    const response: AuthLogoutResponse = await axiosPrivate.post('/api/logout');
    const notification = response.message || 'Logout successfully';
    message.success(notification);
    clearAuth();
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const authCheck = async () => {
  try {
    const response = await axiosPrivate.get('/api/auth/check');
    setAuth(true);
    return response;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
