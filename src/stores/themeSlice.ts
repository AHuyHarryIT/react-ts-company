import { createSlice } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

type ThemeState = {
  theme: Theme;
  isInitialized: boolean;
};

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('theme') as Theme) || 'light';
  }
  return 'light';
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
  isInitialized: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    initializeTheme: (state) => {
      state.isInitialized = true;
      localStorage.setItem('theme', state.theme);
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
      document.documentElement.setAttribute('data-theme', state.theme);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
      document.documentElement.setAttribute('data-theme', state.theme);
    },
  },
});

export const { initializeTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
