import axios from "axios";

const API_BASE_URL =  "https://heading-to-paris-op.briq.tz";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Token Automatically Before Each Request
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

// Add Response Interceptor for 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Interfaces
interface User {
  email: string;
  username: string;
  full_name?: string;
  mobile_number?: string;
  avatar?: string;
}

interface Contact {
  contact_id: string;
  workspace_id: string;
  name: string;
  phone_number: string;
  email: string;
  created_at: string;
}

interface ContactsResponse {
  contacts: Contact[];
  total_count: number;
  total_pages: number;
  current_page: number;
}

interface Group {
  group_id: string;
  name: string;
  workspace_id: string;
  created_at?: string;
  count?: number;
}

interface Workspace {
  workspace_id: string;
  name: string;
  created_at: string;
}

interface Campaign {
  campaign_id: string;
  name: string;
  description?: string;
  launch_date?: string;
  workspace_id: string;
  created_at: string;
}

interface Notification {
  notification_id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface LogResponse {
  user_id: string;
  logs: {
    log_id: string;
    message_id: string;
    status: "pending" | "delivered" | "failed";
    timestamp: string;
    error_details?: string;
  }[];
}

export interface Plan {
  name: string;
  description: string;
  sms_unit_price: string;
  call_unit_price: string;
  minimum_sms_purchase: number;
  plan_id: string;
  created_at: string;
}

// Define the SubscriptionUsage type based on the GET /user-credit-balance response
export interface SubscriptionUsage {
  user_id: string;
  plan_id: string;
  sms_credits: number;
  call_minutes: number;
  last_updated: string;
}

interface SenderId {
  sender_id: string;
  user_id: string;
  is_approved: boolean;
  approved_at?: string;
  name: string;
  created_at?: string;
  request_id?: string;
  status?: "pending" | "approved" | "rejected";
  requested_at?: string;
  reviewed_at?: string;
}

interface Message {
  message_id: string;
  user_id: string;
  workspace_id: string;
  sender_id: string;
  recipients: string[];
  content: string;
  status: "pending" | "delivered" | "failed";
  created_at: string;
  error_details?: string;
}

// Utility function for consistent error handling
const handleApiError = (error: any, defaultMessage: string): never => {
  const message =
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.message ||
    defaultMessage;
  console.error(`${defaultMessage}:`, {
    message,
    status: error.response?.status,
    data: error.response?.data,
  });
  throw new Error(message);
};

// AUTHENTICATION
export const registerUser = async (
  username: string,
  fullName: string,
  email: string,
  mobileNumber: string,
  password: string
): Promise<User> => {
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

export const loginUser = async (identifier: string, password: string): Promise<{ token: string; user: User }> => {
  try {
    const formData = new FormData();
    formData.append("grant_type", "password");
    formData.append("username", identifier);
    formData.append("password", password);
    formData.append("scope", "");
    formData.append("client_id", "");
    formData.append("client_secret", "");

    const response = await api.post("/auth/login", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const { access_token, user } = response.data;
    if (access_token) {
      localStorage.setItem("token", access_token);
    }

    return { token: access_token, user };
  } catch (error: any) {
    handleApiError(error, "Login failed");
  }
};

export const logoutUser = (): void => {
  localStorage.removeItem("token");
  console.log("Logged out successfully!");
};

// LOGS
export const fetchLogs = async (): Promise<LogResponse> => {
  try {
    const response = await api.get("/messages/logs");
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch logs");
  }
};

// WORKSPACES
export const createWorkspace = async (name: string): Promise<Workspace> => {
  try {
    const response = await api.post("/workspaces", { name });
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to create workspace");
  }
};

export const getWorkspaces = async (): Promise<Workspace[]> => {
  console.log("getWorkspaces API call initiated");
  try {
    const response = await api.get("/workspaces");
    console.log("getWorkspaces API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch workspaces");
    return []; // Ensure a return value in case of an error
  }
};

export const updateWorkspace = async (id: string, data: Partial<Workspace>): Promise<Workspace> => {
  try {
    const response = await api.patch(`/workspaces/${id}`, data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update workspace");
  }
};

export const deleteWorkspace = async (id: string): Promise<void> => {
  console.log("deleteWorkspace API call initiated for ID:", id);
  try {
    await api.delete(`/workspaces/${id}`);
    console.log("Workspace deleted successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to delete workspace");
  }
};

// CAMPAIGNS
export const getCampaigns = async (): Promise<Campaign[]> => {
  console.log("getCampaigns API call initiated");
  try {
    const response = await api.get("/campaigns");
    console.log("getCampaigns API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch campaigns");
    return []; // Ensure a return value in case of an error
  }
};

export const createCampaign = async (data: {
  name: string;
  description?: string;
  launch_date?: string;
  workspace_id: string;
}): Promise<Campaign> => {
  console.log("createCampaign API call initiated with data:", data);
  try {
    const response = await api.post("/campaigns", data);
    console.log("createCampaign API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to create campaign");
  }
};

export const updateCampaign = async (
  campaignId: string,
  data: Partial<{ name: string; description?: string; launch_date?: string }>
): Promise<Campaign> => {
  console.log("updateCampaign API call initiated for campaign:", campaignId, "with data:", data);
  try {
    const response = await api.patch(`/campaigns/${campaignId}`, data);
    console.log("updateCampaign API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update campaign");
  }
};

export const deleteCampaign = async (campaignId: string): Promise<void> => {
  console.log("deleteCampaign API call initiated for campaign:", campaignId);
  try {
    await api.delete(`/campaigns/${campaignId}`);
    console.log("Campaign deleted successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to delete campaign");
  }
};

// CONTACTS
export const getContacts = async (
  workspaceId: string,
  page: number = 1,
  perPage: number = 100
): Promise<ContactsResponse> => {
  try {
    const response = await api.get(`/workspaces/${workspaceId}/contacts`, {
      params: { page, per_page: perPage },
    });
    console.log("Raw getContacts response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch contacts");
    return { contacts: [], total_count: 0, total_pages: 0, current_page: 0 }; // Fallback return value
  }
};

export const getGroupContacts = async (
  workspaceId: string,
  groupId: string,
  page: number = 1,
  perPage: number = 50
): Promise<ContactsResponse> => {
  try {
    console.log(`Fetching contacts for group ${groupId} in workspace ${workspaceId}`);
    const response = await api.get(`/workspaces/${workspaceId}/groups/${groupId}/contacts`, {
      params: { page, per_page: perPage },
    });
    console.log(`Raw getGroupContacts response for group ${groupId}:`, response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, `Failed to fetch contacts for group ${groupId}`);
  }
};

export const createContact = async (data: {
  name: string;
  phone_number: string;
  email: string;
  workspace_id: string;
  group_id?: string;
}): Promise<Contact> => {
  console.log("createContact API call initiated with data:", data);
  try {
    const response = await api.post("/contacts", data);
    console.log("createContact API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to create contact");
  }
};

export const bulkUploadContacts = async (workspaceId: string, file: File): Promise<any> => {
  console.log("bulkUploadContacts API call initiated for workspace:", workspaceId);
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspace_id", workspaceId);
    const response = await api.post("/contacts/bulk-upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("bulkUploadContacts API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to bulk upload contacts");
  }
};

export const updateContact = async (contactId: string, contact: Partial<Contact>): Promise<Contact> => {
  try {
    const response = await api.patch(`/contacts/${contactId}`, contact);
    console.log("updateContact API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update contact");
  }
};

export const deleteContact = async (contactId: string): Promise<void> => {
  if (!contactId) {
    throw new Error("Contact ID is undefined");
  }
  try {
    await api.delete(`/contacts/${contactId}`);
    console.log(`Contact ${contactId} deleted successfully`);
  } catch (error: any) {
    handleApiError(error, "Failed to delete contact");
  }
};

export const getContactMetrics = async (): Promise<any> => {
  try {
    const response = await api.get("/contacts/metrics");
    console.log("getContactMetrics API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch contact metrics");
  }
};

// GROUPS
export const getWorkspaceGroups = async (workspaceId: string): Promise<Group[]> => {
  console.log("getWorkspaceGroups API call initiated for workspace:", workspaceId);
  try {
    const response = await api.get(`/workspaces/${workspaceId}/contact-groups`);
    console.log("getWorkspaceGroups API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch workspace groups");
  }
};

export const getCampaignGroups = async (campaignId: string): Promise<Group[]> => {
  console.log("getCampaignGroups API call initiated for campaign:", campaignId);
  try {
    const response = await api.get(`/campaigns/${campaignId}/contact-groups`);
    console.log("getCampaignGroups API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch campaign groups");
  }
};

export const createGroup = async (data: { name: string; workspace_id: string }): Promise<Group> => {
  console.log("createGroup API call initiated with data:", data);
  try {
    const response = await api.post("/contact-groups", data);
    console.log("createGroup API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to create group");
  }
};

export const getContactGroups = async (workspaceId: string, contactId: string): Promise<Group[]> => {
  try {
    const response = await api.get(`/workspaces/${workspaceId}/contacts/${contactId}/groups`);
    console.log("Raw getContactGroups response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, `Failed to fetch groups for contact ${contactId}`);
  }
};

export const addContactsToGroup = async (groupId: string, contactIds: string[]): Promise<void> => {
  console.log("addContactsToGroup API call initiated for group:", groupId, "with contacts:", contactIds);
  try {
    await api.post(`/contact-groups/${groupId}/add-contacts`, { contact_ids: contactIds });
    console.log("Contacts added to group successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to add contacts to group");
  }
};

export const assignGroupToCampaign = async (groupId: string, campaignId: string): Promise<void> => {
  console.log("assignGroupToCampaign API call initiated for group:", groupId, "to campaign:", campaignId);
  try {
    await api.post(`/contact-groups/${groupId}/assign-to-campaign`, { campaign_id: campaignId });
    console.log("Group assigned to campaign successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to assign group to campaign");
  }
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  console.log("deleteGroup API call initiated for group:", groupId);
  try {
    await api.delete(`/contact-groups/${groupId}`);
    console.log("Group deleted successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to delete group");
  }
};

// SENDER IDS
export const requestSenderId = async (workspaceId: string, data: { sender_id: string }): Promise<SenderId> => {
  console.log("requestSenderId API call initiated for workspace:", workspaceId, "with data:", data);
  try {
    const response = await api.post("/sender-ids/request", { ...data, workspace_id: workspaceId });
    console.log("requestSenderId API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to request sender ID");
  }
};

export const getUserSenderRequests = async (workspaceId: string): Promise<SenderId[]> => {
  console.log("getUserSenderRequests API call initiated for workspace:", workspaceId);
  try {
    const response = await api.get(`/sender-ids/requests?workspace_id=${workspaceId}`);
    console.log("getUserSenderRequests API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch user sender requests");
  }
};

export const getAdminSenderRequests = async (workspaceId: string): Promise<SenderId[]> => {
  console.log("getAdminSenderRequests API call initiated for workspace:", workspaceId);
  try {
    const response = await api.get(`/admin/sender-ids/requests?workspace_id=${workspaceId}`);
    console.log("getAdminSenderRequests API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch admin sender requests");
  }
};

export const reviewSenderIdRequest = async (
  workspaceId: string,
  requestId: string,
  data: { status: "approved" | "rejected" }
): Promise<SenderId> => {
  console.log("reviewSenderIdRequest API call initiated for request:", requestId, "with data:", data);
  try {
    const response = await api.patch(`/admin/sender-ids/${requestId}/review`, {
      ...data,
      workspace_id: workspaceId,
    });
    console.log("reviewSenderIdRequest API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to review sender ID request");
  }
};

export const getApprovedSenderIds = async (workspaceId: string): Promise<SenderId[]> => {
  try {
    const response = await api.get(`/sender-ids/approved?workspace_id=${workspaceId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch approved sender IDs");
  }
};

// PROFILE
export const getProfile = async (): Promise<User> => {
  console.log("getProfile API call initiated");
  try {
    const response = await api.get("/users/me");
    console.log("getProfile API response:", response.data);
    return {
      email: response.data.email,
      username: response.data.username,
      full_name: response.data.full_name,
      mobile_number: response.data.mobile_number,
      avatar: response.data.avatar || undefined,
    };
  } catch (error: any) {
    handleApiError(error, "Failed to fetch user profile");
  }
};

export const updateProfile = async (data: {
  full_name: string;
  email: string;
  mobile_number: string;
}): Promise<User> => {
  console.log("updateProfile API call initiated with data:", data);
  try {
    const response = await api.patch("/users/me", data);
    console.log("updateProfile API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update user profile");
  }
};

export const changePassword = async (data: {
  current_password: string;
  new_password: string;
}): Promise<void> => {
  console.log("changePassword API call initiated with data:", data);
  try {
    await api.patch("/users/change-password", data);
    console.log("Password changed successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to change password");
  }
};

// Fetch all available plans
export const getPlans = async (): Promise<Plan[]> => {
  try {
    const response = await api.get('/plans');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, 'Failed to fetch plans');
  }
};

// Fetch a specific plan by ID
export const getPlanById = async (planId: string): Promise<Plan> => {
  try {
    const response = await api.get(`/plans/${planId}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, `Failed to fetch plan with ID ${planId}`);
  }
};

// Fetch user credit balance
export const getSubscriptionUsage = async (): Promise<SubscriptionUsage> => {
  try {
    const response = await api.get('/user-credit-balance');
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'Failed to fetch credit balance');
  }
};

// Purchase SMS credits
export const purchaseSmsCredits = async (planId: string, smsQuantity: number, mobileMoneyNumber: string): Promise<void> => {
  try {
    await api.post('/purchase-sms-credits', {
      plan_id: planId,
      sms_quantity: smsQuantity,
      mobile_money_number: mobileMoneyNumber,
    });
  } catch (error: any) {
    handleApiError(error, 'Failed to purchase SMS credits');
  }
};

// MESSAGES
export const sendInstantMessage = async (
  workspaceId: string,
  data: {
    recipients: string[];
    content: string;
    sender_id: string;
  }
): Promise<Message> => {
  try {
    const response = await api.post("/messages/send-instant", {
      workspace_id: workspaceId,
      ...data,
    });
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to send instant message");
  }
};

export const getMessageLogs = async (): Promise<Message[]> => {
  try {
    const response = await api.get("/messages/logs");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch message logs");
  }
};

export const getUserMessages = async (): Promise<Message[]> => {
  try {
    const response = await api.get("/messages/me");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch user messages");
  }
};

export const getMessagesByRecipient = async (recipient: string): Promise<Message[]> => {
  try {
    const response = await api.get(`/messages/recipient/${recipient}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch messages by recipient");
  }
};

export const getMessageDetail = async (messageId: string): Promise<Message> => {
  try {
    const response = await api.get(`/messages/${messageId}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch message detail");
  }
};

// NOTIFICATIONS
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await api.get("/notifications");
    console.log("Raw fetchNotifications response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    console.error("Error fetching notifications:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    return [];
  }
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await api.delete(`/notifications/${notificationId}`);
    console.log(`Notification ${notificationId} deleted successfully`);
  } catch (error: any) {
    handleApiError(error, `Failed to delete notification ${notificationId}`);
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    await api.put(`/notifications/${notificationId}/read`);
    console.log(`Notification ${notificationId} marked as read`);
  } catch (error: any) {
    handleApiError(error, `Failed to mark notification ${notificationId} as read`);
  }
};

export default api;