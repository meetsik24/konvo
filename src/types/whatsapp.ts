// WhatsApp Business API Types - Aligned with Infobip API

export interface WABAStatus {
  status: 'pending' | 'verified' | 'rejected' | 'not_connected';
  phone_number?: string;
  business_name?: string;
  verification_documents?: string[];
  last_updated: string;
  // API-specific fields
  waba_id?: string;
  display_phone_number?: string;
  quality_rating?: 'GREEN' | 'YELLOW' | 'RED';
  messaging_limit_tier?: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_UNKNOWN';
  webhook_url?: string;
  webhook_events?: string[];
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
  // API-specific fields
  template_id?: string;
  waba_id?: string;
  quality_score?: number;
  rejection_reason?: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  components_count?: number;
  header_type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
  footer_text?: string;
  button_count?: number;
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
  // WhatsApp API specific fields
  message_id?: string;
  template_name?: string;
  template_language?: string;
  template_parameters?: {name: string, value: string}[];
  delivery_time?: 'immediate' | 'scheduled';
  notify_url?: string;
  callback_data?: string;
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
  type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'location' | 'template' | 'interactive' | 'contacts' | 'sticker';
  sender: 'customer' | 'agent' | 'system';
  timestamp: string;
  media_url?: string;
  template_id?: string;
  file?: {
    name: string;
    size: number;
    type: string;
    url?: string;
    caption?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    name?: string;
  };
  metadata?: Record<string, any>;
  // API-specific fields
  message_id?: string;
  waba_id?: string;
  from?: string;
  to?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  error_code?: string;
  error_message?: string;
  context?: {
    message_id?: string;
    from?: string;
  };
  interactive?: {
    type: 'button' | 'list' | 'product' | 'product_list';
    header?: {
      type: 'text' | 'image' | 'video' | 'document';
      text?: string;
      image?: { link: string };
      video?: { link: string };
      document?: { link: string; filename: string };
    };
    body?: { text: string };
    footer?: { text: string };
    action?: {
      buttons?: Array<{ type: 'reply'; reply: { id: string; title: string } }>;
      button?: string;
      sections?: Array<{
        title: string;
        rows: Array<{ id: string; title: string; description?: string }>;
      }>;
    };
  };
  contacts?: Array<{
    name: { first_name: string; last_name?: string; formatted_name: string };
    phones: Array<{ phone: string; type?: string; wa_id?: string }>;
    emails?: Array<{ email: string; type?: string }>;
  }>;
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

// Webhook Events - Aligned with Infobip API
export interface WebhookEvent {
  id: string;
  type: 'message' | 'message_status' | 'message_template_status_update' | 'account_update' | 'phone_number_name_update' | 'account_review_update';
  timestamp: string;
  waba_id: string;
  data: MessageEvent | MessageStatusEvent | TemplateStatusEvent | AccountUpdateEvent;
}

export interface MessageEvent {
  from: string;
  to: string;
  message_id: string;
  timestamp: string;
  type: 'text' | 'image' | 'video' | 'document' | 'audio' | 'location' | 'contacts' | 'interactive' | 'sticker' | 'system';
  context?: {
    message_id: string;
    from: string;
  };
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string; caption?: string };
  video?: { id: string; mime_type: string; sha256: string; caption?: string };
  document?: { id: string; mime_type: string; sha256: string; filename: string; caption?: string };
  audio?: { id: string; mime_type: string; sha256: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  contacts?: Array<{
    name: { first_name: string; last_name?: string; formatted_name: string };
    phones: Array<{ phone: string; type?: string; wa_id?: string }>;
    emails?: Array<{ email: string; type?: string }>;
  }>;
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  sticker?: { id: string; mime_type: string; sha256: string };
  system?: { body: string; type: 'customer_changed_number' | 'customer_identity_changed' | 'customer_identity_deleted' };
}

export interface MessageStatusEvent {
  message_id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    expiration_timestamp?: string;
    origin: { type: 'authentication' | 'marketing' | 'utility' | 'service' | 'referral_conversion' };
  };
  pricing?: {
    billable: boolean;
    pricing_model: 'CBP' | 'NBP';
    category: 'authentication' | 'marketing' | 'utility' | 'service' | 'referral_conversion';
  };
  errors?: Array<{
    code: number;
    title: string;
    message: string;
    error_data?: Record<string, any>;
  }>;
}

export interface TemplateStatusEvent {
  message_template_id: string;
  message_template_name: string;
  message_template_language: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING' | 'DISABLED' | 'PAUSED' | 'PENDING_DELETION' | 'DELETED';
  event: 'APPROVED' | 'REJECTED' | 'PENDING' | 'DISABLED' | 'PAUSED' | 'PENDING_DELETION' | 'DELETED';
  reason?: string;
  reject_reason?: string;
  event_time: string;
}

export interface AccountUpdateEvent {
  phone_number_id: string;
  display_phone_number: string;
  event: 'phone_number_name_update' | 'account_review_update';
  phone_number_name?: string;
  account_review_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  reject_reason?: string;
  event_time: string;
}

// API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    total_count?: number;
    page?: number;
    per_page?: number;
  };
}

export interface MessageSendResponse {
  messages: Array<{
    id: string;
    message_status: 'ACCEPTED' | 'REJECTED';
    to: string;
    whatsapp_api_error?: {
      code: string;
      title: string;
      message: string;
      error_data?: Record<string, any>;
    };
  }>;
  meta: {
    api_version: string;
    api_status: string;
    available_phone_numbers: number;
    phone_number_quality: 'GREEN' | 'YELLOW' | 'RED';
    messaging_limit_tier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_UNKNOWN';
  };
}

export interface TemplateCreateResponse {
  id: string;
  name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  category: 'AUTHENTICATION' | 'MARKETING' | 'UTILITY';
  language: string;
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT';
    text?: string;
    buttons?: Array<{
      type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
      text: string;
      url?: string;
      phone_number?: string;
    }>;
  }>;
  quality_score?: number;
  rejected_reason?: string;
  created_at: string;
  submitted_at: string;
  approved_at?: string;
  rejected_at?: string;
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
