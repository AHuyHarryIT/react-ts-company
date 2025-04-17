import { authLogout } from '@services/AuthService';
import { authStore, clearAuth, setAuth } from '@stores/authStore';
import { redirect } from '@tanstack/react-router';

export const useAuth = () => {
  const signIn = async () => {
    setAuth(true);
    redirect({ to: '/admin' });
  };

  const signOut = async () => {
    await authLogout();
    clearAuth();
  };

  const user = authStore.state.user;

  const isLogged = async () => {
    return authStore.state.isAuthenticated;
  };

  return { signIn, signOut, isLogged, user };
};

export type AuthContext = ReturnType<typeof useAuth>;
