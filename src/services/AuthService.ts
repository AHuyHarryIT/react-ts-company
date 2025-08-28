import axiosPrivate from '@/api/axiosInstance';
import { STORAGE_URL } from '@/configs/environment.config';
import { User } from '@/types/authType';
import { Gender } from '@schemas/genderEnum.schema';
import { clearAuth, setToken, setUser } from '@stores/authStore';

const expiresInMins = parseInt(import.meta.env.VITE_EXPIRES_TIME) || 120;

type AuthResponse = {
  id: string;
  name: string;
  gender: Gender;
  role_id: number;
  role_name: string;
  image: string;
  token: string;
  permissions: User['permissions'];
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
    id: response.id,
    name: response.name,
    gender: response.gender,
    role: {
      id: response.role_id.toString(),
      name: response.role_name
    },
    permissions: response.permissions
  };

  userData.image_url = `${STORAGE_URL}/${response.image}`;

  setUser(userData);
  setToken(response.token);

  return response;
};

export const authLogout = async () => {
  const response: AuthLogoutResponse = await axiosPrivate.post('/api/logout');
  clearAuth();
  return response;
};

export const authCheck = async () => {
  try {
    const response: AuthResponse = await axiosPrivate.post('/api/auth/check');
    const userData: User = {
      id: response.id,
      name: response.name,
      gender: response.gender,
      role: {
        id: response.role_id.toString(),
        name: response.role_name
      },
      permissions: response.permissions
    };

    if (response?.image) {
      userData.image_url = `${STORAGE_URL}/${response.image}`;
    }

    setUser(userData);

    return response;
  } catch (error) {
    clearAuth();
    throw error;
  }
};
