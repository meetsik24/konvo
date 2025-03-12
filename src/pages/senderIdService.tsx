// senderIdService.ts
import {
    getApprovedSenderIds,
    getUserSenderRequests,
    getAdminSenderRequests,
  } from '../services/api';
  
  interface SenderId {
    sender_id: string;
    user_id: string;
    is_approved: boolean;
    approved_at?: string;
    name: string;
    created_at?: string;
    request_id?: string;
    status?: 'pending' | 'approved' | 'rejected';
    requested_at?: string;
    reviewed_at?: string;
  }
  
  export const fetchSenderIds = async (currentWorkspaceId: string, isAdmin: boolean, isAdminView: boolean, userId?: string): Promise<SenderId[]> => {
    try {
      console.log('Fetching sender IDs from senderIdService...', { currentWorkspaceId, isAdmin, isAdminView });
  
      // Fetch approved sender IDs
      const approvedResponse = await getApprovedSenderIds(currentWorkspaceId);
      const formattedApproved: SenderId[] = Array.isArray(approvedResponse)
        ? approvedResponse.map((item: SenderId) => ({
            ...item,
            is_approved: true,
            status: 'approved',
          }))
        : [];
  
      // Fetch pending requests based on role and view
      const requestsResponse = isAdmin && isAdminView
        ? await getAdminSenderRequests(currentWorkspaceId)
        : await getUserSenderRequests(currentWorkspaceId);
      const formattedRequests: SenderId[] = Array.isArray(requestsResponse)
        ? requestsResponse.map((req: SenderId) => ({
            request_id: req.request_id || '',
            user_id: req.user_id || '',
            sender_id: req.sender_id || req.name || '',
            name: req.name || req.sender_id || '',
            status: req.status || 'pending',
            requested_at: req.requested_at,
            reviewed_at: req.reviewed_at,
            is_approved: req.status === 'approved',
            approved_at: req.reviewed_at && req.status === 'approved' ? req.reviewed_at : undefined,
            created_at: req.created_at || req.requested_at,
          }))
        : [];
  
      // Combine and filter based on view
      let allSenderIds = [...formattedApproved, ...formattedRequests];
      if (isAdmin && isAdminView) {
        allSenderIds = allSenderIds.filter((id) => id.status === 'pending');
      } else {
        allSenderIds = allSenderIds.filter((id) => id.user_id === userId || id.status === 'approved');
      }
  
      console.log('Fetched sender IDs:', allSenderIds);
      return allSenderIds;
    } catch (error: any) {
      console.error('fetchSenderIds error:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Unable to fetch sender IDs from the server.');
    }
  };