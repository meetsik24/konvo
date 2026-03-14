import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: () => api.getChats(),
  });
}

export function useChatHistory(phoneNumber: string | null) {
  return useQuery({
    queryKey: ['chat-history', phoneNumber],
    queryFn: () => api.getChatHistory(phoneNumber!),
    enabled: !!phoneNumber,
  });
}
