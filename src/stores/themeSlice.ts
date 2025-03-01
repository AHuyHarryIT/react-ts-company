import { createSlice } from '@reduxjs/toolkit';

type Theme = 'light' | 'dark';

type ThemeState = {
  themeMode: Theme;
};

const initialState: ThemeState = {
  themeMode: 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
