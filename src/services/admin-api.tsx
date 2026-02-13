import { ApiService } from './api';

// === Admin Interfaces ===
interface SenderIdRequest {
  sender_id: string;
  use_case: string;
  approval_required: boolean;
  workspace_id?: string;
}

interface AdminSenderId {
  sender_id_id: string;
  sender_id: string;
  status: 'pending' | 'approved' | 'rejected';
  use_case: string;
  provider: string;
  created_at: string;
}

interface SenderIdListResponse {
  sender_ids: AdminSenderId[];
}

interface ApprovedSenderIdListResponse {
  sender_ids: AdminSenderId[];
}

interface SenderIdMetrics {
  total_sender_ids: number;
  approved: number;
  pending: number;
  rejected: number;
}

interface UserApiResponse {
  user_id: string;
  username: string;
  email: string;
  account_status: 'active' | 'suspended' | 'inactive';
  created_at: string;
  universal_credits?: number;
}

interface AdminUser {
  user_id: string;
  username: string;
  email: string;
  account_status: 'active' | 'suspended' | 'inactive';
  created_at: string;
  workspace_id?: string;
}

interface AdminWorkspace {
  workspace_id: string;
  workspace_name: string;
  owner_id: string;
  created_at: string;
  total_users: number;
  total_messages_sent: number;
}

interface WorkspaceListResponse {
  workspaces: AdminWorkspace[];
}

interface WorkspaceMetrics {
  total_workspaces: number;
  active_workspaces: number;
  total_users: number;
  total_messages: number;
}

interface WorkspaceOverview {
  workspace_id: string;
  workspace_name: string;
  owner_id: string;
  total_users: number;
  total_messages_sent: number;
  total_api_calls: number;
  created_at: string;
}

interface OTPLog {
  otp_id: string;
  otp_code: string;
  user_id: string;
  attempts: number;
  used: boolean;
  created_at: string;
}

interface OTPMetrics {
  total_otps_generated: number;
  total_otps_used: number;
  total_otps_expired: number;
  usage_rate_percent: number;
  otps_last_24_hours: number;
  top_users: Array<{ user_id: string; otp_count: number }>;
  avg_time_to_use_seconds: number;
}

interface OTPCodesResponse {
  logs: OTPLog[];
}

interface MessageLog {
  message_id: string;
  sender_id: string;
  recipient: string;
  content: string;
  status: string;
  created_at: string;
  workspace_id: string;
}

interface AdminLogResponse {
  messages: MessageLog[];
}

interface MessagingStats {
  total_messages: number;
  sms_sent_24h: number;
  email_sent_24h: number;
  delivery_success_rate: number;
}

interface AdminMessagesResponse {
  messages: MessageLog[];
  total: number;
}

interface AdminMessagesMetrics {
  total_messages: number;
  sent: number;
  failed: number;
  messages_today: number;
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
  top_users: Array<{ user_id: string; total_spent: number }>;
  users_low_balance: Array<{ user_id: string; balance: number }>;
}

interface IncompleteTransaction {
  transaction_id: string;
  user_id: string;
  username: string;
  total_amount_paid: number;
  payment_method: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  created_at: string;
}

interface IncompleteTransactionsResponse {
  incomplete_transactions: IncompleteTransaction[];
}

interface CompleteTransactionsResponse {
  complete_transactions: IncompleteTransaction[];
}

interface RevenueTrendData {
  date: string;
  revenue: number;
}

interface RevenueTrendsResponse {
  trends: RevenueTrendData[];
}

interface TransactionTrendData {
  date: string;
  count: number;
}

interface TransactionTrendsResponse {
  trends: TransactionTrendData[];
}

interface CumulativeSummary {
  total_users: number;
  total_revenue: number;
  total_transactions: number;
}

interface UserTimeseries {
  date: string;
  new_users: number;
}

interface UserStatus {
  user_id: string;
  account_status: string;
}

