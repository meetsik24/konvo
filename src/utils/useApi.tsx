import { useState, useCallback } from 'react';
import {
  getApprovedSenderIds,
  getWorkspaceGroups,
  getMessageLogs,
  listCampaigns,
} from '../services/api.tsx';

type DataType = 'senderIds' | 'groups' | 'logs' | 'campaigns';

interface ApiState<T> {
  data: T | null;
  error: string | null;
  fetch: (workspaceId?: string) => Promise<void>;
}

const useApi = <T,>(type: DataType): ApiState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (workspaceId?: string) => {
    try {
      let result: any;
      switch (type) {
        case 'senderIds':
          if (!workspaceId) throw new Error('Workspace ID required');
          result = await getApprovedSenderIds(workspaceId);
          break;
        case 'groups':
          if (!workspaceId) throw new Error('Workspace ID required');
          result = await getWorkspaceGroups(workspaceId);
          break;
        case 'logs':
          result = await getMessageLogs();
          break;
        case 'campaigns':
          if (!workspaceId) throw new Error('Workspace ID required');
          result = await listCampaigns();
          break;
      }
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || `Failed to fetch ${type}.`);
      console.error(`${type} fetch error:`, err);
    }
  }, [type]);

  return { data, error, fetch };
};

export { useApi };