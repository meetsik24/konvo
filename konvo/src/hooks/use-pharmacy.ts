import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import type { PharmacyConversationsParams } from '@/api/types';

export function usePharmacyConversations(params?: PharmacyConversationsParams) {
  return useQuery({
    queryKey: ['pharmacy', 'conversations', params],
    queryFn: () => api.getPharmacyConversations(params),
  });
}

export function useConversationMessages(conversationId: string | null, params?: { limit?: number; cursor?: string | null }) {
  return useQuery({
    queryKey: ['pharmacy', 'conversation-messages', conversationId, params],
    queryFn: () => api.getConversationMessages(conversationId!, params),
    enabled: !!conversationId,
  });
}