interface BalanceUsageStats {
  total_credits_allocated: number;
  total_credits_used: number;
  average_usage_per_user: number;
  peak_usage_date: string;
  usage_by_service: Array<{ service_name: string; units_used: number }>;
}

interface SendSMSRequest {
  phone_number: string;
  message: string;
}

interface SendSMSResponse {
  message_id: string;
  status: string;
}

interface ApproveTransactionResponse {
  transaction_id: string;
  status: string;
}

interface NotificationRequest {
  title: string;
  message: string;
  all_users: boolean;
  recipients: string[];
  channel: string;
}

interface NotificationResponse {
  notification_id: string;
  status: string;
}

interface AddCreditsResponse {
  user_id: string;
  new_balance: number;
}

interface CreditRequest {
  request_id: string;
  user_id: string;
  amount: number;
  status: string;
}

interface CreditRequestsResponse {
  requests: CreditRequest[];
}

interface ReviewCreditRequestResponse {
  request_id: string;
  status: string;
}

interface ApiKey {
  api_key_id: string;
  key: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_used: string;
}

interface AdminApiKey {
  api_key_id: string;
  key: string;
  name: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

interface CreateApiKeyRequest {
  name: string;
  permissions?: string[];
}

interface ApiKeyListResponse {
  api_keys: ApiKey[];
}

interface ApiKeyStatusResponse {
  api_key_id: string;
  status: 'active' | 'inactive' | 'suspended';
}

interface ApiKeyMetrics {
  total_keys: number;
  active_keys: number;
  inactive_keys: number;
  suspended_keys: number;
  most_used_key: string;
  total_api_calls: number;
}

interface Package {
  package_id: string;
  name: string;
  description: string;
  total_price: number;
  services: Array<{
    package_service_id: string;
    service_id: string;
    units_allocated: number;
    unit_cost_at_purchase: number;
  }>;
  created_at?: string;
}

interface AdminPackageService {
  service_id: string;
  units_allocated: number;
  unit_cost_at_purchase: number;
}

interface CreatePackageRequest {
  name: string;
  description: string;
  total_price: number;
  services: AdminPackageService[];
}

interface Plan {
  plan_id: string;
  name: string;
  description: string;
  pricing: string;
  unit_price: number;
  created_at?: string;
}

interface CreatePlanRequest {
  name: string;
  description: string;
  pricing: string;
  unit_price: number;
}

interface UpdatePlanRequest {
  name?: string;
  description?: string;
  pricing?: string;
  unit_price?: number;
}

interface Service {
  service_id: string;
  name: string;
  description: string;
  unit_cost: number;
  is_unit_based: boolean;
  minimum_purchase: number;
}

interface CreateServiceRequest {
  name: string;
  description?: string;
  unit_cost: number;
  is_unit_based?: boolean;
  minimum_purchase?: number;
}

interface ServiceListResponse {
  services: Service[];
}

interface SenderIdReviewResponse {
  sender_id_id: string;
  status: 'approved' | 'rejected';
  provider?: string;
}

interface PatchBody {
  approve: boolean;
  provider?: string;
}

interface GetWorkspacesParams {
  limit?: number;
  offset?: number;
  search?: string;
}

interface UserCreditBalance {
  user_id: string;
  credits: number;
}

// Admin API Service
export const AdminApi = {
  // Sender ID Management
  getSenderIdRequests: async (
    status?: 'pending' | 'approved' | 'rejected',
    limit?: number,
    offset?: number
  ): Promise<SenderIdListResponse> => {
    const params: any = {};
    if (status) params.status = status;
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return ApiService.get<SenderIdListResponse>('/admin/sender-ids/requests', { params });
  },

  getApprovedSenderIds: async (limit?: number, offset?: number): Promise<ApprovedSenderIdListResponse> => {
    const params: any = {};
    if (limit) params.limit = limit;
    if (offset) params.offset = offset;
    return ApiService.get<ApprovedSenderIdListResponse>('/admin/sender-ids', { params });
  },

  reviewSenderIdRequest: async (
    requestId: string,
    approve: boolean,
    provider?: string
  ): Promise<SenderIdReviewResponse> => {
    try {
      const requestBody: PatchBody = { approve };
      if (approve) {
        if (typeof provider !== 'string' || provider.trim() === '') {
          throw new Error('Provider must be a non-empty string when approving a Sender ID request.');
        }
        requestBody.provider = provider;
      }
      return await ApiService.patch<SenderIdReviewResponse>(
        `/admin/sender-ids/${requestId}/review`,
        requestBody
      );
    } catch (error: any) {
      console.error('Review sender ID request failed:', error);
      throw error;
    }
  },

  deleteSenderId: async (senderId: string): Promise<string> => {
    try {
      return await ApiService.delete<any>(`/admin/sender-ids/${senderId}`);
    } catch (error: any) {
      console.error('Delete sender ID failed:', error);
      throw error;
    }
  },

  getSenderIdMetrics: async (): Promise<SenderIdMetrics> => {
    return ApiService.get('/admin/sender-ids/metrics');
  },

  // Workspace Management
  getWorkspaces: async (params?: GetWorkspacesParams): Promise<WorkspaceListResponse> => {
    return ApiService.get<WorkspaceListResponse>('/admin/workspaces', { params });
  },

  getWorkspaceMetrics: async (): Promise<WorkspaceMetrics> => {
    return ApiService.get('/admin/workspaces/metrics');
  },

  getWorkspaceOverview: async (workspaceId: string): Promise<WorkspaceOverview> => {
    return ApiService.get(`/admin/workspaces/${workspaceId}/overview`);
  },

  // OTP Management
  getOTPCodes: async (): Promise<OTPCodesResponse> => {
    return ApiService.get('/admin/otp-codes');
  },

  getOTPCodesMetrics: async (): Promise<OTPMetrics> => {
    try {
      return await ApiService.get('/admin/otp-codes/metrics', { suppressLogging: true });
    } catch (error: any) {
      const is404 = error.message?.includes('404') || error.response?.status === 404;
      if (is404) {
        console.debug('[OTP Metrics] Endpoint not available, using fallback data');
        return {
          total_otps_generated: 0,
          total_otps_used: 0,
          total_otps_expired: 0,
          usage_rate_percent: 0,
          otps_last_24_hours: 0,
          top_users: [],
          avg_time_to_use_seconds: 0,
        };
      }
      throw error;
    }
  },

  // Financial Management
  getFinancialMetrics: async (): Promise<FinancialMetrics> => {
    try {
      return await ApiService.get('/admin/financial/metrics', { suppressLogging: true });
    } catch (error: any) {
      const is404 = error.message?.includes('404') || error.response?.status === 404;
      if (is404) {
        console.debug('[Financial Metrics] Endpoint not available, using fallback data');
        return {
          total_revenue: 0,
          monthly_revenue: 0,
          total_transactions: 0,
          completed_transactions: 0,
          incomplete_transactions: 0,
          total_units_sold: 0,
          total_units_used: 0,
          avg_transaction_value: 0,
          top_users: [],
          users_low_balance: [],
        };
      }
      throw error;
    }
  },

  getBalanceUsageStats: async (): Promise<BalanceUsageStats> => {
    try {
      return await ApiService.get('/admin/balance/usage/stats');
    } catch (error: any) {
      const is404 = error.message?.includes('404') || error.response?.status === 404;
      if (is404) {
        console.debug('[Balance Usage Stats] Endpoint not available, using fallback data');
        return {
          total_credits_allocated: 0,
          total_credits_used: 0,
          average_usage_per_user: 0,
          peak_usage_date: '',
          usage_by_service: [],
        };
      }
      throw error;
    }
  },

  getIncompleteTransactions: async (): Promise<IncompleteTransactionsResponse> => {
    return ApiService.get('/admin/financial/incomplete-transactions');
  },

  getRevenueTrends: async (): Promise<RevenueTrendsResponse> => {
    return ApiService.get('/admin/financial/revenue-trends');
  },

  getTransactionTrends: async (): Promise<TransactionTrendsResponse> => {
    return ApiService.get('/admin/financial/transaction-trends');
  },

  getCumulativeSummary: async (): Promise<CumulativeSummary> => {
    return ApiService.get('/admin/financial/cumulative-summary');
  },

  getCompleteTransactions: async (): Promise<CompleteTransactionsResponse> => {
    return ApiService.get('/admin/financial/complete-transactions');
  },

  approveTransaction: async (transactionId: string, approve: boolean): Promise<ApproveTransactionResponse> => {
    return ApiService.patch(`/admin/financial/transactions/${transactionId}/approve`, { approve });
  },

  getAdminTransactions: async (limit: number = 10000, skip: number = 0): Promise<any> => {
    return ApiService.get(`/transaction/admin/?skip=${skip}&limit=${limit}`);
  },

  // User Management
  getUsers: async ({
    page = 0,
    limit = 5,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<UserApiResponse[]> => {
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      return await ApiService.get<UserApiResponse[]>('/admin/users', { params });
    } catch (error: any) {
      console.error('getUsers - Error:', error);
      throw error;
    }
  },

  getUserTimeseries: async (): Promise<UserTimeseries[]> => {
    return ApiService.get<UserTimeseries[]>('/admin/users/timeseries');
  },

  getUserDetails: async (userId?: string): Promise<AdminUser> => {
    const endpoint = userId ? `/admin/users/${userId}` : '/users/me';
    return ApiService.get(endpoint);
  },

  updateUserStatus: async (userId: string, accountStatus: string): Promise<UserStatus> => {
    return ApiService.patch(`/admin/users/${userId}/status`, { account_status: accountStatus });
  },

  getUserCreditBalance: async (): Promise<UserCreditBalance[]> => {
    return ApiService.get('/user-credit-balance');
  },

  addCredits: async (userId: string, universalCredits: number): Promise<AddCreditsResponse> => {
    return ApiService.patch(`/users/${userId}/credits`, { universal_credits: universalCredits });
  },

  // SMS & Notifications
  sendSMS: async (data: SendSMSRequest): Promise<SendSMSResponse> => {
    return ApiService.post('/messages/send-sms', data);
  },

  sendNotification: async (data: {
    title: string;
    message: string;
    all_users: boolean;
    recipients: string[];
    channel: string;
  }): Promise<NotificationResponse> => {
    return ApiService.post('/admin/messages/notification', data);
  },

  getAdminMessages: async (params: {
    offset: number;
    limit: number;
  }): Promise<AdminMessagesResponse> => {
    const queryString = new URLSearchParams({
      offset: params.offset.toString(),
      limit: params.limit.toString(),
    }).toString();
    return ApiService.get(`/admin/messages?${queryString}`);
  },

  getAdminMessagesMetrics: async (): Promise<AdminMessagesMetrics> => {
    return ApiService.get('/admin/messages/metrics');
  },



  // API Key Management
  getApiKeys: async (): Promise<ApiKeyListResponse> => {
    return ApiService.get('/api-keys/admin/api-keys');
  },

  createApiKey: async (data: CreateApiKeyRequest): Promise<AdminApiKey> => {
    return ApiService.post('/api-keys', data);
  },

  deleteApiKey: async (apiKeyId: string): Promise<string> => {
    return ApiService.delete(`/api-keys/${apiKeyId}`);
  },

  updateApiKeyStatus: async (
    apiKeyId: string,
    status: 'active' | 'inactive' | 'suspended'
  ): Promise<ApiKeyStatusResponse> => {
    return ApiService.patch(`/api-keys/admin/api-keys/${apiKeyId}/status`, { status });
  },

  revokeApiKey: async (apiKeyId: string): Promise<string> => {
    return ApiService.patch(`/api-keys/${apiKeyId}/revoke`, {});
  },

  assignApiKeyToUser: async (apiKeyId: string, userId: string): Promise<string> => {
    return ApiService.patch(`/api-keys/${apiKeyId}/assign`, { user_id: userId });
  },

  getApiKeyMetrics: async (): Promise<ApiKeyMetrics> => {
    return ApiService.get('/api-keys/admin/api-keys/metrics');
  },

  // Package Management
  getPackages: async (limit: number = 100, skip: number = 0): Promise<Package[]> => {
    return ApiService.get(`/api/packages?skip=${skip}&limit=${limit}`);
  },

  createPackage: async (data: CreatePackageRequest): Promise<Package> => {
    return ApiService.post('/api/packages', data);
  },

  getPackage: async (packageId: string): Promise<Package> => {
    return ApiService.get(`/api/packages/${packageId}`);
  },

  updatePackage: async (packageId: string, data: Partial<CreatePackageRequest>): Promise<Package> => {
    return ApiService.put(`/api/packages/${packageId}`, data);
  },

  deletePackage: async (packageId: string): Promise<string> => {
    return ApiService.delete(`/api/packages/${packageId}`);
  },

  // Plan Management
  getPlans: async (): Promise<Plan[]> => {
    return ApiService.get('/plans');
  },

  createPlan: async (data: CreatePlanRequest): Promise<Plan> => {
    return ApiService.post('/plans', {
      ...data,
      unit_price: data.unit_price,
    });
  },

  getPlan: async (planId: string): Promise<Plan> => {
    return ApiService.get(`/plans/${planId}`);
  },

  updatePlan: async (planId: string, data: UpdatePlanRequest): Promise<Plan> => {
    return ApiService.patch(`/plans/${planId}`, {
      ...data,
      unit_price: data.unit_price,
    });
  },

  deletePlan: async (planId: string): Promise<string> => {
    return ApiService.delete(`/plans/${planId}`);
  },

  // Service Management
  createService: async (data: CreateServiceRequest): Promise<Service> => {
    return ApiService.post('/services/create', data);
  },

  getServices: async (limit: number = 100, skip: number = 0): Promise<Service[]> => {
    return ApiService.get(`/services?skip=${skip}&limit=${limit}`);
  },

  getService: async (serviceId: string): Promise<Service> => {
    return ApiService.get(`/services/${serviceId}`);
  },

  updateService: async (serviceId: string, data: Partial<CreateServiceRequest>): Promise<Service> => {
    return ApiService.put(`/services/${serviceId}`, data);
  },

  deleteService: async (serviceId: string): Promise<string> => {
    return ApiService.delete(`/services/${serviceId}`);
  },
};

export type {
  SenderIdRequest,
  AdminSenderId,
  SenderIdListResponse,
  ApprovedSenderIdListResponse,
  SenderIdMetrics,
  UserApiResponse,
  AdminUser,
  AdminWorkspace,
  WorkspaceListResponse,
  WorkspaceMetrics,
  WorkspaceOverview,
  OTPLog,
  OTPMetrics,
  OTPCodesResponse,
  MessageLog,
  AdminLogResponse,
  MessagingStats,
  AdminMessagesResponse,
  AdminMessagesMetrics,
  FinancialMetrics,
  IncompleteTransaction,
  IncompleteTransactionsResponse,
  CompleteTransactionsResponse,
  RevenueTrendData,
  RevenueTrendsResponse,
  TransactionTrendData,
  TransactionTrendsResponse,
  CumulativeSummary,
  UserTimeseries,
  UserStatus,
  BalanceUsageStats,
  SendSMSRequest,
  SendSMSResponse,
  ApproveTransactionResponse,
  NotificationRequest,
  NotificationResponse,
  AddCreditsResponse,
  ApiKey,
  AdminApiKey,
  CreateApiKeyRequest,
  ApiKeyListResponse,
  ApiKeyStatusResponse,
  ApiKeyMetrics,
  Package,
  AdminPackageService,
  CreatePackageRequest,
  Plan,
  CreatePlanRequest,
  UpdatePlanRequest,
  Service,
  CreateServiceRequest,
  ServiceListResponse,
  SenderIdReviewResponse,
  PatchBody,
  GetWorkspacesParams,
  UserCreditBalance,
};
