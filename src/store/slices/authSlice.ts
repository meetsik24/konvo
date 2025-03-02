import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types';
import axios from 'axios';
import { AppDispatch } from '..';

interface AuthState {
  pendingUser: { name: string; email: string; phoneNumber: string; verified: boolean } | null;
  isAuthenticated: boolean;
  user: any | null;
  otpSent: boolean;
  error: string | null;
}

const initialState: AuthState = {
  pendingUser: null,
  isAuthenticated: false,
  user: null,
  otpSent: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPendingUser: (state, action: PayloadAction<{ email: string; password: string; name: string; phoneNumber: string }>) => {
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