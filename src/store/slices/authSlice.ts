import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types';

interface AuthState {
  pendingUser: {
    email: string;
    password: string;
    name: string;
    verified: boolean;
  } | null;
  isAuthenticated: boolean;
  user: any | null;
}

const initialState: AuthState = {
  pendingUser: null,
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPendingUser: (state, action: PayloadAction<{ email: string; password: string; name: string }>) => {
      state.pendingUser = { ...action.payload, verified: false };
    },
    setVerified: (state) => {
      if (state.pendingUser) {
        state.pendingUser.verified = true;
      }
    },
    setCredentials: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.pendingUser = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.pendingUser = null;
    },
  },
});

export const { setPendingUser, setVerified, setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;