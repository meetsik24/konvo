import axios from "axios";

const API_BASE_URL = "http://143.110.232.76:8000";

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (email: string, phoneNumber: string, password: string) => {
  const response = await api.post("/auth/register", {
    email,
    phone_number: phoneNumber,
    password,
  });
  return response.data;
}
export const loginUser = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const getUser = async (email: string) => {
  const response = await api.get("/auth/user", { params: { email } });
  return response.data;
};

export const createApiKey = async (email: string, name: string) => {
  const response = await api.post("/auth/create_api_key", null, { params: { email, name } });
  return response.data;
};

export const getApiKeys = async (email: string) => {
  const response = await api.get("/auth/api_keys", { params: { email } });
  return response.data;
};


export const deleteApiKey = async (email: string, apiKey: string) => {
  const response = await api.delete("/auth/delete_api_key", { params: { email, api_key: apiKey } });
  return response.data;
};

export const requestOtp = async (channel: string, recipient: string, length: number, structure: string, caseType: string) => {
  const response = await api.post("/otp/request-otp", { channel, recipient, length, structure, case: caseType });
  return response.data;
}

export const verifyOtp = async (otp: string, channel: string, recipient: string) => {
  const response = await api.post("/otp/verify-otp", { otp, channel, recipient });
  return response.data;
};

export default api;
