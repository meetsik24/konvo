import { useState, useEffect } from 'react';
import { getApprovedSenderIds, sendInstantMessage, getMessageLogs, generateMessage } from '../services/api';
import { normalizeResponse } from '../utils/normalizeResponse';

interface SenderId { sender_id: string; name: string; is_approved: boolean; }
interface MessageLog { id?: string; message?: string; status?: string; timestamp?: string; }

export const useSmsData = (workspaceId: string | null) => {
  const [senderIds, setSenderIds] = useState<SenderId[]>([]);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      setError('No workspace selected');
      return;
    }
    setIsLoading(true);
    Promise.all([
      getApprovedSenderIds(workspaceId).catch(() => [{ sender_id: 'default', name: 'Default', is_approved: true }]),
      getMessageLogs().catch(() => []),
    ])
      .then(([senderIds, logs]) => {
        const validSenderIds = normalizeResponse<SenderId>(senderIds).filter((s) => s.is_approved);
        setSenderIds(validSenderIds);
        setLogs(normalizeResponse<MessageLog>(logs));
        setIsLoading(false);
      })
      .catch(() => {
        setSenderIds([{ sender_id: 'default', name: 'Default', is_approved: true }]);
        setError('Failed to load data. Using default sender.');
        setIsLoading(false);
      });
  }, [workspaceId]);

  const sendMessage = async (workspaceId: string, payload: { recipients: string[]; content: string; sender_id: string }) =>
    sendInstantMessage(workspaceId, payload);

  const generateAIMessage = async (prompt: string) => generateMessage(prompt);

  const refreshLogs = async () => {
    const logs = await getMessageLogs();
    setLogs(normalizeResponse<MessageLog>(logs));
  };

  return { senderIds, logs, isLoading, error, sendMessage, generateAIMessage, refreshLogs };
};