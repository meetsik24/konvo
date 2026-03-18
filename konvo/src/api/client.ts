const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, string | number | undefined | null> }
): Promise<T> {
  const { params, ...init } = options ?? {};
  const url = new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const res = await fetch(url.toString(), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Dashboard endpoints
  getChats: () => request<import('./types').ChatSummary[]>(`${API_BASE}/chats`),
  getPriorityLeads: () => request<import('./types').PriorityLead[]>(`${API_BASE}/priority-leads`),
  getChatHistory: (phoneNumber: string) =>
    request<import('./types').ChatMessagesSchema>(
      `${API_BASE}/chats/${encodeURIComponent(phoneNumber)}`
    ),

  // Pharmacy endpoints
  getPharmacyConversations: (params?: import('./types').PharmacyConversationsParams) =>
    request<import('./types').SarufiConversationsResponse>(`${API_BASE}/pharmacy/conversations`, {
      params: params as Record<string, string | number | undefined | null>,
    }),
  getConversationMessages: (
    conversationId: string,
    params?: import('./types').ConversationMessagesParams
  ) =>
    request<import('./types').SarufiConversationMessagesResponse>(
      `${API_BASE}/pharmacy/conversations/${encodeURIComponent(conversationId)}/messages`,
      { params: params as Record<string, string | number | undefined | null> }
    ),

  // Pharmacy feedback & analytics
  getFeedbacks: (params?: import('./types').GetFeedbacksParams) =>
    request<import('./types').Feedback[]>(`${API_BASE}/pharmacy/feedbacks`, {
      params: params as Record<string, string | number | undefined | null>,
    }),
  createFeedback: (body: import('./types').FeedbackCreate) =>
    request<import('./types').Feedback>(`${API_BASE}/pharmacy/feedbacks`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  getFeedbackAnalytics: (params?: import('./types').GetFeedbackAnalyticsParams) =>
    request<import('./types').FeedbackAnalyticsResponse>(
      `${API_BASE}/pharmacy/feedbacks/analytics`,
      { params: params as Record<string, string | number | undefined | null> }
    ),

  // Health
  getStatus: () => request<Record<string, unknown>>(API_BASE),
};
