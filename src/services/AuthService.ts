import axiosPrivate from '@/api/axiosInstance';
import { STORAGE_URL } from '@/configs/environment.config';
import { User } from '@/types/authType';
import { Gender } from '@schemas/genderEnum.schema';
import { authStore, clearAuth, setToken, setUser } from '@stores/authStore';

const expiresInMins = parseInt(import.meta.env.VITE_EXPIRES_TIME) || 120;

type AuthResponse = {
  id: string;
  name: string;
  gender: Gender;
  role_id: number;
  role_name: string;
  image: string;
  token: string;
  is_birthday: boolean;
  birthday_employees: Array<{
    id: string;
    name: string;
    image?: string;
    birthday?: string;
  }>;
  cleaning_duties: Array<{
    date: string;
    type: string;
  }>;
  permissions: User['permissions'];
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

  // Store login-provided notification data in sessionStorage
  if (response.is_birthday !== undefined) {
    sessionStorage.setItem(
      'login_is_birthday',
      JSON.stringify(response.is_birthday)
    );
  }
  if (response.birthday_employees) {
    sessionStorage.setItem(
      'login_birthday_employees',
      JSON.stringify(response.birthday_employees)
    );
  }
  if (response.cleaning_duties) {
    sessionStorage.setItem(
      'login_cleaning_duties',
      JSON.stringify(response.cleaning_duties)
    );
  }

  return response;
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
    const currentUser = authStore.state.user;

    // Merge: giữ lại data cũ nếu BE không trả field đó
    const userData: User = {
      id: response.id ?? currentUser?.id ?? '',
      name: response.name ?? currentUser?.name ?? '',
      gender: response.gender ?? currentUser?.gender ?? ('male' as Gender),
      role: response.role_id
        ? { id: response.role_id.toString(), name: response.role_name }
        : (currentUser?.role ?? { id: '', name: '' }),
      permissions: response.permissions ?? currentUser?.permissions ?? []
    };

    if (response?.image) {
      userData.image_url = `${STORAGE_URL}/${response.image}`;
    } else if (currentUser?.image_url) {
      userData.image_url = currentUser.image_url;
    }

    setUser(userData);

    return response;
  } catch (error) {
    clearAuth();
    throw error;
  }
};
