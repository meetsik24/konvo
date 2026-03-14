import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';

export function usePriorityLeads() {
  return useQuery({
    queryKey: ['priority-leads'],
    queryFn: () => api.getPriorityLeads(),
  });
}
