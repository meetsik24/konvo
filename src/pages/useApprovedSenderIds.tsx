// useApprovedSenderIds.ts
import { useState, useEffect } from 'react';

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

interface UseApprovedSenderIdsResult {
  senderIds: SenderId[];
  formattedOptions: { value: string; label: string }[];
  isLoading: boolean;
  error: string | null;
  refresh: (newSenderIds: SenderId[] | null) => void;
}

export const useApprovedSenderIds = (initialSenderIds: SenderId[] | null): UseApprovedSenderIdsResult => {
  const [senderIds, setSenderIds] = useState<SenderId[]>([]);
  const [formattedOptions, setFormattedOptions] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const formatSenderIds = () => {
      setIsLoading(true);
      try {
        if (!initialSenderIds) {
          console.warn('No initial sender IDs provided');
          setError('No sender IDs provided.');
          setSenderIds([]);
          setFormattedOptions([]);
          return;
        }

        // Ensure all sender IDs have required fields
        const validatedSenderIds = initialSenderIds.map((item) => ({
          ...item,
          is_approved: item.is_approved || false,
          status: item.status || 'pending',
          sender_id: item.sender_id || item.name || '',
          name: item.name || item.sender_id || '',
        }));
        setSenderIds(validatedSenderIds);

        const options = validatedSenderIds
          .filter((id) => id.status === 'approved')
          .map((sender) => ({
            value: sender.sender_id,
            label: `${sender.name} (${sender.sender_id})`,
          }));
        setFormattedOptions(options);
        setError(null);
      } catch (err) {
        const message = err.message || 'Failed to format sender IDs.';
        console.error('useApprovedSenderIds error:', message);
        setError(message);
        setSenderIds([]);
        setFormattedOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    formatSenderIds();
  }, [initialSenderIds]);

  const refresh = (newSenderIds: SenderId[] | null) => {
    setIsLoading(true);
    try {
      if (!newSenderIds) {
        throw new Error('No new sender IDs provided for refresh.');
      }
      setSenderIds(newSenderIds);
      const options = newSenderIds
        .filter((id) => id.status === 'approved')
        .map((sender) => ({
          value: sender.sender_id,
          label: `${sender.name} (${sender.sender_id})`,
        }));
      setFormattedOptions(options);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to refresh sender IDs.');
    } finally {
      setIsLoading(false);
    }
  };

  return { senderIds, formattedOptions, isLoading, error, refresh };
};