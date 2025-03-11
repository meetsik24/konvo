import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "../../services/api";

// **1️⃣ Register User**
export const register = createAsyncThunk(
  "auth/register",
  async (
    { username, fullName, email, mobileNumber, password }: 
    { username: string; fullName: string; email: string; mobileNumber: string; password: string }, 
    { dispatch, rejectWithValue }
  ) => {
    try {
      const response = await registerUser(username, fullName, email, mobileNumber, password);
      // Immediately dispatch login after successful registration
      await dispatch(login({ username, password })).unwrap();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

// **2️⃣ Login User**
export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await loginUser(username, password);
      localStorage.setItem("token", response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// **3️⃣ Auth Slice**
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    error: null,
    status: 'idle', // idle | loading | succeeded | failed
    successMessage: null, // State for success message
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      state.status = 'succeeded';
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },
    clearAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.status = 'idle';
      localStorage.removeItem("token");
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.status = 'idle';
      localStorage.removeItem("token");
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload.user };
      state.status = 'succeeded';
    },
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
      state.status = 'succeeded';
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.user = action.payload; // Store user data from registration
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setCredentials, setError, clearAuthState, logout, updateUserProfile, setSuccessMessage, clearSuccessMessage } = authSlice.actions;
export default authSlice.reducer;