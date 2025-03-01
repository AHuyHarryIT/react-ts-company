import { User } from '@/types/authType';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  tokenExpiresAt: number | null;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  tokenExpiresAt: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AuthState>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.tokenExpiresAt = action.payload.tokenExpiresAt;
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      state.tokenExpiresAt = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
