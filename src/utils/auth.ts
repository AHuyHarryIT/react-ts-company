import { authCheck } from '@services/AuthService';
import { clearAuth, setAuth } from '@stores/authStore';

export async function isAuthenticated() {
  try {
    await authCheck();
    setAuth(true);
    return true;
  } catch {
    clearAuth();
    return false;
  }
}

export async function loginFnc() {
  localStorage.setItem('isAuthenticated', 'true');
}

export function logoutFnc() {
  clearAuth();
}
