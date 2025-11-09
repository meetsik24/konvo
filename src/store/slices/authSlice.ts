import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser, getProfile } from "../../services/api";

// Auth State Interface
interface AuthState {
  user: any;
  token: string | null;
  error: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  successMessage: string | null;
}

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
      console.log('Register response:', response); // Debug log
      // Immediately dispatch login after successful registration
      const loginResponse = await dispatch(login({ username, password })).unwrap();
      return loginResponse; // Return login response to populate user data
    } catch (error: any) {
      console.error('Register error:', error.response?.data || error.message);
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
      console.log('Login response:', response); // Debug log
      localStorage.setItem("token", response.token);
      // Ensure the user data is extracted correctly based on API response structure
      const userData = response.user || response; // Fallback to response if user is not nested
      return { token: response.token, user: userData };
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

// **3️⃣ Fetch User Profile**
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const profileData = await getProfile();
      console.log('Profile fetch response:', profileData); // Debug log
      return profileData;
    } catch (error: any) {
      console.error('Profile fetch error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
    }
  }
);

// **4️⃣ Initialize Auth State from localStorage**
const initializeAuthState = (): AuthState => {
  const token = localStorage.getItem("token");
  // Optionally, attempt to restore user data from localStorage if persisted
  const persistedState = localStorage.getItem("persist:root");
  let user = null;
  if (persistedState) {
    try {
      const parsedState = JSON.parse(persistedState);
      const authState = JSON.parse(parsedState.auth || '{}');
      user = authState.user || null;
    } catch (e) {
      console.error('Error parsing persisted state:', e);
    }
  }

  return {
    user,
    token: token || null,
    error: null,
    status: 'idle',
    successMessage: null,
  };
};

// **5️⃣ Auth Slice**
const authSlice = createSlice({
  name: 'auth',
  initialState: initializeAuthState(),
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
      localStorage.removeItem("currentWorkspaceId");
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
        state.user = action.payload.user; // Use login response user data
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
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload; // Ensure user is updated with profile data
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Export the reducer actions
export const { setCredentials, setError, clearAuthState, logout, updateUserProfile, setSuccessMessage, clearSuccessMessage } = authSlice.actions;

// Export the reducer as default
export default authSlice.reducer;