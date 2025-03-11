import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, registerUser, verifyOtp, requestOtp } from "../../services/api";

// **1️⃣ Register User**
export const register = createAsyncThunk(
  "auth/register",
  async ({ email, phoneNumber, password }: { email: string; phoneNumber: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      const response = await registerUser(email, phoneNumber, password);
      await dispatch(sendOtp(phoneNumber));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);




// **2️⃣ Verify OTP**
export const verifyUserOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ otp, channel, recipient }: { otp: string; channel: string; recipient: string }, { rejectWithValue }) => {
    try {
      const response = await verifyOtp(otp, channel, recipient);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "OTP verification failed");
    }
  }
);

// **3️⃣ Login User**
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await loginUser(email, password);
      localStorage.setItem("token", response.token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);
