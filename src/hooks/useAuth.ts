import { authLogout } from '@services/AuthService';
import { authStore, clearAuth, setAuth } from '@stores/authStore';
import { redirect } from '@tanstack/react-router';

export const useAuth = () => {
  const signIn = async () => {
    setAuth(true);
    redirect({ to: '/admin' });
  };

  const signOut = async () => {
    try {
      // Clear local state immediately for smooth UX
      clearAuth();

      // Call logout API in background (non-blocking)
      await authLogout();
    } catch (error) {
      // Even if logout API fails, user is logged out locally
      console.warn('Logout API failed:', error);
    }
  };

  const user = authStore.state.user;

  const isLogged = async () => {
    return authStore.state.isAuthenticated;
  };

  return { signIn, signOut, isLogged, user };
};

export type AuthContext = ReturnType<typeof useAuth>;
