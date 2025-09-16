import axios from 'axios';

const API_BASE_URL = import.meta.env.MODE === 'development'
  ? import.meta.env.VITE_DEVELOPMENT_API_URL
  : import.meta.env.VITE_PRODUCTION_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  maxRedirects: 5,
});

// Enforce HTTPS for all requests in production
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.MODE === 'production') {
      if (config.url && config.url.startsWith("http://")) {
        config.url = config.url.replace("http://", "https://");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


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

//interface for Logs
interface LogResponse {
  analytics: Analytics;
  messages: Message[];
}

interface Status {
  status: string;
  counts: number;
}


export interface Analytics {
  total: number;
  statuses: Array<{
    status: string;
    counts: number;
  }>;
}

export interface SmsStatus {
  count: number;
  status: string;
}

export interface Group {
  group_id: string;
  group_name: string;
  count: number;
}

export interface ContactsCount {
  total_contacts: number;
  total_groups: number;
  groups: Group[];
}

export interface DailyCount {
  pending: number;
  sent: number;
  failed: number;
}

export interface LogsCount {
  total_sms: number;
  status_counts: Record<string, number>;
  daily_counts: Record<string, DailyCount>;
}

export interface MetricsResponse {
  sms_status: SmsStatus[];
  contacts_count: ContactsCount;
  logs_count: LogsCount;
}

export interface Message {
  message: string;
  sent_at: string;
  recipient: string;
  campaign_name: string | null;
  sender_id: string;
  status: string;
}

export interface MessageLogResponse {
  analytics: Analytics;
  messages: Message[];
}



interface Contact {
  contact_id: string;
  workspace_id: string;
  name: string;
  phone_number: string;
  email: string;
  created_at: string;
}

interface BulkUploadResponse {
  contacts: Contact[];
  total_count?: number;
  success: boolean;
  message?: string;
}


interface ContactsResponse {
  contacts: Contact[];
  total_count: number;
  total_pages: number;
  current_page: number;
}

interface Group {
  group_id: string;
  workspace_id: string;
  name: string;
  created_at: string;
  contact_count: number;
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

interface Plan {
  name: string;
  description: string;
  sms_unit_price: string;
  call_unit_price: string;
  minimum_sms_purchase: number;
  plan_id: string;
  created_at: string;
}

interface User {
  email: string;
  username: string;
  userId?: string;
  full_name?: string;
  mobile_number?: string;
  avatar?: string;
  plan_id?: string;
}

interface SubscriptionUsage {
  user_id: string;
  plan_id: string;
  sms_credits: number;
  call_minutes: number;
  last_updated: string;
}

interface PurchaseSmsCreditsRequest {
  plan_id: string;
  sms_quantity: number;
  mobile_money_number: string;
}

interface PurchaseSmsCreditsResponse {
  status: boolean;
  message: string;
  total_paid: number;
  payment_reference: string;
  requested_sms: number;
}

interface PaymentStatusRequest {
  payment_reference: string;
}

interface PaymentStatusResponse {
  success: boolean;
  message: string;
  payment_reference: string;
  status: string;
  credits_added: number;
  total_paid: number;
  updated_sms_balance: number;
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
  purpose?: string; 
  use_cases?: string[]; // Array of use cases for the sender ID
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

interface ApiKey {
  api_key_id: string;
  name: string;
  api_key: string;
  status: "active" | "inactive";
  created_at: string;
  expires_at: string;
}

interface AccountBalance {
  unit_cost: number;
}


// Utility function for consistent error handling
const handleApiError = (error: unknown, defaultMessage: string): never => {
  let message = defaultMessage;
  
  // Log the full error for debugging
  console.error(`${defaultMessage}:`, error);
  
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: unknown; status?: number } };
    const data = axiosError.response?.data;
    
    console.error('Response data:', data);
    console.error('Response status:', axiosError.response?.status);
    
    if (data && typeof data === 'object') {
      // Handle different error formats
      if ('detail' in data) {
        const detail = (data as { detail: unknown }).detail;
        if (Array.isArray(detail)) {
          message = detail.map((err: unknown) => {
            if (typeof err === 'object' && err && 'msg' in err) {
              return (err as { msg: string }).msg;
            }
            return String(err);
          }).join(', ');
        } else {
          message = String(detail);
        }
      } else if ('message' in data) {
        const dataMessage = (data as { message: unknown }).message;
        if (Array.isArray(dataMessage)) {
          message = dataMessage.map(String).join(', ');
        } else {
          message = String(dataMessage);
        }
      } else if ('errors' in data) {
        // Laravel style errors
        const errors = (data as { errors: unknown }).errors;
        if (errors && typeof errors === 'object') {
          message = Object.values(errors).flat().map(String).join(', ');
        }
      }
    } else if (Array.isArray(data)) {
      // Array of error messages
      message = data.map((err: unknown) => {
        if (typeof err === 'object' && err && 'msg' in err) {
          return (err as { msg: string }).msg;
        } else if (typeof err === 'object' && err && 'message' in err) {
          return (err as { message: string }).message;
        }
        return String(err);
      }).join(', ');
    } else if (typeof data === 'string') {
      message = data;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }
  
  throw new Error(message);
};

// Interfaces for Calls
interface CallRequest {
  receiver_number: string;
  tts_message?: string; // Optional since audio_url is an alternative
  audio_url?: string;  // Optional since tts_message is an alternative
}

interface CallLog {
  call_log_id: string;
  user_id: string;
  caller_number: string;
  receiver_number: string;
  status: 'initiated' | 'completed' | 'failed'; // Expanded status options
  duration_seconds: number;
  started_at: string; // ISO 8601 format
  ended_at?: string;  // Optional, as it may not be set for ongoing calls
  error_details?: string;
  infobip_call_id?: string;
}

interface CallLogsResponse {
  user_id: string;
  logs: CallLog[];
}

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


const isValidISODate = (dateStr: string): boolean => {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(dateStr);
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

export const requestOtp = async (phoneNumber: string, otpLength: number = 6): Promise<void> => {
  try {
    await api.post("/otp/request", {
      phone_number: phoneNumber,
      otp_length: otpLength,
    });
    console.log("OTP requested successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to request OTP");
  }
};

export const resetPasswordWithOtp = async (phoneNumber: string, otpCode: string, newPassword: string): Promise<void> => {
  try {
    await api.post("/auth/reset-password-otp", {
      phone_number: phoneNumber,
      otp_code: otpCode,
      new_password: newPassword,
    });
    console.log("Password reset successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to reset password with OTP");
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

//logs and sms status

export const getMessageLogsV = async (): Promise<MessageLogResponse> => {
  console.log("getMessageLogsV1 API call initiated");
  try {
    const response = await api.get("/messages/logs/V1");
    console.log("getMessageLogsV1 API response:", JSON.stringify(response.data, null, 2));

    // Validate response structure
    if (!response.data || typeof response.data !== 'object') {
      console.warn("Invalid response structure from /messages/logs/V1, returning default");
      return { analytics: { total: 0, statuses: [] }, messages: [] };
    }

    const data = response.data as MessageLogResponse;

    // Validate analytics
    if (!data.analytics || typeof data.analytics.total !== 'number' || !Array.isArray(data.analytics.statuses)) {
      console.warn("Invalid analytics structure, setting default");
      data.analytics = { total: 0, statuses: [] };
    }

    // Validate messages
    if (!Array.isArray(data.messages)) {
      console.warn("Invalid messages array, setting empty array");
      data.messages = [];
    } else {
      data.messages = data.messages.filter((msg): msg is Message => {
        const isValid =
          typeof msg === 'object' &&
          typeof msg.message === 'string' &&
          typeof msg.sent_at === 'string' &&
          isValidISODate(msg.sent_at) &&
          typeof msg.recipient === 'string' &&
          (typeof msg.campaign_name === 'string' || msg.campaign_name === null) // Allow null
          typeof msg.sender_id === 'string' &&
          typeof msg.status === 'string';
        if (!isValid) console.warn("Invalid message object:", msg);
        return isValid;
      });
    }

    console.log("Processed messages:", JSON.stringify(data.messages, null, 2));
    return data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch message logs V1");
    return { analytics: { total: 0, statuses: [] }, messages: [] };
  }
};

// WORKSPACES
export const createWorkspace = async (name: string): Promise<Workspace> => {
  try {
    const response = await api.post("/workspaces/", { name });
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to create workspace");
  }
};

export const getWorkspaces = async (): Promise<Workspace[]> => {
  console.log("getWorkspaces API call initiated");
  try {
    const response = await api.get("/workspaces/");
    console.log("getWorkspaces API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch workspaces");
    return [];
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
    const response = await api.get("/campaigns/");
    console.log("getCampaigns API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch campaigns");
    return [];
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
    const response = await api.post("/campaigns/", data);
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
    return { contacts: [], total_count: 0, total_pages: 0, current_page: 0 };
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
    const response = await api.post("/contacts/", data);
    console.log("createContact API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to create contact");
  }
};
export const bulkUploadContacts = async (
  workspace_id: string, 
  file: File, 
  group_id: string
): Promise<BulkUploadResponse & { status: number }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("group_id", group_id);
    
    const response = await api.post(`/contacts/${workspace_id}/${group_id}/bulk-upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });
    
    console.log("bulkUploadContacts API response:", response.data);
    console.log("HTTP Status Code:", response.status);
    
    // Return both the response data and status code
    return {
      ...response.data,
      status: response.status
    } as BulkUploadResponse & { status: number };
    
  } catch (error: any) {
    console.error("bulkUploadContacts API error:", error.response?.data || error);
    
    // If it's a progress code, don't treat as error
    if (error.response?.status && isProgressCode(error.response.status)) {
      return {
        ...error.response.data,
        status: error.response.status,
        success: false // Keep success false but status indicates progress
      };
    }
    
    handleApiError(error, "Failed to bulk upload contacts");
    throw error;
  }
};

// Helper function (can be shared/imported)
const isProgressCode = (statusCode: number): boolean => {
  const progressCodes = [202, 206, 102];
  return progressCodes.includes(statusCode);
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
    
    // Validate the response structure
    if (!Array.isArray(response.data)) {
      console.warn("Expected array response but received:", typeof response.data);
      return [];
    }
    
    // Optional: Validate each group object has required properties
    const validGroups = response.data.filter((group: any) => 
      group && 
      typeof group.group_id === 'string' &&
      typeof group.workspace_id === 'string' &&
      typeof group.name === 'string' &&
      typeof group.created_at === 'string' &&
      typeof group.contact_count === 'number'
      
    );
    
    if (validGroups.length !== response.data.length) {
      console.warn(`Filtered out ${response.data.length - validGroups.length} invalid group objects`);
    }
    
    return validGroups;
  } catch (error: any) {
    console.error(`Failed to fetch workspace groups:`, error);
    handleApiError(error, "Failed to fetch workspace groups");
    return []; // Return empty array as fallback
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
    const response = await api.post("/contact-groups/", data);
    console.log("createGroup API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to create group");
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


export const getGroupContacts = async (
  workspaceId: string,
  groupId: string,
  page: number = 1,
  perPage: number = 50
): Promise<ContactsResponse> => {
  try {
    console.log(`Fetching contacts for group ${groupId}, page ${page}, perPage ${perPage}`);
    const response = await api.get(`/workspaces/${workspaceId}/groups/${groupId}/contacts`, {
      params: { page, per_page: perPage },
    });
    console.log(`Raw getGroupContacts response for group ${groupId}:`, response.data);
    if (!response.data || !Array.isArray(response.data.contacts)) {
      console.warn(`Invalid response structure for group ${groupId}`, response.data);
      return { contacts: [], total_count: 0, total_pages: 0, current_page: page };
    }
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch contacts for group ${groupId}:`, error);
    handleApiError(error, `Failed to fetch contacts for group ${groupId}`);
    return { contacts: [], total_count: 0, total_pages: 0, current_page: page };
  }
};




// SENDER IDS

export const requestSenderId = async (
  workspaceId: string,
  data: { sender_id: string; purpose: string; use_cases: string }
): Promise<SenderId> => {
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
    const response = await api.get("/sender-ids/requests");
    console.log("getUserSenderRequests API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch user sender requests");
    return [];
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
  console.log("getApprovedSenderIds API call initiated for workspace:", workspaceId); // Added console log for consistency
  try {
    const response = await api.get(`/sender-ids/approved?workspace_id=${workspaceId}`);
    console.log("getApprovedSenderIds API response:", response.data); // Added console log for consistency
    // Ensure it's an array before returning
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    // Check if the error is specifically a 'Not Found' error (e.g., 404)
    // The exact check depends on your 'api' instance (e.g., axios)
    if (error.response && error.response.status === 404) {
      console.warn("No approved sender IDs found (404), returning empty array.");
      return []; // Return an empty array gracefully
    } else {
      // For any other type of error, let the handler manage it
      console.error("Error fetching approved sender IDs:", error); // Log the unexpected error
      handleApiError(error, "Failed to fetch approved sender IDs");
      // It's safer to return [] here too, in case handleApiError doesn't throw
      return [];
    }
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
      userId: response.data.user_id,
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

export const changePassword = async (token: string, data: {
  old_password: string; // Changed from current_password to old_password
  new_password: string;
}): Promise<void> => {
  console.log("changePassword API call initiated with data:", data);
  try {
    await api.patch(
      "/users/change-password",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Password changed successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to change password");
  }
};

// Fetch all plans
export const getPlans = async (): Promise<Plan[]> => {
  try {
    const response = await api.get('/plans');
    console.log('getPlans API response:', response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, 'Failed to fetch plans');
  }
};

// Fetch the user's plan
export const getUserPlan = async (): Promise<Plan> => {
  try {
    const response = await api.get('/users/me/plan');
    console.log('getUserPlan API response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch user plan:', error);
    throw error; // Let the caller handle the error
  }
};



// Fetch the user's credit balance
export const getSubscriptionUsage = async (planId: string): Promise<SubscriptionUsage> => {
  try {
    const response = await api.get('/user-credit-balance', {
      params: { plan_id: planId },
    });
    console.log('getSubscriptionUsage API response:', response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, 'Failed to fetch subscription usage');
  }
};



//PLANS AND SUBSCRIPTIONS

// Purchase SMS credits
export const purchaseSmsCredits = async (
  planId: string,
  smsQuantity: number,
  mobileMoneyNumber: string
): Promise<PurchaseSmsCreditsResponse> => {
  const payload: PurchaseSmsCreditsRequest = {
    plan_id: planId,
    sms_quantity: smsQuantity,
    mobile_money_number: mobileMoneyNumber,
  };
  try {
    const response = await api.post('/purchase-sms-credits', payload);
    console.log('purchaseSmsCredits API response:', response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, 'Failed to purchase SMS credits');
  }
};

// Check payment status
export const checkPaymentStatus = async (
  paymentReference: string
): Promise<PaymentStatusResponse> => {
  const payload: PaymentStatusRequest = {
    payment_reference: paymentReference,
  };
  try {
    const response = await api.post('/payment-status', payload);
    console.log('checkPaymentStatus API response:', response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, 'Failed to check payment status');
  }
};

// MESSAGES
export const sendInstantMessage = async (
  workspaceId: string, // Keep this parameter for function call compatibility
  data: {
    recipients?: string[];
    groups?: string[];
    content: string;
    sender_id: string;
    campaign_id?: string;
  }
): Promise<Message> => {
  const payload = {
    // Remove workspace_id as per Swagger documentation
    content: data.content,
    sender_id: data.sender_id,
    recipients: data.recipients || [], // Always include recipients array, even if empty
    ...(data.groups && data.groups.length > 0 && { groups: data.groups }),
    ...(data.campaign_id && { campaign_id: data.campaign_id }),
  };
  
  console.log("sendInstantMessage - payload being sent:", JSON.stringify(payload, null, 2));
  // Still log workspaceId for debugging purposes even though it's not in the payload
  console.log("sendInstantMessage - workspace ID (not in payload):", workspaceId);
  console.log("sendInstantMessage - original data:", JSON.stringify(data, null, 2));
  
  try {
    const response = await api.post("/messages/send-instant", payload);
    console.log("sendInstantMessage - success response:", response.data);
    
    // Return a properly formatted Message object including the content
    // This ensures the content is available in the response for UI display
    return {
      ...response.data,
      content: data.content, // Ensure content is included in the returned object
      sender_id: data.sender_id,
      recipients: response.data.recipients || data.recipients || [],
      // Preserve other message properties from the response
    };
  } catch (error: any) {
    console.error("sendInstantMessage - full error object:", error);
    console.error("sendInstantMessage - error response data:", error.response?.data);
    console.error("sendInstantMessage - error response status:", error.response?.status);
    
    // Log validation details if available
    if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
      console.error("sendInstantMessage - validation errors:", error.response.data.detail);
      error.response.data.detail.forEach((validationError: any, index: number) => {
        console.error(`Validation Error ${index + 1}:`, {
          type: validationError.type,
          location: validationError.loc,
          message: validationError.msg,
          input: validationError.input
        });
      });
    }
    
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
    if (!api.defaults.baseURL?.startsWith("https://")) {
      throw new Error("API baseURL must use HTTPS.");
    }

    const response = await api.get("/notifications/");
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

// New function to generate an SMS message using the /draft_generate_message endpoint
export const generateMessage = async (prompt: string): Promise<string> => {
  try {
    const provider = 'anthropic'; // Predefine the provider as "anthropic"
    console.log('Sending request to /draft:', prompt, 'and provider:', provider);
    const response = await api.post('/draft', { prompt, provider });
    console.log('Raw response from /draft:', response.data);

    // Handle the response format based on the API specification
    if (response.data && typeof response.data === 'object' && 'draft' in response.data) {
      const generatedMessage = response.data.draft;
      if (typeof generatedMessage !== 'string') {
        throw new Error('The "draft" field in the response is not a string');
      }
      return generatedMessage;
    } else {
      throw new Error('Unexpected response format from /draft_generate_message');
    }
  } catch (error: any) {
    handleApiError(error, 'Failed to generate SMS message');
  }
};


// API KEYS
export const listApiKeys = async (): Promise<ApiKey[]> => {
  try {
    const response = await api.get("/api-keys/");
    console.log("listApiKeys API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch API keys");
    return [];
  }
};

export const createApiKey = async (data: { name: string; expires_at?: string }): Promise<ApiKey> => {
  try {
    const response = await api.post("/api-keys/", data);
    console.log("createApiKey API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to create API key");
  }
};

export const getApiKey = async (keyId: string): Promise<ApiKey> => {
  try {
    const response = await api.get(`/api-keys/${keyId}`);
    console.log("getApiKey API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch API key");
  }
};

export const updateApiKey = async (keyId: string, data: { name?: string; status?: "active" | "inactive" }): Promise<ApiKey> => {
  try {
    const response = await api.put(`/api-keys/${keyId}`, data);
    console.log("updateApiKey API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update API key");
  }
};

export const deleteApiKey = async (keyId: string): Promise<void> => {
  try {
    await api.delete(`/api-keys/${keyId}`);
    console.log("API key deleted successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to delete API key");
  }
};

// CALLS
export const makeCall = async (
  workspaceId: string,
  data: CallRequest
): Promise<{ call_log_id: string; status: string }> => {
  console.log('makeCall API call initiated for workspace:', workspaceId, 'with data:', data);
  try {
    if (!data.tts_message && !data.audio_url) {
      throw new Error('Either tts_message or audio_url must be provided');
    }

    console.log('Request URL:', `${api.defaults.baseURL}/calls/make`);
    console.log('Headers:', api.defaults.headers);
    const response = await api.post(`/calls/make`, {
      workspace_id: workspaceId,
      ...data,
    });
    console.log('makeCall API response:', response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'Failed to make call');
    throw error; // Ensure the error is rethrown for the caller
  }
};

export const getCallLogs = async (
  userId: string
): Promise<CallLogsResponse | undefined> => {
  console.log('getCallLogs API call initiated for user:', userId);
  try {
    const response = await api.get(`/calls/logs`, {
      params: { user_id: userId },
    });
    console.log('getCallLogs API response:', response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'Failed to fetch call logs');
  }
  return undefined; // Ensure all code paths return a value
};

//Logs endpoints

export const getMessageLogsV1 = async (): Promise<MessageLogResponse> => {
  console.log("getMessageLogsV1 API call initiated");
  try {
    const response = await api.get("/messages/logs/V1");
    console.log("getMessageLogsV1 API response:", JSON.stringify(response.data, null, 2));

    // Basic response validation
    const data = response.data as MessageLogResponse;
    if (!data || !data.analytics || !Array.isArray(data.messages)) {
      console.warn("Invalid response structure from /messages/logs/V1, returning default");
      return { analytics: { total: 0, statuses: [] }, messages: [] };
    }

    return data;
  } catch (error: any) {
    console.error("Failed to fetch message logs V1:", error);
    const message = error.response?.data?.message || error.message || "Failed to fetch message logs";
    throw new Error(message);
  }
};



export const validateMessage = async (
  data: {
    recipients?: string[];
    groups?: string[];
    content: string;
    sender_id: string;
    campaign_id?: string;
  }
): Promise<{ recipientCount: number; smsCount?: number }> => {
  try {
    console.log("Sending payload to /messages/validate:", {
      content: data.content,
      sender_id: data.sender_id,
      ...(data.recipients && data.recipients.length > 0 && { recipients: data.recipients }),
      ...(data.groups && data.groups.length > 0 && { groups: data.groups }),
      ...(data.campaign_id && { campaign_id: data.campaign_id }),
    });
    const response = await api.post("/messages/validate", {
      content: data.content,
      sender_id: data.sender_id,
      ...(data.recipients && data.recipients.length > 0 && { recipients: data.recipients }),
      ...(data.groups && data.groups.length > 0 && { groups: data.groups }),
      ...(data.campaign_id && { campaign_id: data.campaign_id }),
    });
    return response.data;
  } catch (error: any) {
    console.error("Validation error:", error.response?.data || error.message);
    handleApiError(error, "Failed to validate message");
  }
};


export const getMetricsV1 = async (dateRange?: 'today' | 'this_week' | 'this_month' | 'past_3_months' | 'last_year'): Promise<{
  sms_status: { count: number; status: string }[];
  contacts_count: { total_contacts: number; total_groups: number; groups: { group_id: string; group_name: string; count: number }[] };
  logs_count: { total_sms: number; status_counts: Record<string, number>; daily_counts: Record<string, { pending: number; sent: number; failed: number }> };
}> => {
  console.log(`getMetricsV1 API call initiated with dateRange: ${dateRange || 'all'}`);
  try {
    const query = dateRange ? `?dateRange=${dateRange}` : '';
    const response = await api.get(`/v1/metrics${query}`);
    // console.log("getMetricsV1 API response:", JSON.stringify(response.data, null, 2));

    // Basic response validation
    const data = response.data as {
      sms_status: { count: number; status: string }[];
      contacts_count: { total_contacts: number; total_groups: number; groups: { group_id: string; group_name: string; count: number }[] };
      logs_count: { total_sms: number; status_counts: Record<string, number>; daily_counts: Record<string, { pending: number; sent: number; failed: number }> };
    };
    if (
      !data ||
      !data.sms_status ||
      !Array.isArray(data.sms_status) ||
      !data.contacts_count ||
      !data.logs_count
    ) {
      console.warn("Invalid response structure from /v1/metrics, returning default");
      return {
        sms_status: [],
        contacts_count: { total_contacts: 0, total_groups: 0, groups: [] },
        logs_count: { total_sms: 0, status_counts: {}, daily_counts: {} },
      };
    }

    return data;
  } catch (error: any) {
    console.error("Failed to fetch metrics V1:", error);
    const message = error.response?.data?.message || error.message || "Failed to fetch metrics";
    throw new Error(message);
  }
};

export const getAccountBalance = async (user_id: string): Promise<AccountBalance> => {
  console.log("getAccountBalance API call initiated");
  try {
    const response = await api.get(`/admin/balance/${user_id}/units`);
    console.log("getAccountBalance API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch account balance");
  }
};

// Add these interfaces with the other interfaces
export enum ServiceName {
  SMS = "SMS",
  VOICE = "VOICE",
  WHATSAPP = "WHATSAPP"
}

export enum SourceType {
  ALLOCATION = "ALLOCATION",
  PURCHASE = "PURCHASE"
}

export interface UsageLog {
  usage_id: string;
  service_id: string;
  service_name: ServiceName;
  units_used: number;
  quantity: number;
  source_type: SourceType;
  usage_date: string;
  message_id: string | null;
  transaction_id: string | null;
  usage_description: string;
}

// Add this function before export default api
export const getUsageLogs = async (): Promise<UsageLog[]> => {
  console.log("getUsageLogs API call initiated");
  try {
    const response = await api.get("/usage-logs/all-logs");
    console.log("getUsageLogs API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch usage logs");
  }
};

export default api;