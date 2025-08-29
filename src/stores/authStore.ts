import { User } from '@/types/authType';
import { Store } from '@tanstack/react-store';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
};

// Load state from localStorage or set default values
const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
  token: localStorage.getItem('token') || null
};

// Create the store instance
export const authStore = new Store(initialState);

// Subscribe to state changes to update localStorage
authStore.subscribe((state) => {
  localStorage.setItem('user', JSON.stringify(state.currentVal.user));

  localStorage.setItem(
    'isAuthenticated',
    state.currentVal.isAuthenticated ? 'true' : 'false'
  );
  localStorage.setItem('token', state.currentVal.token || '');
});

// Utility functions to update the store state
export const setUser = (user: User) => {
  authStore.setState((prevState) => {
    return { ...prevState, user, isAuthenticated: true };
  });
};

export const setAuth = (isAuthenticated: boolean) => {
  authStore.setState((prevState) => {
    return { ...prevState, isAuthenticated };
  });
};

export const setToken = (token: string) => {
  authStore.setState((prevState) => {
    return { ...prevState, token };
  });
};

export const clearAuth = () => {
  console.log('clearAuth() called - clearing all auth data');

  // Clear localStorage first để đảm bảo beforeLoad không thấy dữ liệu cũ
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('token');

  // Clear store state
  authStore.setState((prevState) => {
    return { ...prevState, isAuthenticated: false, user: null, token: null };
  });

  console.log('clearAuth() completed - state and localStorage cleared');
};
