import axios, { AxiosResponse, AxiosError } from 'axios';
import type {
  DeveloperApp,
  CreateDeveloperAppRequest,
  UpdateDeveloperAppRequest,
  ApiError,
  ApiResponse,
  User
} from '../types';

const API_BASE_URL = import.meta.env.MODE === 'development'
  ? (import.meta.env.VITE_DEVELOPMENT_API_URL || '/api')
  : (import.meta.env.VITE_PRODUCTION_API_URL || 'https://polite-prometheus.briq.tz');

console.log('API Configuration:', {
  mode: import.meta.env.MODE,
  baseURL: API_BASE_URL,
  productionURL: import.meta.env.VITE_PRODUCTION_API_URL,
  runtimeConfig: (window as any).APP_CONFIG
});

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



//flake
//interface for flake
interface flake_request {
  phone_number: string;
  preferred_channel: string
}

export interface flake_verify {
  phone_number: string;
  flake_code: string;
}


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

// Add Response Interceptor for 401 Unauthorized and HTML responses
api.interceptors.response.use(
  (response) => {
    // Check if response is HTML instead of JSON
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.error('API returned HTML instead of JSON. Check API_BASE_URL:', API_BASE_URL);
      return Promise.reject(new Error('Invalid API response: received HTML instead of JSON'));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Interfaces
// BasicUser, DashboardUser etc removed in favor of imported User

//interface for Logs
interface LegacyLogResponse {
  analytics: Analytics;
  messages: BaseMessage[];
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

export interface LegacyGroup {
  group_id: string;
  group_name: string;
  count: number;
}

export interface ContactsCount {
  total_contacts: number;
  total_groups: number;
  groups: LegacyGroup[];
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

export interface LegacyMessage {
  message: string;
  sent_at: string;
  recipient: string;
  campaign_name: string | null;
  sender_id: string;
  status: string;
}

export interface MessageLogResponse {
  analytics: Analytics;
  messages: LegacyMessage[];
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

interface BaseGroup {
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


//New campaign infrastructure
interface createCamppaign {

  campaign_name: string;
  description: string;
  launch_date: string;
  workspace_id: string;
}

interface listCampaigns {
  campaign_id: string;
  name: string;
  description?: string;
  launch_date?: string;
  workspace_id: string;
  created_at: string;
}

interface CampaignAnalyticsResponse {
  campaign_id: string;
  name: string;
  description?: string;
  launch_date?: string;
  workspace_id: string;
  created_at: string;
}

interface getCampaign {
  campaign_id: string;
}

interface updateCampaign {
  campaign_id: string;
}

interface deleteCampaign {
  campaign_id: string;
}

interface preLaunchInpection {
  campaign_id: string;
}



interface Notification {
  notification_id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface UserLogResponse {
  user_id: string;
  logs: {
    log_id: string;
    message_id: string;
    status: "pending" | "delivered" | "failed";
    timestamp: string;
    error_details?: string;
  }[];
}

interface PackageService {
  package_service_id: string;
  package_id: string;
  service_id: string;
  quantity: number;
  unit_cost_at_purchase: number;
}

interface Plan {
  package_id: string;
  name: string;
  description: string;
  total_price: number;
  services: PackageService[];
}

// DashboardUser removed in favor of imported User

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

interface InitiateUnitsPaymentRequest {
  amount_paid: number;
  target_phone: string;
  payment_method: string;
}

interface InitiateUnitsPaymentResponse {
  success: boolean;
  message: string;
  payment_reference: string;
  provider_response: {
    message: string;
    order_id: string;
    resultcode: string;
    status: string;
  };
  marked_complete?: boolean;
  units_purchased?: number;
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

interface BaseMessage {
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
  balance: number;
  balance_id: string;
  last_updated: string;
  units: number;
}

interface BalanceUnits {
  unit_cost: number;
}

interface BalanceRefund {
  usage_id: string,

}

interface BalanceUsage {
  unit_cost: number;
  usage_id: string,
  user_id: string,
  service_id: string,
  message_id: string,
  units_used: 0,
  quantity: 0,
  usage_description: string,
  usage_date: string
}

interface BalanceUsageLogs {
  usage_id: string,
  user_id: string,
  service_id: string,
  message_id: string,
  units_used: 0,
  quantity: 0,
  usage_description: string,
  usage_date: string
}

interface BalanceUsageStats {
  service_id: string,
  total_units_used: 0,
  by_services: {
    service_id: string,
    total_units_used: 0,
  }
  by_usage_description: {
    usage_description: string,
    total_units_used: 0,
  }
  by_usage_date: {
    usage_date: string,
    total_units_used: 0,
  }
}

interface BalanceServicesCost {
  service_id: string,
  total_cost: 0,
}

export interface AllocationSummary {
  service_id: string;
  service_name: string;
  total_quantity: number;
}

export interface AllocationsSummaryResponse {
  allocations: AllocationSummary[];
}

export interface ServiceAllocationResponse {
  allocations: Allocation[];
  success?: boolean;
  message?: string;
}

export interface AllocationItem {
  service_id: string;
  units: number;
  expires_at: string;
}

export interface AllocationBatchRequest {
  items: AllocationItem[];
  transaction_id: string;
}

export interface Allocation {
  allocation_id: string;
  transaction_id: string;
  user_id: string;
  service_id: string;
  service_name: string;
  quantity: number;
  expires_at: string;
  last_updated: string;
}

export interface AllocationBatchResponse {
  allocations: Allocation[];
}

export interface Transaction {
  transaction_id: string;
  user_id: string;
  total_amount_paid: number;
  units_purchased: number;
  payment_method: string;
  payment_reference: string;
  transaction_date: string;
  marked_complete: boolean;
}

interface TransactionDeposit {
  transaction_id: string;
  user_id: string;
  total_amount_paid: number;
  units_purchased: number;
  payment_method: string;
  payment_reference: string;
  transaction_date: string;
  marked_complete: boolean;
}
interface getTransactionById {
  transaction_id: string;
  user_id: string;
  total_amount_paid: number;
  units_purchased: number;
  payment_method: string;
  payment_reference: string;
  transaction_date: string;
  marked_complete: boolean;
}

export interface TransactionResponse {
  transactions: Transaction[];
  total_count?: number;
}

//Services Interface
interface services {

  service_id: string,
  name: string,
  description: string,
  unit_cost: 0,
  is_unit_based: true,
  minimum_purchase: 0,
  created_at: "string"
}




//interface for trasnactions

interface PaymentValidationRequest {
  transaction_id: string;
  payment_reference?: string;
}

interface PaymentValidationResponse {
  status: boolean;
  message: string;
  transaction: Transaction;
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
        } else if (typeof detail === 'object' && detail !== null) {
          // Handle nested detail object (e.g., FastAPI validation structure)
          const detailObj = detail as any;
          message = detailObj.message || detailObj.msg || JSON.stringify(detail);
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


interface Webhook {
  webhook_id: string;
  app_id: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret?: string;
  created_at: string;
  updated_at: string;
}

interface CreateWebhookRequest {
  app_id: string;
  url: string;
  events: string[];
  is_active?: boolean;
  secret?: string;
}

interface UpdateWebhookRequest {
  url?: string;
  events?: string[];
  is_active?: boolean;
  secret?: string;
}

// === Admin Interfaces ===
interface SenderIdRequest {
  request_id: string;
  user_id: string;
  username: string;
  sender_id_requested: string;
  status: 'pending' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
}

interface AdminSenderId {
  sender_id: string;
  name: string;
  user_id: string;
  username: string;
  approved_at: string;
}

interface SenderIdListResponse {
  total: number;
  requests: SenderIdRequest[];
}

interface ApprovedSenderIdListResponse {
  total: number;
  sender_ids: AdminSenderId[];
}

interface SenderIdMetrics {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  registered_sender_ids: number;
  avg_approval_time_days: number;
  requests_last_7_days: number;
}

interface UserCredits {
  user_id: string;
  plan_id: string;
  sms_credits: number;
  call_minutes: number;
  last_updated: string;
}

interface UserApiResponse {
  user_id: string;
  username: string;
  email: string;
  full_name?: string;
  mobile_number?: string;
  account_status: string;
  created_at: string;
  credits: {
    user_id: string;
    plan_id: string | null;
    sms_credits: number;
    call_minutes: number;
    last_updated: string;
  } | null;
}

interface AdminUser {
  user_id: string;
  username: string;
  email: string;
  full_name?: string;
  mobile_number?: string;
  account_status: string;
  created_at: string;
  credits?: UserCredits;
  active: boolean;
}

interface NotificationRequest {
  title: string;
  message: string;
  all_users: boolean;
  recipients: string[];
  channel: 'SMS' | 'EMAIL' | 'PUSH';
}

interface NotificationResponse {
  status: string;
  message: string;
}

interface AdminWorkspace {
  workspace_id: string;
  name: string;
  description: string | null;
  created_at: string;
  owner: {
    user_id: string;
    username: string;
  };
  total_contacts: number;
  total_campaigns: number;
}

interface WorkspaceListResponse {
  total: number;
  workspaces: AdminWorkspace[];
  limit: number;
  offset: number;
}

interface WorkspaceMetrics {
  total_workspaces: number;
  avg_contacts_per_workspace: number;
  avg_campaigns_per_workspace: number;
  top_workspace_by_contacts: {
    workspace_id: string;
    name: string;
    total_contacts: number;
  };
  new_workspaces_last_7_days: number;
}

interface WorkspaceOverview {
  workspace_id: string;
  name: string;
  description: string;
  created_at: string;
  owner: {
    user_id: string;
    username: string;
    email: string;
    account_status: string;
  };
  campaigns: {
    recent: Array<{
      launch_date: string;
      name: string;
    }>;
    total: number;
  };
}

interface OTPLog {
  otp_id: string;
  user_id: string;
  phone_number: string;
  code: string;
  is_used: boolean;
  created_at: string;
  expires_at: string;
  used_at?: string;
}

interface OTPMetrics {
  total_otps_generated: number;
  total_otps_used: number;
  total_otps_expired: number;
  usage_rate_percent: number;
  otps_last_24_hours: number;
  top_users: Array<{
    user_id: string;
    username: string;
    email: string;
    otp_count: number;
  }>;
  avg_time_to_use_seconds: number;
}

interface OTPCodesResponse {
  total: number;
  otp_logs: OTPLog[];
}

interface MessagingStats {
  totalSent: {
    sms: number;
    email: number;
  };
}

interface AdminLogResponse {
  logs: Array<{
    id: string;
    message: string;
    timestamp: string;
  }>;
}

interface UserTimeseries {
  date: string;
  count: number;
}

interface UserStatus {
  account_status: string;
}

interface FinancialMetrics {
  total_revenue: number;
  monthly_revenue: number;
  total_transactions: number;
  completed_transactions: number;
  incomplete_transactions: number;
  total_units_sold: number;
  total_units_used: number;
  avg_transaction_value: number;
  top_users: Array<{
    user_id: string;
    username: string;
    total_spent: number;
  }>;
  users_low_balance: Array<{
    user_id: string;
    username: string;
    universal_credits: number;
  }>;
}

interface IncompleteTransaction {
  transaction_id: string;
  user_id: string;
  username: string;
  plan_id: string;
  sms_quantity: number;
  call_minutes_quantity: number;
  total_amount_paid: number;
  payment_method: string;
  payment_reference: string;
  transaction_date: string;
}

interface IncompleteTransactionsResponse {
  transactions: IncompleteTransaction[];
}

interface CreateServiceRequest {
  name: string;
  description: string;
  unit_cost: number;
  is_unit_based: boolean;
  minimum_purchase: number;
}

export interface Service {
  service_id: string;
  name: string;
  description: string;
  unit_cost: number;
  is_unit_based: boolean;
  minimum_purchase: number;
  created_at: string;
}

interface ServiceListResponse {
  total: number;
  services: Service[];
}

interface AdminPackageService {
  package_service_id: string;
  package_id: string;
  service_id: string;
  units_allocated: number;
  unit_cost_at_purchase: number;
}

interface CreatePackageRequest {
  name: string;
  description: string;
  total_price: number;
  services: Array<{
    service_id: string;
    units_allocated: number;
    unit_cost_at_purchase: number;
  }>;
}

export interface Package {
  package_id: string;
  name: string;
  description: string;
  total_price: number;
  services: AdminPackageService[];
}

interface PackageListResponse {
  total: number;
  packages: Package[];
}

interface RevenueTrendData {
  date: string;
  week: string;
  total_revenue: number;
  pending_revenue: number;
}

interface RevenueTrendsResponse {
  interval: string;
  marked_complete: boolean;
  data: RevenueTrendData[];
}

interface TransactionTrendData {
  date: string;
  week: string;
  transactions: number;
}

interface TransactionTrendsResponse {
  interval: string;
  marked_complete: boolean;
  data: TransactionTrendData[];
}

interface CumulativeSummary {
  total_confirmed_revenue: number;
  total_pending_revenue: number;
  pending_transactions: number;
}

interface SendSMSRequest {
  sender_id: string;
  recipient: string;
  message: string;
}

interface SendSMSResponse {
  message_id: string;
  status: string;
}

interface ApproveTransactionResponse {
  status: string;
}

interface AddCreditsResponse {
  status: string;
  new_balance: number;
}

interface AdminApiKey {
  api_key_id: string;
  user_id: string;
  username: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  expires_at: string;
}

interface ApiKeyListResponse {
  total: number;
  api_keys: AdminApiKey[];
}

interface ApiKeyStatusResponse {
  status: 'active' | 'inactive' | 'suspended';
}

interface ApiKeyMetrics {
  total_api_keys: number;
  active_keys: number;
  inactive_keys: number;
  suspended_keys: number;
  expiring_soon: number;
  top_users: Array<{
    user_id: string;
    username: string;
    api_key_count: number;
  }>;
  avg_key_lifetime_days: number;
}

interface CreateApiKeyRequest {
  name: string;
  expires_at: string;
  user_id?: string;
}

interface AdminMessage {
  message_id: string;
  user_id: string;
  recipient: string;
  status: 'pending' | 'sent' | 'failed';
  campaign_id: string;
  channel_id: string;
  sender_id: string;
  sent_at: string;
}

interface AdminMessagesResponse {
  total: number;
  messages: AdminMessage[];
}

interface AdminMessagesMetrics {
  total_messages: number;
  sent: number;
  failed: number;
  pending: number;
  messages_today: number;
  top_users: Array<{
    user_id: string;
    message_count: number;
  }>;
  top_channels: Array<{
    channel_id: string;
    message_count: number;
  }>;
  common_failure_reasons: Array<{
    reason: string;
    count: number;
  }>;
}

interface UserCreditBalance {
  user_id: string;
  plan_id: string;
  sms_credits: number;
  call_minutes: number;
  last_updated: string;
}

interface Plan {
  plan_id: string;
  name: string;
  description: string;
  sms_unit_price: string;
  call_unit_price: string;
  minimum_sms_purchase: number;
  created_at: string;
}

interface CreatePlanRequest {
  name: string;
  description: string;
  sms_unit_price: string | number;
  call_unit_price: string | number;
  minimum_sms_purchase: number;
}

interface UpdatePlanRequest {
  name: string;
  description: string;
  sms_unit_price: string | number;
  call_unit_price: string | number;
  minimum_sms_purchase: number;
}

interface SenderIdReviewResponse {
  message: string;
}

interface PatchBody {
  approve: boolean;
  provider?: string;
}

export interface CompleteTransaction {
  transaction_id: string;
  user_id: string;
  username: string;
  plan_id: string;
  sms_quantity: number;
  call_minutes_quantity: number;
  total_amount_paid: number;
  payment_method: string;
  payment_reference: string;
  transaction_date: string;
}

interface CompleteTransactionsResponse {
  transactions: CompleteTransaction[];
}

interface GetWorkspacesParams {
  limit?: number;
  offset?: number;
}

interface ApiRequestOptions {
  params?: object;
  headers?: object;
  suppressLogging?: boolean;
}

// === API Service Class ===
export class ApiService {
  static async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.get(endpoint, { params: options.params });
      return response.data;
    } catch (error: any) {
      handleAdminApiError(error, `GET ${endpoint} failed`, options.suppressLogging);
      throw error;
    }
  }

  static async post<T>(endpoint: string, data: object | FormData, options: ApiRequestOptions = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.post(endpoint, data, { headers: options.headers });
      return response.data;
    } catch (error: any) {
      handleAdminApiError(error, `POST ${endpoint} failed`, options.suppressLogging);
      throw error;
    }
  }

  static async patch<T>(endpoint: string, data: object, options: ApiRequestOptions = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.patch(endpoint, data, { params: options.params });
      return response.data;
    } catch (error: any) {
      handleAdminApiError(error, `PATCH ${endpoint} failed`, options.suppressLogging);
      throw error;
    }
  }

  static async put<T>(endpoint: string, data: object, options: ApiRequestOptions = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.put(endpoint, data, { params: options.params });
      return response.data;
    } catch (error: any) {
      handleAdminApiError(error, `PUT ${endpoint} failed`, options.suppressLogging);
      throw error;
    }
  }

  static async delete<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.delete(endpoint);
      return response.data;
    } catch (error: any) {
      handleAdminApiError(error, `DELETE ${endpoint} failed`, options.suppressLogging);
      throw error;
    }
  }
}

const handleAdminApiError = (error: AxiosError, defaultMessage: string, suppressLogging: boolean = false): never => {
  let message: string;
  if (error.response?.data) {
    const data = error.response.data as any;
    if (Array.isArray(data.detail)) {
      message = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join('; ');
    } else if (typeof data.detail === 'object' && data.detail !== null) {
      message = JSON.stringify(data.detail, null, 2);
    } else {
      message = data.detail || data.message || JSON.stringify(data, null, 2);
    }
  } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
    message = 'Network error: Unable to connect to the server. This may be due to a CORS issue or server unavailability.';
  } else {
    message = error.message || defaultMessage;
  }
  const errorDetails = {
    message,
    status: error.response?.status || 'N/A',
    data: error.response?.data || null,
    code: error.code || 'N/A',
  };

  if (!suppressLogging) {
    console.error(`${defaultMessage}:`, errorDetails);
  } else {
    console.debug(`${defaultMessage} (Silenced):`, errorDetails.status);
  }

  throw new Error(`${defaultMessage}: ${message} (Status: ${errorDetails.status})`);
};

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


export const loginUser = async (identifier: string, password: string): Promise<{ token: string; user: User; orange?: boolean }> => {
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

    const { access_token, user, orange } = response.data;
    if (access_token) {
      localStorage.setItem("token", access_token);
    }

    // Store orange flag in localStorage so it survives page reloads
    if (orange === true) {
      localStorage.setItem("isOrangeAdmin", "true");
    } else {
      localStorage.removeItem("isOrangeAdmin");
    }

    // Handle case where backend returns orange flag but no user object
    // Create a minimal user object with the orange flag
    let userWithOrange: User;
    if (user) {
      userWithOrange = { ...user, orange: orange ?? user.orange ?? false };
    } else if (orange) {
      // Backend didn't return user but returned orange: true
      // Create minimal user object - profile will be fetched later
      userWithOrange = {
        id: '',
        name: identifier,
        username: identifier,
        email: '',
        phone_number: '',
        orange: true,
        role: 'admin', // Assume admin if orange flag is true
      } as User;
    } else {
      // No user and no orange flag - this shouldn't happen but handle gracefully
      userWithOrange = {
        id: '',
        name: identifier,
        username: identifier,
        email: '',
        phone_number: '',
        orange: false,
        role: 'user',
      } as User;
    }

    return { token: access_token, user: userWithOrange, orange };
  } catch (error: any) {
    handleApiError(error, "Login failed");
    throw error; // handleApiError throws, but this ensures TypeScript knows we never return
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
export const fetchLogs = async (): Promise<any> => {
  try {
    const response = await api.get("/messages/logs");
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch logs");
    throw error;
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
      data.messages = data.messages.filter((msg): msg is LegacyMessage => {
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
    throw error;
  }
};

export const getWorkspaces = async (): Promise<Workspace[]> => {
  try {
    const response = await api.get("/workspaces/");
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
    throw error;
  }
};

export const deleteWorkspace = async (id: string): Promise<void> => {
  console.log("deleteWorkspace API call initiated for ID:", id);
  try {
    await api.delete(`/workspaces/${id}`);
    console.log("Workspace deleted successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to delete workspace");
    throw error;
  }
};

// CAMPAIGNS
export const createCampaign = async (data: {
  name: string;
  description?: string;
  launch_date?: string;
  workspace_id: string;
}): Promise<Campaign> => {
  try {
    const response = await api.post("/campaigns/", data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to create campaign");
    throw error;
  }
};

export const listCampaigns = async (): Promise<Campaign[]> => {
  try {
    const response = await api.get("/campaigns/");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch campaigns");
    return [];
  }
};

export const getCampaignAnalytics = async (): Promise<CampaignAnalyticsResponse> => {
  try {
    const response = await api.get("/campaigns/analytics");
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch campaign analytics");
    throw error;
  }
};

export const getCampaign = async (campaign_id: string): Promise<Campaign> => {
  try {
    const response = await api.get(`/campaigns/${campaign_id}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch campaign");
    throw error; // Ensure return type is satisfied
  }
};

export const updateCampaign = async (campaign_id: string, data: Partial<Campaign>): Promise<Campaign> => {
  try {
    const response = await api.patch(`/campaigns/${campaign_id}`, data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update campaign");
    throw error;
  }
};

export const deleteCampaign = async (campaign_id: string): Promise<void> => {
  try {
    await api.delete(`/campaigns/${campaign_id}`);
  } catch (error: any) {
    handleApiError(error, "Failed to delete campaign");
  }
};

export const preLaunchInspection = async (data: any): Promise<void> => {
  try {
    // If data has campaign_id, use the specific endpoint, otherwise use the general validate endpoint
    if (typeof data === 'string') {
      await api.post(`/campaigns/${data}/prelaunch-inspect`);
    } else {
      await api.post('/campaigns/prelaunch-inspect', data);
    }
  } catch (error: any) {
    handleApiError(error, "Failed to perform pre-launch inspection");
    throw error; // Re-throw to let caller handle it
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
export const getWorkspaceGroups = async (workspaceId: string): Promise<BaseGroup[]> => {
  console.log("getWorkspaceGroups API call initiated for workspace:", workspaceId);
  try {
    const response = await api.get(`/workspaces/${workspaceId}/contact-groups`);
    console.log("getWorkspaceGroups API response:", response.data);
    console.log("getWorkspaceGroups response type:", typeof response.data);
    console.log("getWorkspaceGroups is array:", Array.isArray(response.data));

    // Handle response that might be wrapped in an object
    let groupsData = response.data;
    if (groupsData && typeof groupsData === 'object' && !Array.isArray(groupsData) && 'groups' in groupsData) {
      groupsData = groupsData.groups;
      console.log("Extracted groups from response object:", groupsData);
    }

    // Validate the response structure
    if (!Array.isArray(groupsData)) {
      console.warn("Expected array response but received:", typeof groupsData);
      console.warn("Full response:", response.data);
      return [];
    }

    console.log(`Processing ${groupsData.length} groups from API response`);

    // Be more lenient with validation - only require essential fields
    const validBaseGroups = groupsData.filter((group: any) => {
      if (!group) {
        console.warn("Skipping null/undefined group");
        return false;
      }
      if (!group.group_id) {
        console.warn("Skipping group without group_id:", group);
        return false;
      }
      return true;
    }).map((group: any) => ({
      group_id: group.group_id,
      workspace_id: group.workspace_id || '',
      name: group.name || 'Unnamed BaseGroup',
      created_at: group.created_at || new Date().toISOString(),
      contact_count: group.contact_count || 0,
    }));

    console.log(`Successfully processed ${validBaseGroups.length} valid groups`);
    if (validBaseGroups.length > 0) {
      console.log("Sample group:", validBaseGroups[0]);
    }

    return validBaseGroups;
  } catch (error: any) {
    console.error(`Failed to fetch workspace groups:`, error);
    console.error("Error details:", error.response?.data || error.message);
    handleApiError(error, "Failed to fetch workspace groups");
    return []; // Return empty array as fallback
  }
};

export const getCampaignGroups = async (campaignId: string): Promise<BaseGroup[]> => {
  console.log("getCampaignGroups API call initiated for campaign:", campaignId);
  try {
    const response = await api.get(`/campaigns/${campaignId}/contact-groups`);
    console.log("getCampaignGroups API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch campaign groups");
  }
};

export const createGroup = async (data: { name: string; workspace_id: string }): Promise<BaseGroup> => {
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
    console.log("BaseGroup assigned to campaign successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to assign group to campaign");
  }
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  console.log("deleteGroup API call initiated for group:", groupId);
  try {
    await api.delete(`/contact-groups/${groupId}`);
    console.log("BaseGroup deleted successfully");
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

export const getApprovedSenderIds = async (workspaceId: string): Promise<SenderId[]> => {
  try {
    const response = await api.get(`/sender-ids/approved?workspace_id=${workspaceId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.warn("No approved sender IDs found (404), returning empty array.");
      return [];
    } else {
      handleApiError(error, "Failed to fetch approved sender IDs");
      return [];
    }
  }
};

export const getAdminSenderRequests = async (workspaceId: string): Promise<SenderId[]> => {
  try {
    const response = await api.get(`/admin/sender-ids/requests?workspace_id=${workspaceId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch admin sender requests");
    return [];
  }
};

export const reviewSenderIdRequest = async (
  workspaceId: string,
  requestId: string,
  data: { status: "approved" | "rejected" }
): Promise<SenderId> => {
  try {
    const response = await api.patch(`/admin/sender-ids/${requestId}/review`, {
      ...data,
      workspace_id: workspaceId,
    });
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to review sender ID request");
    throw error;
  }
};

// USER API KEY MANAGEMENT
export const listApiKeys = async (): Promise<ApiKey[]> => {
  try {
    const response = await api.get("/api-keys/");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch API keys");
    return [];
  }
};

export const createApiKey = async (data: { name: string; expires_at?: string }): Promise<ApiKey> => {
  try {
    const response = await api.post("/api-keys/", data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to create API key");
    throw error;
  }
};

export const getApiKey = async (keyId: string): Promise<ApiKey> => {
  try {
    const response = await api.get(`/api-keys/${keyId}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch API key");
    throw error;
  }
};

export const updateApiKey = async (keyId: string, data: { name?: string; status?: "active" | "inactive" }): Promise<ApiKey> => {
  try {
    const response = await api.put(`/api-keys/${keyId}`, data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update API key");
    throw error;
  }
};

export const deleteApiKey = async (keyId: string): Promise<void> => {
  try {
    await api.delete(`/api-keys/${keyId}`);
  } catch (error: any) {
    handleApiError(error, "Failed to delete API key");
    throw error;
  }
};

// PROFILE
export const getProfile = async (): Promise<User> => {
  try {
    const response = await api.get("/users/me");
    return {
      id: response.data.user_id,
      name: response.data.full_name || response.data.username || "User",
      email: response.data.email,
      username: response.data.username,
      full_name: response.data.full_name,
      mobile_number: response.data.mobile_number,
      role: response.data.role || 'user',
      orange: response.data.orange ?? false,
      avatar: response.data.avatar || undefined,
    };
  } catch (error: any) {
    handleApiError(error, "Failed to fetch user profile");
    throw error;
  }
};

export const updateProfile = async (data: {
  full_name: string;
  email: string;
  mobile_number: string;
}): Promise<User> => {
  try {
    const response = await api.patch("/users/me", data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update user profile");
  }
};

export const changePassword = async (token: string, data: {
  old_password: string; // Changed from current_password to old_password
  new_password: string;
}): Promise<void> => {
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

// Fetch all packages
export const getPlans = async (): Promise<Plan[]> => {
  try {
    const response = await api.get('/packages');
    console.log('getPlans API response:', response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, 'Failed to fetch packages');
  }
};

// Fetch the user's plan
export const getUserPlan = async (): Promise<Plan> => {
  try {
    const response = await api.get('/users/me/plan');
    // console.log('getUserPlan API response:', response.data);
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
// Currently moving from purchasing direct sms credits to purchasing units

// Purchase SMS credits
// export const purchaseSmsCredits = async (
//   planId: string,
//   smsQuantity: number,
//   mobileMoneyNumber: string
// ): Promise<PurchaseSmsCreditsResponse> => {
//   const payload: PurchaseSmsCreditsRequest = {
//     plan_id: planId,
//     sms_quantity: smsQuantity,
//     mobile_money_number: mobileMoneyNumber,
//   };
//   try {
//     const response = await api.post('/purchase-sms-credits', payload);
//     console.log('purchaseSmsCredits API response:', response.data);
//     return response.data;
//   } catch (error: any) {
//     return handleApiError(error, 'Failed to purchase SMS credits');
//   }
// };

export const initiateUnitsPayment = async (data: InitiateUnitsPaymentRequest): Promise<InitiateUnitsPaymentResponse> => {
  console.log("initiateUnitsPayment API call initiated with data:", data);
  try {
    const response = await api.post("/transaction/initiate", data);
    console.log("initiateUnitsPayment API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to initiate Units payment");
  }
};


// Add this function before export default api


export const getAllocations = async (packageId: string): Promise<ServiceAllocationResponse> => {
  try {
    const response = await api.post('/allocation/create', {
      package_id: packageId
    });
    console.log('getAllocations API response:', response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'Failed to send bulk SMS file');
    throw error;
  }
};

// Check payment status
export const checkPaymentStatus = async (
  paymentReference: string
): Promise<any> => {
  const payload = {
    payment_reference: paymentReference,
  };
  try {
    const response = await api.post('/payment-status', payload);
    console.log('checkPaymentStatus API response:', response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, 'Failed to check payment status');
    throw error;
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
    schedule?: {
      start_date: string;
      start_time: string;
      end_date?: string | null;
      end_time?: string | null;
      frequency: string;
    };
  }
): Promise<BaseMessage> => {
  const payload = {
    // Remove workspace_id as per Swagger documentation
    content: data.content,
    sender_id: data.sender_id,
    recipients: data.recipients || [], // Always include recipients array, even if empty
    ...(data.groups && data.groups.length > 0 && { groups: data.groups }),
    ...(data.campaign_id && { campaign_id: data.campaign_id }),
    ...(data.schedule && { schedule: data.schedule }),
  };

  console.log("sendInstantBaseMessage - payload being sent:", JSON.stringify(payload, null, 2));
  // Still log workspaceId for debugging purposes even though it's not in the payload
  console.log("sendInstantBaseMessage - workspace ID (not in payload):", workspaceId);
  console.log("sendInstantBaseMessage - original data:", JSON.stringify(data, null, 2));

  try {
    const response = await api.post("/messages/send-instant", payload);
    console.log("sendInstantBaseMessage - success response:", response.data);

    // Return a properly formatted BaseMessage object including the content
    // This ensures the content is available in the response for UI display
    return {
      ...response.data,
      content: data.content, // Ensure content is included in the returned object
      sender_id: data.sender_id,
      recipients: response.data.recipients || data.recipients || [],
      // Preserve other message properties from the response
    };
  } catch (error: any) {
    console.error("sendInstantBaseMessage - full error object:", error);
    console.error("sendInstantBaseMessage - error response data:", error.response?.data);
    console.error("sendInstantBaseMessage - error response status:", error.response?.status);

    // Log validation details if available
    if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
      console.error("sendInstantBaseMessage - validation errors:", error.response.data.detail);
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
    throw error;
  }
};

// Send bulk SMS by parsing file content and using instant message API
export const sendBulkSMSFile = async (
  workspaceId: string,
  data: {
    file: File;
    sender_id: string;
    content: string;
    phone_column?: string;
    default_country_code?: string;
  }
): Promise<BaseMessage> => {
  try {
    console.log('=== sendBulkSMSFile called ===');
    console.log('WorkspaceId:', workspaceId);
    console.log('File:', data.file?.name, 'Size:', data.file?.size);
    console.log('Phone column:', data.phone_column);

    // Parse the CSV file to extract phone numbers
    const fileContent = await data.file.text();
    const lines = fileContent.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      throw new Error('File is empty or invalid');
    }

    // Get headers from first line
    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
    console.log('CSV Headers:', headers);

    // Find the phone column index
    const phoneColumnIndex = headers.findIndex(h =>
      h.toLowerCase() === data.phone_column?.toLowerCase()
    );

    if (phoneColumnIndex === -1) {
      throw new Error(`Phone column "${data.phone_column}" not found in file headers: ${headers.join(', ')}`);
    }

    // Extract phone numbers from data rows
    const recipients: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(c => c.trim().replace(/['"]/g, ''));
      if (row[phoneColumnIndex] && row[phoneColumnIndex].trim()) {
        let phoneNumber = row[phoneColumnIndex].trim();

        // Add default country code if needed
        if (data.default_country_code && !phoneNumber.startsWith('+') && !phoneNumber.startsWith('255')) {
          phoneNumber = data.default_country_code + phoneNumber;
        }

        recipients.push(phoneNumber);
      }
    }

    console.log('Extracted recipients:', recipients.length);
    console.log('Sample recipients:', recipients.slice(0, 5));

    if (recipients.length === 0) {
      throw new Error('No valid phone numbers found in the file');
    }

    // Use the standard instant message API with the extracted recipients
    const messageData = {
      sender_id: data.sender_id,
      content: data.content,
      recipients: recipients,
    };

    console.log('Sending via instant message API with', recipients.length, 'recipients');
    return await sendInstantMessage(workspaceId, messageData);

  } catch (error: unknown) {
    console.error('=== sendBulkSMSFile error ===');
    console.error('Error details:', error);
    handleApiError(error, "Failed to send bulk SMS from file");
    throw error;
  }
};

export const getMessageLogs = async (): Promise<BaseMessage[]> => {
  try {
    const response = await api.get("/messages/logs");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch message logs");
    throw error;
  }
};


export const getUserMessages = async (): Promise<BaseMessage[]> => {
  try {
    const response = await api.get("/messages/me");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch user messages");
    throw error;
  }
};

export const getMessagesByRecipient = async (recipient: string): Promise<BaseMessage[]> => {
  try {
    const response = await api.get(`/messages/recipient/${recipient}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch messages by recipient");
    throw error;
  }
};

export const getBaseMessageDetail = async (messageId: string): Promise<BaseMessage> => {
  try {
    const response = await api.get(`/messages/${messageId}`);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch message detail");
    throw error;
  }
};

// NOTIFICATIONS
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    // Skip HTTPS check in development mode (proxy handles it)
    if (import.meta.env.MODE === 'production' && !api.defaults.baseURL?.startsWith("https://")) {
      throw new Error("API baseURL must use HTTPS in production.");
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
    throw error;
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

// export const getAccountBalance = async (user_id: string): Promise<AccountBalance> => {
//   console.log("getAccountBalance API call initiated");
//   try {
//     const response = await api.get(`/admin/balance/${user_id}/units`);
//     console.log("getAccountBalance API response:", response.data);
//     return response.data;
//   } catch (error: any) {
//     return handleApiError(error, "Failed to fetch account balance");
//   }
// };

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
    handleApiError(error, 'Failed to get message logs');
    throw error;
  }
};



// === PAYMENT VALIDATION ===
export const validatePayment = async (data: PaymentValidationRequest): Promise<PaymentValidationResponse> => {
  console.log("validatePayment API call initiated with data:", data);
  try {
    const response = await api.post("/transaction/validate-payment", data);
    console.log("validatePayment API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to validate payment");
  }
};

// === SERVICES CRUD ===
export const getServices = async (): Promise<services[]> => {
  console.log("getServices API call initiated");
  try {
    const response = await api.get("/services");
    console.log("getServices API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch services");
  }
};

export const getServiceById = async (service_id: string): Promise<services> => {
  console.log("getServiceById API call initiated for service:", service_id);
  try {
    const response = await api.get(`/services/${service_id}`);
    console.log("getServiceById API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch service");
  }
};

export const createService = async (data: services): Promise<services> => {
  console.log("createService API call initiated with data:", data);
  try {
    const response = await api.post("/services", data);
    console.log("createService API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to create service");
  }
};

export const updateService = async (service_id: string, data: services): Promise<services> => {
  console.log("updateService API call initiated for service:", service_id, "with data:", data);
  try {
    const response = await api.put(`/services/${service_id}`, data);
    console.log("updateService API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to update service");
  }
};

export const deleteService = async (service_id: string): Promise<void> => {
  console.log("deleteService API call initiated for service:", service_id);
  try {
    await api.delete(`/services/${service_id}`);
    console.log("deleteService API response: Service deleted successfully");
  } catch (error: any) {
    return handleApiError(error, "Failed to delete service");
  }
};

// === BALANCE ENDPOINTS ===
export const getBalanceUnits = async (): Promise<BalanceUnits> => {
  console.log("getBalanceUnits API call initiated");
  try {
    const response = await api.get("/balance/units");
    console.log("getBalanceUnits API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch balance units");
  }
};

export const getBalanceRefund = async (): Promise<BalanceRefund> => {
  console.log("getBalanceRefund API call initiated");
  try {
    const response = await api.get("/balance/refund");
    console.log("getBalanceRefund API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch balance refund");
  }
};

export const getAccountBalance = async (): Promise<AccountBalance> => {
  console.log("getAccountBalance API call initiated");
  try {
    const response = await api.get("/balance/account");
    console.log("getAccountBalance API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch account balance");
  }
};

export const getBalanceUsage = async (): Promise<BalanceUsage> => {
  console.log("getBalanceUsage API call initiated");
  try {
    const response = await api.get("/balance/usage");
    console.log("getBalanceUsage API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch balance usage");
  }
};

export const getBalanceUsageLogs = async (): Promise<BalanceUsageLogs[]> => {
  console.log("getBalanceUsageLogs API call initiated");
  try {
    const response = await api.get("/balance/usage/logs");
    console.log("getBalanceUsageLogs API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch balance usage logs");
  }
};

export const getBalanceUsageLogsById = async (usage_id: string): Promise<BalanceUsageLogs> => {
  console.log("getBalanceUsageLogsById API call initiated for ID:", usage_id);
  try {
    const response = await api.get(`/balance/usage/logs/${usage_id}`);
    console.log("getBalanceUsageLogsById API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch balance usage log by ID");
  }
};

export const getBalanceUsageStats = async (): Promise<BalanceUsageStats> => {
  console.log("getBalanceUsageStats API call initiated");
  try {
    const response = await api.get("/balance/usage/stats");
    console.log("getBalanceUsageStats API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch balance usage stats");
  }
};

export const getBalanceServicesCost = async (service_id: string): Promise<BalanceServicesCost> => {
  console.log("getBalanceServicesCost API call initiated for service:", service_id);
  try {
    const response = await api.get(`/balance/services/cost/${service_id}`);
    console.log("getBalanceServicesCost API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to fetch balance services cost");
  }
};

// === TRANSACTIONS ===
export const transactionDeposit = async (data: Transaction): Promise<Transaction> => {
  console.log("transactionDeposit API call initiated with data:", data);
  try {
    const response = await api.post("/transaction/deposit", data);
    console.log("transactionDeposit API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to create transaction deposit");
  }
};

export const getTransactionById = async (transaction_id: string): Promise<Transaction> => {
  console.log("getTransactionById API call initiated for transaction:", transaction_id);
  try {
    const response = await api.get(`/transaction/${transaction_id}`);
    console.log("getTransactionById API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to get transaction by id");
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  console.log("getTransactions API call initiated");
  try {
    const response = await api.get("/transaction", {
      params: { skip: 0, limit: 1000 },
    });
    console.log("getTransactions API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to get transactions");
  }
};

export const getAllocationsSummary = async (): Promise<AllocationsSummaryResponse> => {
  console.log("getAllocationsSummary API call initiated");
  try {
    const response = await api.get("/allocations/summary");
    console.log("getAllocationsSummary API response:", response.data);
    // Validate and normalize response
    if (!response.data || !Array.isArray(response.data.allocations)) {
      console.warn("Invalid allocations response structure, returning empty allocations");
      return { allocations: [] };
    }
    // Validate each allocation object
    const validAllocations = response.data.allocations.filter((alloc: any) =>
      alloc &&
      typeof alloc.service_id === 'string' &&
      typeof alloc.service_name === 'string' &&
      typeof alloc.total_quantity === 'number'
    );

    if (validAllocations.length !== response.data.allocations.length) {
      console.warn(`Filtered out ${response.data.allocations.length - validAllocations.length} invalid allocation objects`);
    }

    return { allocations: validAllocations };
  } catch (error: any) {
    return handleApiError(error, "Failed to get allocations summary");
  }
};

// Allocation create endpoint for purchasing packages with wallet credits
export interface AllocationCreateRequest {
  service_id: string;
  quantity: number;
}

export interface AllocationCreateResponse {
  allocation_id: string;
  service_id: string;
  quantity: number;
  created_at: string;
  expires_at?: string;
  last_updated?: string;
}

export const createAllocation = async (data: AllocationCreateRequest): Promise<AllocationCreateResponse> => {
  console.log("createAllocation API call initiated with data:", data);
  try {
    const response = await api.post("/allocations/create", data);
    console.log("createAllocation API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to create allocation");
  }
};

// Allocation batch endpoint for purchasing packages with wallet credits
export const allocateBatch = async (data: AllocationBatchRequest): Promise<AllocationBatchResponse> => {
  console.log("allocateBatch API call initiated with data:", data);
  try {
    const response = await api.post("/allocations/batch", data);
    console.log("allocateBatch API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to allocate batch");
  }
};

// Add this interface with the other interfaces
export interface TransactionCompleteRequest {
  payment_reference: string;
  transaction_id: string;
}

export interface TransactionCompleteResponse {
  success: boolean;
  message: string;
  payment_reference: string;
  credits_added: number;
  updated_balance: number;
}

// Add this function before export default api
export const completeTransaction = async (data: TransactionCompleteRequest
): Promise<TransactionCompleteResponse> => {
  console.log("completeTransaction API call initiated with data:", data);
  try {
    const response = await api.post("/transaction/complete", data);
    console.log("completeTransaction API response:", response.data);
    return response.data;
  } catch (error: any) {
    return handleApiError(error, "Failed to complete transaction");
  }
};


// DEVELOPER APPS API
export class DeveloperAppsApiClient {
  private config: { baseUrl: string; headers?: Record<string, string> };

  constructor(config: { baseUrl: string; headers?: Record<string, string> }) {
    this.config = config;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, requestOptions);

      if (response.ok) {
        const data = await response.json();
        return { data, status: response.status };
      } else {
        const error = await response.json();
        return { error, status: response.status };
      }
    } catch (err) {
      throw new Error(`Request failed: ${err}`);
    }
  }

  /**
   * List all developer apps for the authenticated user
   * GET /developer-apps/
   */
  async listDeveloperApps(): Promise<ApiResponse<DeveloperApp[]>> {
    return this.makeRequest<DeveloperApp[]>('/developer-apps/');
  }

  /**
   * Create a new developer app (optionally in a workspace owned by the user)
   * POST /developer-apps/
   */
  async createDeveloperApp(
    appData: CreateDeveloperAppRequest
  ): Promise<ApiResponse<DeveloperApp>> {
    return this.makeRequest<DeveloperApp>('/developer-apps/', {
      method: 'POST',
      body: JSON.stringify(appData),
    });
  }

  /**
   * Get a developer app by its ID
   * GET /developer-apps/{app_id}
   */
  async getDeveloperApp(appId: string): Promise<ApiResponse<DeveloperApp>> {
    return this.makeRequest<DeveloperApp>(`/developer-apps/${appId}`);
  }

  /**
   * Update a developer app
   * PATCH /developer-apps/{app_id}
   */
  async updateDeveloperApp(
    appId: string,
    appData: UpdateDeveloperAppRequest
  ): Promise<ApiResponse<DeveloperApp>> {
    return this.makeRequest<DeveloperApp>(`/developer-apps/${appId}`, {
      method: 'PATCH',
      body: JSON.stringify(appData),
    });
  }

  /**
   * Delete a developer app
   * DELETE /developer-apps/{app_id}
   */
  async deleteDeveloperApp(appId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/developer-apps/${appId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get a developer app by its app_key
   * GET /developer-apps/by-key/{app_key}
   */
  async getDeveloperAppByKey(appKey: string): Promise<ApiResponse<DeveloperApp>> {
    return this.makeRequest<DeveloperApp>(`/developer-apps/by-key/${appKey}`);
  }

  /**
   * List all developer apps for a workspace (owned by the user)
   * GET /workspaces/{workspace_id}/developer-apps
   */
  async getWorkspaceDeveloperApps(
    workspaceId: string
  ): Promise<ApiResponse<DeveloperApp[]>> {
    return this.makeRequest<DeveloperApp[]>(
      `/workspaces/${workspaceId}/developer-apps`
    );
  }
}

// Usage example and helper functions
export class DeveloperAppsService {
  private client: DeveloperAppsApiClient;

  constructor(baseUrl: string, authToken?: string) {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    this.client = new DeveloperAppsApiClient({
      baseUrl,
      headers,
    });
  }

  // Convenience methods with error handling
  async createApp(
    name: string,
    description: string,
    workspaceId?: string
  ): Promise<DeveloperApp | null> {
    const response = await this.client.createDeveloperApp({
      app_name: name,
      app_description: description,
      workspace_id: workspaceId,
    });

    if (response.data) {
      return response.data;
    } else {
      console.error('Failed to create app:', response.error);
      return null;
    }
  }

  async getAllApps(): Promise<DeveloperApp[]> {
    const response = await this.client.listDeveloperApps();
    return response.data || [];
  }

  async getAppById(appId: string): Promise<DeveloperApp | null> {
    const response = await this.client.getDeveloperApp(appId);
    return response.data || null;
  }

  async getAppByKey(appKey: string): Promise<DeveloperApp | null> {
    const response = await this.client.getDeveloperAppByKey(appKey);
    return response.data || null;
  }

  async updateApp(
    appId: string,
    updates: UpdateDeveloperAppRequest
  ): Promise<DeveloperApp | null> {
    const response = await this.client.updateDeveloperApp(appId, updates);
    return response.data || null;
  }

  async deleteApp(appId: string): Promise<boolean> {
    const response = await this.client.deleteDeveloperApp(appId);
    return response.status === 204;
  }

  async getWorkspaceApps(workspaceId: string): Promise<DeveloperApp[]> {
    const response = await this.client.getWorkspaceDeveloperApps(workspaceId);
    return response.data || [];
  }
}

// Convenience functions using the existing axios instance
export const createDeveloperApp = async (data: CreateDeveloperAppRequest): Promise<DeveloperApp> => {
  console.log("createDeveloperApp API call initiated with data:", data);
  try {
    const response = await api.post("/developer-apps/", data);
    console.log("createDeveloperApp API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to create developer app");
  }
};

export const getDeveloperApps = async (): Promise<DeveloperApp[]> => {
  console.log("getDeveloperApps API call initiated");
  try {
    const response = await api.get("/developer-apps/");
    console.log("getDeveloperApps API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch developer apps");
    return [];
  }
};

export const getDeveloperApp = async (appId: string): Promise<DeveloperApp> => {
  console.log("getDeveloperApp API call initiated for app:", appId);
  try {
    const response = await api.get(`/developer-apps/${appId}`);
    console.log("getDeveloperApp API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch developer app");
  }
};

export const updateDeveloperApp = async (
  appId: string,
  data: UpdateDeveloperAppRequest
): Promise<DeveloperApp> => {
  console.log("updateDeveloperApp API call initiated for app:", appId, "with data:", data);
  try {
    const response = await api.patch(`/developer-apps/${appId}`, data);
    console.log("updateDeveloperApp API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update developer app");
  }
};

export const deleteDeveloperApp = async (appId: string): Promise<void> => {
  console.log("deleteDeveloperApp API call initiated for app:", appId);
  try {
    await api.delete(`/developer-apps/${appId}`);
    console.log("Developer app deleted successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to delete developer app");
  }
};

export const getDeveloperAppByKey = async (appKey: string): Promise<DeveloperApp> => {
  console.log("getDeveloperAppByKey API call initiated for key:", appKey);
  try {
    const response = await api.get(`/developer-apps/by-key/${appKey}`);
    console.log("getDeveloperAppByKey API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch developer app by key");
  }
};

export const getWorkspaceDeveloperApps = async (workspaceId: string): Promise<DeveloperApp[]> => {
  console.log("getWorkspaceDeveloperApps API call initiated for workspace:", workspaceId);
  try {
    const response = await api.get(`/workspaces/${workspaceId}/developer-apps`);
    console.log("getWorkspaceDeveloperApps API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch workspace developer apps");
    return [];
  }
};




//webhooks

export const createWebhook = async (data: CreateWebhookRequest): Promise<Webhook> => {
  console.log("createWebhook API call initiated with data:", data);
  try {
    const response = await api.post("/webhooks/", data);
    console.log("createWebhook API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to create webhook");
  }
};

export const listWebhooks = async (): Promise<Webhook[]> => {
  console.log("listWebhooks API call initiated");
  try {
    const response = await api.get("/webhooks/");
    console.log("listWebhooks API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch webhooks");
    return [];
  }
};

export const getWebhooksByApp = async (appId: string): Promise<Webhook[]> => {
  console.log("getWebhooksByApp API call initiated for app:", appId);
  try {
    const response = await api.get(`/webhooks/app/${appId}`);
    console.log("getWebhooksByApp API response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error: any) {
    handleApiError(error, "Failed to fetch webhooks for app");
    return [];
  }
};

export const getWebhook = async (webhookId: string): Promise<Webhook> => {
  console.log("getWebhook API call initiated for webhook:", webhookId);
  try {
    const response = await api.get(`/webhooks/${webhookId}`);
    console.log("getWebhook API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch webhook");
  }
};

export const updateWebhook = async (
  webhookId: string,
  data: UpdateWebhookRequest
): Promise<Webhook> => {
  console.log("updateWebhook API call initiated for webhook:", webhookId, "with data:", data);
  try {
    const response = await api.patch(`/webhooks/${webhookId}`, data);
    console.log("updateWebhook API response:", response.data);
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update webhook");
  }
};

export const deleteWebhook = async (webhookId: string): Promise<void> => {
  console.log("deleteWebhook API call initiated for webhook:", webhookId);
  try {
    await api.delete(`/webhooks/${webhookId}`);
    console.log("Webhook deleted successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to delete webhook");
  }
};



export const flake_request = async (phoneNumber: string, preferredChannel: string = "sms"): Promise<void> => {
  try {
    await api.post("/auth/flake/request", {
      phone_number: phoneNumber,
      preferred_channel: preferredChannel,
    });
    console.log("OTP requested successfully");
  } catch (error: any) {
    handleApiError(error, "Failed to request OTP");
  }
};

export const flake_verify = async (phoneNumber: string, otp: string): Promise<{ token: string; user: any }> => {
  try {
    const response = await api.post("/auth/flake/verify", {
      phone_number: phoneNumber,
      flake_code: otp,
    });
    console.log("OTP verified successfully");
    return response.data;
  } catch (error: any) {
    handleApiError(error, "Invalid or expired code");
  }
};

// Admin API endpoints have been moved to admin-api.tsx

export { api };
export type { UserApiResponse };


