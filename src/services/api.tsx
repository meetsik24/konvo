// services/api.tsx
import axios from "axios";

const API_BASE_URL = "http://143.110.232.76:8000/";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

//  Attach Token Automatically Before Each Request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

//  Register User
export const registerUser = async (name: string, email: string, phoneNumber: string, password: string) => {
  try {
    const response = await api.post("/auth/register", {
      name,
      email,
      phoneNumber,
      password
    });
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
    throw error;
  }
};

//  Login User & Store Token in Local Storage
export const loginUser = async (identifier: string, password: string) => {
  try {
    const formData = new FormData();
    formData.append('grant_type', 'password');
    formData.append('username', identifier);
    formData.append('password', password);
    formData.append('scope', '');
    formData.append('client_id', '');
    formData.append('client_secret', '');

    const response = await api.post("/auth/login", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const { access_token, user } = response.data; // Ensure correct field name
    if (access_token) {
      localStorage.setItem("token", access_token); // Store token for reuse
    }
    
    return { token: access_token, user };
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

//  Logout Function (Clear Token)
export const logoutUser = () => {
  localStorage.removeItem("token");
  console.log("Logged out successfully!");
};







export const getUser = async (email: string, full_name: string) => {
  const response = await api.get("/users/me", {
    params: { email, full_name },
  });
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



//WORKSPACE

export const createWorkspace = async (name: string) => {
  const response = await api.post("/workspaces/", { name });
  return response.data;
};


export const getWorkspaces = async () => {
  console.log('getWorkspaces API call initiated');
  try {
    const response = await api.get('/workspaces'); // Removed trailing slash
    console.log('getWorkspaces API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('getWorkspaces API error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
      } : 'No response data',
    });
    throw error;
  }
};

export const apiUpdateWorkspace = async (id: string, data: Partial<Workspace>) => {
  const response = await fetch(`/api/workspaces/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update workspace');
  }
  const updatedData = await response.json();
  return updatedData;
};

export const deleteWorkspace = async (id: string) => {
  console.log('deleteWorkspace API call initiated for ID:', id);
  try {
    const response = await api.delete(`/workspaces/${id}`);
    console.log('deleteWorkspace API response:', response.data);
    return response.data; // Might be empty (204 No Content), adjust if needed
  } catch (error: any) {
    console.error('deleteWorkspace API error:', error);
    throw error;
  }
};


//CAMPAIGNS
export const getCampaigns = async () => {
  console.log('getCampaigns API call initiated');
  try {
    const response = await api.get('/campaigns');
    console.log('getCampaigns API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('getCampaigns API error:', error);
    throw error;
  }
};

export const createCampaign = async (data: { name: string; description?: string; launch_date?: string; workspace_id: string }) => {
  console.log('createCampaign API call initiated with data:', data);
  try {
    const response = await api.post('/campaigns', data);
    console.log('createCampaign API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('createCampaign API error:', error);
    throw error;
  }
};

export const updateCampaign = async (campaignId: string, data: Partial<{ name: string; description?: string; launch_date?: string }>) => {
  console.log('updateCampaign API call initiated for campaign:', campaignId, 'with data:', data);
  try {
    const response = await api.patch(`/campaigns/${campaignId}`, data);
    console.log('updateCampaign API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('updateCampaign API error:', error);
    throw error;
  }
};

export const deleteCampaign = async (campaignId: string) => {
  console.log('deleteCampaign API call initiated for campaign:', campaignId);
  try {
    const response = await api.delete(`/campaigns/${campaignId}`);
    console.log('deleteCampaign API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('deleteCampaign API error:', error);
    throw error;
  }
};


//CONTACTS

export const getContacts = async (workspaceId: string) => {
  console.log('getContacts API call initiated for workspace:', workspaceId);
  try {
    const response = await api.get(`/workspaces/${workspaceId}/contacts`);
    console.log('getContacts API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('getContacts API error:', error.response ? error.response.data : error);
    throw error;
  }
};

export const createContact = async (data: { name: string; phone_number: string; email: string; workspace_id: string; group_id?: string }) => {
  console.log('createContact API call initiated with data:', data);
  try {
    const response = await api.post('/contacts/', data);
    console.log('createContact API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('createContact API error:', error.response ? error.response.data : error);
    throw error;
  }
};

export const deleteContact = async (contactId: string) => {
  console.log('deleteContact API call initiated for contact:', contactId);
  try {
    const response = await api.delete(`/contacts/${contactId}`);
    console.log('deleteContact API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('deleteContact API error:', error.response ? error.response.data : error);
    throw error;
  }
};


// Group Endpoints
export const getWorkspaceGroups = async (workspaceId: string) => {
  console.log('getWorkspaceGroups API call initiated for workspace:', workspaceId);
  try {
    const response = await api.get(`/workspaces/${workspaceId}/contact-groups`);
    console.log('getWorkspaceGroups API response:', response.data);
    return response.data; // Expecting [{ group_id, workspace_id, name, created_at }]
  } catch (error: any) {
    console.error('getWorkspaceGroups API error:', error.response ? error.response.data : error);
    throw error;
  }
};

export const getCampaignGroups = async (campaignId: string) => {
  console.log('getCampaignGroups API call initiated for campaign:', campaignId);
  try {
    const response = await api.get(`/campaigns/${campaignId}/contact-groups`);
    console.log('getCampaignGroups API response:', response.data);
    return response.data; // Expecting [{ group_id, workspace_id, name, created_at }]
  } catch (error: any) {
    console.error('getCampaignGroups API error:', error.response ? error.response.data : error);
    throw error;
  }
};

export const createGroup = async (data: { name: string; workspace_id: string }) => {
  console.log('createGroup API call initiated with data:', data);
  try {
    const response = await api.post('/contact-groups/', data);
    console.log('createGroup API response:', response.data);
    return response.data; // Expecting { group_id, workspace_id, name, created_at }
  } catch (error: any) {
    console.error('createGroup API error:', error.response ? error.response.data : error);
    throw error;
  }
};

export const addContactsToGroup = async (groupId: string, contactIds: string[]) => {
  console.log('addContactsToGroup API call initiated for group:', groupId, 'with contacts:', contactIds);
  try {
    const response = await api.post(`/contact-groups/${groupId}/add-contacts`, { contact_ids: contactIds });
    console.log('addContactsToGroup API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('addContactsToGroup API error:', error.response ? error.response.data : error);
    throw error;
  }
};

export const assignGroupToCampaign = async (groupId: string, campaignId: string) => {
  console.log('assignGroupToCampaign API call initiated for group:', groupId, 'to campaign:', campaignId);
  try {
    const response = await api.post(`/contact-groups/${groupId}/assign-to-campaign`, { campaign_id: campaignId });
    console.log('assignGroupToCampaign API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('assignGroupToCampaign API error:', error.response ? error.response.data : error);
    throw error;
  }
};

export const deleteGroup = async (groupId: string) => {
  console.log('deleteGroup API call initiated for group:', groupId);
  try {
    const response = await api.delete(`/contact-groups/${groupId}`);
    console.log('deleteGroup API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('deleteGroup API error:', error.response ? error.response.data : error);
    throw error;
  }
};

export const getGroupContacts = async (workspaceId: string, groupId: string) => {
  console.log(`getGroupContacts API call initiated for workspace: ${workspaceId}, group: ${groupId}`);
  try {
    const response = await api.get(`/workspaces/${workspaceId}/group/${groupId}/contacts`);
    console.log('getGroupContacts API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('getGroupContacts API error:', error.response ? error.response.data : error);
    throw error;
  }
};






// Request a new sender ID
export const requestSenderId = async (workspaceId: string, data: { sender_id: string }) => {
  console.log('requestSenderId API call initiated for workspace:', workspaceId, 'with data:', data);
  try {
    const response = await api.post(`/sender-ids/request`, { ...data, workspace_id: workspaceId });
    console.log('requestSenderId API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('requestSenderId API error:', error.response ? error.response.data : error);
    throw error;
  }
};

// Get user sender ID requests
export const getUserSenderRequests = async (workspaceId: string) => {
  console.log('getUserSenderRequests API call initiated for workspace:', workspaceId);
  try {
    const response = await api.get(`/sender-ids/requests?workspace_id=${workspaceId}`);
    console.log('getUserSenderRequests API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('getUserSenderRequests API error:', error.response ? error.response.data : error);
    throw error;
  }
};

// Get admin sender ID requests
export const getAdminSenderRequests = async (workspaceId: string) => {
  console.log('getAdminSenderRequests API call initiated for workspace:', workspaceId);
  try {
    const response = await api.get(`/admin/sender-ids/requests?workspace_id=${workspaceId}`);
    console.log('getAdminSenderRequests API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('getAdminSenderRequests API error:', error.response ? error.response.data : error);
    throw error;
  }
};

// Review a sender ID request
export const reviewSenderIdRequest = async (workspaceId: string, requestId: string, data: { status: 'approved' | 'rejected' }) => {
  console.log('reviewSenderIdRequest API call initiated for request:', requestId, 'with data:', data);
  try {
    const response = await api.patch(`/admin/sender-ids/${requestId}/review`, { ...data, workspace_id: workspaceId });
    console.log('reviewSenderIdRequest API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('reviewSenderIdRequest API error:', error.response ? error.response.data : error);
    throw error;
  }
};

export default api;