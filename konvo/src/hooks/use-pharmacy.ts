import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api';
import type {
  PharmacyConversationsParams,
  GetFeedbacksParams,
  GetFeedbackAnalyticsParams,
  FeedbackCreate,
} from '@/api/types';

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

export function useFeedbacks(params?: GetFeedbacksParams) {
  return useQuery({
    queryKey: ['pharmacy', 'feedbacks', params],
    queryFn: () => api.getFeedbacks(params),
  });
}

export function useFeedbackAnalytics(params?: GetFeedbackAnalyticsParams) {
  return useQuery({
    queryKey: ['pharmacy', 'feedbacks', 'analytics', params],
    queryFn: () => api.getFeedbackAnalytics(params),
  });
}

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: FeedbackCreate) => api.createFeedback(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacy', 'feedbacks'] });
    },
  });
}
