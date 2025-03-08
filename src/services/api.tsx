// services/api.tsx
import axios from "axios";

const API_BASE_URL = "http://143.110.232.76:8000/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhOTI1OTg2NC0zYmE0LTQyNGMtYTdhZi04MDE1ZjczMzUyZDYiLCJleHAiOjE3NDEzOTQ0MTZ9.iBp5KCvn2W9MksBXIWh4KJ0S55z-J0C7DlN_IrrRwH0";
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const registerUser = async (name: string, email: string, phoneNumber: string, password: string) => {
  const response = await api.post("/auth/register", { 
    name, 
    email, 
    phoneNumber, 
    password 
  });
  return response.data;
};

export const loginUser = async (identifier: string, password: string) => {
  const formData = new FormData();
  if (identifier.includes('@')) {
    formData.append('email', identifier);
  } else {
    formData.append('phone_number', identifier);
  }
  formData.append('password', password);

  const response = await api.post("/auth/login", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Override default JSON
    },
  });

  const { token, user } = response.data; // Expecting { token, user: { email, name, phone_number } }
  localStorage.setItem("token", token);
  return { token, user };
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

export const createSenderId = async (senderid: string) => {
  const response = await api.post("/auth/create_senderid", null, { params: { senderid } });
  return response.data;
};

export const getSenderId = async () => {
  const response = await api.get("/auth/senderid");
  return response.data;
};

export const deleteSenderId = async (senderid: string) => {
  const response = await api.delete("/auth/senderid", { params: { senderid } });
  return response.data;
};

export const deleteApiKey = async (email: string, apiKey: string) => {
  const response = await api.delete("/auth/delete_api_key", { params: { email, api_key: apiKey } });
  return response.data;
};

export const requestOtp = async (channel: string, recipient: string, length: number, structure: string, caseType: string) => {
  const response = await api.post("/otp/request-otp", { channel, recipient, length, structure, case: caseType });
  return response.data;
};

export const verifyOtp = async (otp: string, channel: string, recipient: string) => {
  const response = await api.post("/otp/verify-otp", { otp, channel, recipient });
  return response.data;
};

export const resendOTP = async (recipient: string, channel: string) => {
  const response = await api.post("/otp/request-otp", { channel, recipient });
  return response.data;
};

export const totalMessage = async (length: number) => {
  const response = await api.get("/analytics/total_messages", { params: { length } });
  return response.data;
};

export const updateUserProfile = async (username: string, mobile: string) => {
  const response = await api.put("/auth/update-profile", { username, mobile });
  return response.data;
};

// Dashboard Endpoints
export const fetchTotalMessages = async (length: number = 6) => {
  const response = await api.get("/analytics/total_messages", { params: { length } });
  return response.data; // Expecting a number
};

export const fetchNumberOfCampaigns = async () => {
  const response = await api.get("/analytics/campaigns");
  return response.data; // Expecting a number
};

export const fetchTotalFails = async () => {
  const response = await api.get("/analytics/fails");
  return response.data; // Expecting a number
};

export const fetchTotalContacts = async () => {
  const response = await api.get("/analytics/contacts");
  return response.data; // Expecting a number
};

export const fetchMessageVolume = async (length: number = 6) => {
  const response = await api.get("/analytics/message_volume", { params: { length } });
  return response.data; // Expecting { name: string, value: number }[]
};

export const fetchDashboardData = async (): Promise<{ stats: any[]; data: any[] }> => {
  const [totalMessages, campaigns, fails, contacts, messageVolume] = await Promise.all([
    fetchTotalMessages().catch(() => null),
    fetchNumberOfCampaigns().catch(() => null),
    fetchTotalFails().catch(() => null),
    fetchTotalContacts().catch(() => null),
    fetchMessageVolume().catch(() => null),
  ]);

  const stats = [
    { title: 'Total Messages', value: totalMessages?.toString() || '0', icon: 'MessageSquare', color: 'bg-blue-500' },
    { title: 'Number of Campaigns', value: campaigns?.toString() || '0', icon: 'Megaphone', color: 'bg-yellow-500' },
    { title: 'Total Fails', value: fails?.toString() || '0', icon: 'XCircle', color: 'bg-red-500' },
    { title: 'Total Contacts', value: contacts?.toString() || '0', icon: 'Users', color: 'bg-teal-500' },
  ];

  const data = messageVolume || [];

  if (!totalMessages && !campaigns && !fails && !contacts && !messageVolume) {
    throw new Error('All dashboard data fetches failed.');
  }

  return { stats, data };
};

// Logs Endpoints
export const fetchSMSLogs = async () => {
  const response = await api.get("/logs/sms");
  return response.data; // Expecting LogEntry[]
};



export const fetchEmailLogs = async () => {
  const response = await api.get("/logs/email");
  return response.data; // Expecting LogEntry[]
};

export const getWorkspaces = async () => {
  const response = await api.get("/workspaces/");
  return response.data;
};

export const createWorkspace = async (name: string) => {
  const response = await api.post("/workspaces/", { name });
  return response.data;
};

export const getWorkspace = async (workspaceId: string) => {
  const response = await api.get(`/workspaces/${workspaceId}`);
  return response.data;
};

export const updateWorkspace = async (workspaceId: string, data: Partial<Workspace>) => {
  const response = await api.patch(`/workspaces/${workspaceId}`, data);
  return response.data;
};

export const deleteWorkspace = async (workspaceId: string) => {
  const response = await api.delete(`/workspaces/${workspaceId}`);
  return response.data;
};


export default api;