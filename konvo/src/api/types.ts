/** Types from WhatsApp Lead Gen Bot OpenAPI */

export interface ChatSummary {
  phone_number: string;
  name: string | null;
  last_message: Record<string, unknown>;
  unread_count: number;
  lead_score: number;
  last_message_at: string;
}

export interface PriorityLeadBase {
  lead_score: number;
  proposed_actions: string[];
  insights?: Record<string, unknown>;
}

export interface PriorityLead extends PriorityLeadBase {
  phone_number: string;
  name: string | null;
  last_message_at: string;
}

export interface MessageSchema {
  message: Record<string, unknown>;
  response: Record<string, unknown>;
  status?: 'sent' | 'delivered' | 'pending' | 'failed' | 'read';
  created_at: string;
  updated_at: string;
}

export interface ChatMessagesSchema {
  lead_details: PriorityLeadBase | null;
  messages: MessageSchema[];
}

export type ConversationStatus =
  | 'ACTIVE'
  | 'CLOSED'
  | 'ARCHIVED'
  | 'HANDOFF_PENDING'
  | 'AGENT_ACTIVE';
export type Channel = 'whatsapp' | 'web' | 'sms';

export interface SarufiConversationRecord {
  id: string;
  chatbot_id: string;
  user_phone: string;
  contact_name: string | null;
  channel: Channel;
  status: ConversationStatus;
  last_message_id: string | null;
  last_message_at: string;
  last_message_preview: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string | null;
}

export interface SarufiConversationsResponse {
  count: number;
  conversations: SarufiConversationRecord[];
  next_cursor?: string | null;
}

export interface SarufiMessageRecord {
  id: string;
  conversation_id: string;
  message: Record<string, unknown> | null;
  response: Record<string, unknown> | null;
  message_type: string;
  responder: 'BOT' | 'HUMAN';
  received_at: string;
  responded_at: string | null;
  status: string;
  created_at: string;
}

export interface SarufiConversationMessagesResponse {
  count: number;
  messages: SarufiMessageRecord[];
  next_cursor?: string | null;
}

export interface PharmacyConversationsParams {
  status?: ConversationStatus | null;
  channel?: Channel | null;
  start_time?: string | null;
  end_time?: string | null;
  limit?: number;
  cursor?: string | null;
}

export interface ConversationMessagesParams {
  limit?: number;
  cursor?: string | null;
}

// Pharmacy feedback (OpenAPI: Feedback, FeedbackCreate, FeedbackAnalyticsResponse)
export interface Feedback {
  id?: number | null;
  phone_number: string;
  data: Record<string, unknown>;
  created_at?: string;
}

export interface FeedbackCreate {
  phone_number: string;
  data: Record<string, unknown>;
}

export interface FeedbackCategoryStat {
  value: string;
  count: number;
  percentage: number;
}

export interface FeedbackAnalyticsResponse {
  field: string;
  total_count: number;
  categories: FeedbackCategoryStat[];
}

export interface GetFeedbacksParams {
  phone_number?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface GetFeedbackAnalyticsParams {
  field?: string;
  phone_number?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}
