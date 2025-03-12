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


//REGISTER USER 
export const registerUser = async (username: string, fullName: string, email: string, mobileNumber: string, password: string) => {
  try {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
      full_name: fullName,
      mobile_number: mobileNumber,
    });
    console.log("Registration successful:", response.data);
    return response.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message;
    const validationErrors = error.response?.data?.errors || error.response?.data;
    console.error("Registration failed:", {
      message: errorMsg,
      validationErrors,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw { message: errorMsg, validationErrors };
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



// Logs Endpoints
interface LogResponse {
  user_id: string;
  logs: {
    log_id: string;
    message_id: string;
    status: 'pending' | 'delivered' | 'failed';
    timestamp: string;
    error_details?: string;
  }[];
}

// Fetch SMS logs
export const fetchLogs = async (): Promise<LogResponse> => {
  try {
    const response = await api.get('/messages/logs');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message;
    console.error('fetchLogs error:', message);
    throw new Error(`Failed to fetch logs: ${message}`);
  }
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

export const UpdateWorkspace = async (id: string, data: Partial<Workspace>) => {
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

// Review a sender ID request// Sender IDs
export const getApprovedSenderIds = async (workspaceId: string) => {
  try {
    const response = await api.get(`/sender-ids/approved?workspace_id=${workspaceId}`);
    return response.data; // Returns array of objects with sender_id, user_id, is_approved, etc.
  } catch (error: any) {
    console.error('getApprovedSenderIds API error:', error.response?.data || error.message);
    throw error;
  }
};



//UPDATE PROFILE:

export const getProfile = async (token: string) => {
  console.log('getProfile API call initiated');
  try {
    const response = await api.get('/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('getProfile API response:', response.data);
    const userData = {
      email: response.data.email,
      username: response.data.username,
      full_name: response.data.full_name,
      mobile_number: response.data.mobile_number,
      avatar: response.data.avatar || undefined, // Map avatar if it exists
    };
    return userData as { email: string; username: string; full_name?: string; mobile_number?: string; avatar?: string };
  } catch (error: any) {
    console.error('getProfile API error:', error.response ? error.response.data : error);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (token: string, data: { full_name: string; email: string; mobile_number: string }) => {
  console.log('updateProfile API call initiated with data:', data);
  try {
    const response = await api.patch('/users/me', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('updateProfile API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('updateProfile API error:', error.response ? error.response.data : error);
    throw error;
  }
};

// Change user password
export const changePassword = async (token: string, data: { current_password: string; new_password: string }) => {
  console.log('changePassword API call initiated with data:', data);
  try {
    const response = await api.patch('/users/change-password', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log('changePassword API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('changePassword API error:', error.response ? error.response.data : error);
    throw error;
  }
};



// PLANS AND SUBSCRIPTIONS:
export const getPlans = async (): Promise<Plan[]> => {
  try {
    const response = await api.get('/plans');
    console.log('getPlans API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('getPlans API error:', error.response?.data || error.message);
    throw error;
  }
};

export const getSubscriptionUsage = async (): Promise<SubscriptionUsage> => {
  try {
    const response = await api.get('/subscriptions/usage');
    console.log('getSubscriptionUsage API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('getSubscriptionUsage API error:', error.response?.data || error.message);
    throw error;
  }
};

export const subscribeToPlan = async (planId: string): Promise<void> => {
  try {
    const response = await api.post('/subscriptions/subscribe', { plan_id: planId });
    console.log('subscribeToPlan API response:', response.data);
  } catch (error: any) {
    console.error('subscribeToPlan API error:', error.response?.data || error.message);
    throw error;
  }
};

export const renewSubscription = async (): Promise<void> => {
  try {
    const response = await api.post('/subscriptions/renew', {});
    console.log('renewSubscription API response:', response.data);
  } catch (error: any) {
    console.error('renewSubscription API error:', error.response?.data || error.message);
    throw error;
  }
};

export const upgradeSubscription = async (planId: string): Promise<void> => {
  try {
    const response = await api.post('/subscriptions/upgrade', { plan_id: planId });
    console.log('upgradeSubscription API response:', response.data);
  } catch (error: any) {
    console.error('upgradeSubscription API error:', error.response?.data || error.message);
    throw error;
  }
};

export interface Plan {
  plan_name: string;
  description: string;
  sms_count: number;
  email_count: number;
  call_minutes: number;
  price: string;
  duration: string;
  plan_id: string;
  isContactSales?: boolean;
}

export interface SubscriptionUsage {
  user_id: string;
  plan_id: string;
  sms_count: number;
  email_count: number;
  call_minute_count: number;
  timestamp: string;
}






//SEND-SMS


export const sendInstantMessage = async (workspaceId: string, data: {
  recipients: string[];
  message: string;
  sender_id?: string;
  schedule?: string;
}) => {
  try {
    const response = await api.post('/messages/send-instant', {
      workspace_id: workspaceId,
      ...data,
    });
    return response.data;
  } catch (error: any) {
    console.error('sendInstantMessage API error:', error.response?.data || error.message);
    throw error;
  }
};

export const getMessageLogs = async () => {
  try {
    const response = await api.get('/messages/logs');
    return response.data;
  } catch (error: any) {
    console.error('getMessageLogs API error:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserMessages = async () => {
  try {
    const response = await api.get('/messages/me');
    return response.data;
  } catch (error: any) {
    console.error('getUserMessages API error:', error.response?.data || error.message);
    throw error;
  }
};

export const getMessagesByRecipient = async (recipient: string) => {
  try {
    const response = await api.get(`/messages/recipient/${recipient}`);
    return response.data;
  } catch (error: any) {
    console.error('getMessagesByRecipient API error:', error.response?.data || error.message);
    throw error;
  }
};

export const getMessageDetail = async (messageId: string) => {
  try {
    const response = await api.get(`/messages/${messageId}`);
    return response.data;
  } catch (error: any) {
    console.error('getMessageDetail API error:', error.response?.data || error.message);
    throw error;
  }
};

export default api;