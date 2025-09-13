// WhatsApp Business API Types

export interface WABAStatus {
  status: 'pending' | 'verified' | 'rejected' | 'not_connected';
  phone_number?: string;
  business_name?: string;
  verification_documents?: string[];
  last_updated: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'transactional' | 'marketing' | 'otp' | 'notification';
  status: 'pending' | 'approved' | 'rejected';
  content: string;
  variables: string[];
  created_at: string;
  language?: string;
  components?: TemplateComponent[];
}

export interface TemplateComponent {
  type: 'header' | 'body' | 'footer' | 'buttons';
  text?: string;
  buttons?: TemplateButton[];
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
}

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
}

export interface WhatsAppCampaign {
  id: string;
  name: string;
  template_id: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  audience_count: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  response_rate: number;
  created_at: string;
  scheduled_at?: string;
  target_audience?: CampaignAudience;
}

export interface CampaignAudience {
  type: 'all' | 'groups' | 'tags' | 'custom';
  group_ids?: string[];
  tags?: string[];
  phone_numbers?: string[];
  filters?: AudienceFilter[];
}

export interface AudienceFilter {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with';
  value: string;
}

export interface ChatConversation {
  id: string;
  customer_name: string;
  customer_phone: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: 'active' | 'closed' | 'pending';
  assigned_agent?: string;
  tags: string[];
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'location' | 'template';
  sender: 'customer' | 'agent' | 'system';
  timestamp: string;
  media_url?: string;
  template_id?: string;
  file?: {
    name: string;
    size: number;
    type: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  metadata?: Record<string, any>;
}

export interface AutomationFlow {
  id: string;
  name: string;
  trigger: 'welcome' | 'keyword' | 'time_based' | 'event' | 'webhook';
  status: 'active' | 'inactive';
  steps: FlowStep[];
  created_at: string;
  updated_at?: string;
  conditions?: FlowCondition[];
}

export interface FlowStep {
  id: string;
  type: 'message' | 'quick_reply' | 'condition' | 'delay' | 'webhook' | 'assign_agent';
  content?: string;
  options?: string[];
  conditions?: FlowCondition[];
  delay_seconds?: number;
  webhook_url?: string;
  agent_id?: string;
  next_step_id?: string;
}

export interface FlowCondition {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface WhatsAppAgent {
  id: string;
  name: string;
  email: string;
  status: 'online' | 'offline' | 'busy';
  assigned_conversations: string[];
  max_conversations: number;
  created_at: string;
}

export interface WhatsAppWebhook {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  secret?: string;
  created_at: string;
}

export interface WhatsAppAnalytics {
  period: 'day' | 'week' | 'month';
  conversations: {
    total: number;
    active: number;
    closed: number;
    pending: number;
  };
  messages: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  response_time: {
    average: number;
    median: number;
    p95: number;
  };
  satisfaction: {
    rating: number;
    reviews: number;
  };
}

export interface WhatsAppSettings {
  business_name: string;
  business_category: string;
  business_description: string;
  business_address: string;
  business_website?: string;
  business_email: string;
  business_phone: string;
  timezone: string;
  language: string;
  auto_reply_enabled: boolean;
  auto_reply_message?: string;
  business_hours: BusinessHours;
}

export interface BusinessHours {
  monday: { open: string; close: string; enabled: boolean };
  tuesday: { open: string; close: string; enabled: boolean };
  wednesday: { open: string; close: string; enabled: boolean };
  thursday: { open: string; close: string; enabled: boolean };
  friday: { open: string; close: string; enabled: boolean };
  saturday: { open: string; close: string; enabled: boolean };
  sunday: { open: string; close: string; enabled: boolean };
}
