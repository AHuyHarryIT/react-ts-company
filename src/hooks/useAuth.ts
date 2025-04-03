import { authCheck, authLogout } from '@services/AuthService';
import { clearAuth, setAuth } from '@stores/authStore';
import { redirect } from '@tanstack/react-router';

export const useAuth = () => {
  const checkAuth = async () => {
    try {
      await authCheck();
      setAuth(true);
      return true;
    } catch {
      clearAuth();
      return false;
    }
  };

  const signIn = async () => {
    await checkAuth();
    setAuth(true);
    redirect({ to: '/admin' });
  };

  const signOut = async () => {
    await authLogout();
    clearAuth();
  };

  const isLogged = async () => {
    return await checkAuth();
  };

  return { signIn, signOut, isLogged };
};

export type AuthContext = ReturnType<typeof useAuth>;
