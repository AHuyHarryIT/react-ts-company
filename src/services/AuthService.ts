import axiosPrivate from '@/api/axiosInstance';
import { User } from '@/types/authType';
import { clearAuth, setUser } from '@stores/authStore';

const expiresInMins = parseInt(import.meta.env.VITE_EXPIRES_TIME) || 0;

type AuthResponse = {
  name: string;
  role_id: number;
  role_name: string;
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

  // await axiosPrivate.get('/sanctum/csrf-cookie');
  const response: AuthResponse = await axiosPrivate.post('/api/login', data);

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
  return response;
};

export const authLogout = async () => {
  const response: AuthLogoutResponse = await axiosPrivate.post('/api/logout');
  clearAuth();
  return response;
};

export const authCheck = async () => {
  try {
    const response: AuthResponse = await axiosPrivate.get('/api/auth/check');
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

    return response;
  } catch (error) {
    clearAuth();
    throw error;
  }
};
