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

export const authLogin = async (
  username: string,
  password: string,
  remember?: boolean
) => {
  try {
    const data = {
      phone: username,
      password: password,
      remember: remember || false,
      expiresInMins: expiresInMins
    };

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

    if (response.image) {
      userData.image_url = `${STORAGE_URL}/${response.image}`;
    }

    // Set auth state
    setUser(userData);
    setToken(response.token);

    return response;
  } catch (error) {
    // Clear auth state khi có lỗi
    clearAuth();

    // Re-throw error để component xử lý
    throw error;
  }
};

export const authLogout = async () => {
  try {
    // Clear auth state immediately for smooth UX
    clearAuth();

    // Call logout API in background (non-blocking)
    // Use setTimeout to ensure UI updates first
    setTimeout(async () => {
      try {
        await axiosPrivate.post('/api/logout');
      } catch (error) {
        // Silent fail - user is already logged out locally
        console.warn('Logout API call failed:', error);
      }
    }, 0);

    return { message: 'Logged out successfully' };
  } catch (error) {
    // Even if logout fails, clear local state
    clearAuth();
    throw error;
  }
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
