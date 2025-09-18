export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
}

export interface DashboardStats {
  totalMessages: number;
  successRate: number;
  apiCalls: number;
  activeUsers: number;
}

// Developer App types
export interface DeveloperApp {
  app_id: string;
  app_name: string;
  app_description: string;
  app_key: string;
  user_id: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDeveloperAppRequest {
  app_name: string;
  app_description: string;
  workspace_id?: string;
}

export interface UpdateDeveloperAppRequest {
  app_name?: string;
  app_description?: string;
  workspace_id?: string;
}

export interface ApiError {
  detail: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}