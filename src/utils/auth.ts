import axiosPrivate from '@/api/axiosInstance';
import { clearAuth, setAuth } from '@stores/authStore';

export async function isAuthenticated() {
  try {
    const response = await axiosPrivate.get('api/auth/check');
    console.log('isAuthenticated', response);
    setAuth(true);
  } catch (e) {
    console.error('isAuthenticated error', e);
    clearAuth();
  }
}

export async function loginFnc() {
  localStorage.setItem('isAuthenticated', 'true');
}

export function logoutFnc() {
  clearAuth();
}

// TODO: remove this function
export const isTokenExpired = (tokenExpiration: number | null): boolean => {
  if (!tokenExpiration) return true;
  return Date.now() > tokenExpiration;
};
