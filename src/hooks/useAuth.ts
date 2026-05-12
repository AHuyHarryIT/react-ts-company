import { authLogout } from '@services/AuthService';
import { authStore, clearAuth, setAuth } from '@stores/authStore';
import { useStore } from '@tanstack/react-store';
import { redirect } from '@tanstack/react-router';

export const useAuth = () => {
  const authState = useStore(authStore);

  const signIn = async () => {
    setAuth(true);
    redirect({ to: '/admin' });
  };

  const signOut = async () => {
    try {
      await authLogout();
    } catch (error) {
      // Even if logout API fails, user is logged out locally
      console.warn('Logout API failed:', error);
    }
  };

  const user = authState.user;

  const isLogged = async () => {
    const { isAuthenticated, token, user } = authStore.state;

    if (!isAuthenticated || !token || !user) {
      clearAuth();
      return false;
    }

    return true;
  };

  return { signIn, signOut, isLogged, user };
};

export type AuthContext = ReturnType<typeof useAuth>;
