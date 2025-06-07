import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, Users, BarChart2 } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext.tsx';
import {
  getApprovedSenderIds,
  getWorkspaceGroups,
  getMessageLogs,
  getCampaigns,
} from '../services/api.tsx';
import ModeTabs from '../components/ModeTabs.tsx';
import InstantSMS from '../modals/InstantSMS.tsx';
import CreateCampaign from '../modals/CreateCampaign.tsx';
import SendFileSMS from '../modals/SendSMSFile.tsx';

interface Group {
  group_id: string;
  name: string;
  workspace_id?: string;
  created_at?: string;
}

interface Campaign {
  campaign_id: string;
  workspace_id: string;
  name: string;
  description: string;
  launch_date?: string;
  schedule_type?: 'daily' | 'weekly' | 'monthly';
  start_date?: string;
  end_date?: string;
  end_time?: string;
  created_by: string;
  created_at: string;
}

interface MessageLog {
  id?: string;
  message?: string;
  status?: string;
  timestamp?: string;
}

interface SenderId {
  sender_id: string;
  name: string;
  is_approved: boolean;
}

const FALLBACK_SENDER_IDS: SenderId[] = [
  { sender_id: 'default_sender', name: 'Default Sender', is_approved: true },
];

interface UiState {
  isLoading: boolean;
  error: string | null;
  mode: string;
}

const Logs: React.FC<{ logs: MessageLog[] }> = ({ logs }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
  >
    <h2 className="text-xl font-semibold text-[#00333e] mb-4">Sent SMS Logs</h2>
    {logs.length === 0 ? (
      <p className="text-gray-500 text-sm">No SMS logs available.</p>
    ) : (
      <div className="space-y-3">
        {logs.map((log) => (
          <motion.div
            key={log.id || log.timestamp}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <p className="text-sm text-[#00333e]">
              <span className="font-medium">Message:</span> {log.message || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Status:</span> {log.status || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Timestamp:</span>{' '}
              {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
            </p>
          </motion.div>
        ))}
      </div>
    )}
  </motion.div>
);

const Stats: React.FC<{ groups: Group[]; senderIds: SenderId[]; campaigns: Campaign[] }> = ({
  groups,
  senderIds,
  campaigns,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
  >
    {[
      { icon: Users, label: 'Total Groups', value: groups.length },
      { icon: Clock, label: 'Campaigns', value: campaigns.length },
      { icon: BarChart2, label: 'Sender IDs', value: senderIds.length },
    ].map(({ icon: Icon, label, value }, i) => (
      <motion.div
        key={i}
        whileHover={{ scale: 1.03 }}
        className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-[#00333e]" />
          <div>
            <h3 className="text-lg font-semibold text-[#00333e]">{label}</h3>
            <p className="text-gray-600 text-sm">{value} {label.toLowerCase()}</p>
          </div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const SendSMS: React.FC = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [ui, setUi] = useState<UiState>({
    isLoading: false,
    error: null,
    mode: 'instant',
  });
  const [senderIds, setSenderIds] = useState<SenderId[]>([]);
  const [validGroups, setValidGroups] = useState<Group[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (!currentWorkspaceId) {
      console.warn('No workspace ID available, skipping fetchData');
      setUi((prev) => ({ ...prev, error: 'Please select a workspace.', isLoading: false }));
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.warn('No auth token, redirecting to login');
      window.location.href = '/login';
      return;
    }

    const fetchData = async () => {
      setUi((prev) => ({ ...prev, isLoading: true }));
      try {
        console.log('Fetching initial data for workspace:', currentWorkspaceId);
        const [senderIdsRes, groupsRes, logsRes, campaignsRes] = await Promise.all([
          getApprovedSenderIds().catch(() => FALLBACK_SENDER_IDS),
          getWorkspaceGroups(currentWorkspaceId).catch(() => []),
          getMessageLogs().catch(() => []),
          getCampaigns().catch(() => []),
        ]);
        console.log('Data fetched:', {
          senderIds: senderIdsRes,
          groups: groupsRes,
          logs: logsRes,
          campaigns: campaignsRes,
        });
        const workspaceCampaigns = campaignsRes.filter(
          (c: Campaign) => c.workspace_id === currentWorkspaceId
        );
        setSenderIds(senderIdsRes);
        setValidGroups(groupsRes);
        setMessageLogs(logsRes);
        setCampaigns(workspaceCampaigns);
        setUi((prev) => ({
          ...prev,
          isLoading: false,
          error: senderIdsRes === FALLBACK_SENDER_IDS ? 'Using fallback sender IDs' : null,
        }));
      } catch (err: any) {
        console.error('Initial data fetch error:', err);
        if (err.message?.includes('Unauthorized access')) {
          setUi((prev) => ({
            ...prev,
            error: 'You do not have access to this workspace. Please check your permissions.',
            isLoading: false,
          }));
        } else if (err.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        } else {
          setUi((prev) => ({
            ...prev,
            error: 'Failed to load data. Please try again.',
            isLoading: false,
          }));
        }
        setSenderIds(FALLBACK_SENDER_IDS);
      }
    };
    fetchData();
  }, [currentWorkspaceId]);

  const handleSend = () => {
    getMessageLogs()
      .then((logs) => setMessageLogs(logs))
      .catch(() => setMessageLogs([]));
  };

  const handleCampaignChange = async () => {
    try {
      const campaignsData = await getCampaigns();
      const workspaceCampaigns = campaignsData.filter(
        (c: Campaign) => c.workspace_id === currentWorkspaceId
      );
      setCampaigns(workspaceCampaigns);
    } catch (error) {
      console.error('Error refreshing campaigns:', error);
      setUi((prev) => ({ ...prev, error: 'Failed to refresh campaigns.' }));
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Error Notification */}
      {ui.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 p-3 text-center text-sm rounded-md"
        >
          {ui.error}
        </motion.div>
      )}
      {/* Loading State */}
      {ui.isLoading && (
        <motion.div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00333e]"></div>
        </motion.div>
      )}
      {/* Main Content */}
      {!ui.isLoading && (
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <MessageSquare className="w-6 h-6 text-[#00333e]" />
            <h1 className="text-xl sm:text-2xl font-bold text-[#00333e]">Send SMS</h1>
          </motion.div>
          {/* Tabbed Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <ModeTabs
              mode={ui.mode}
              setMode={(mode) => setUi({ ...ui, mode })}
            />
            <div className="mt-6">
              {ui.mode === 'instant' && (
                <InstantSMS
                  senderIds={senderIds}
                  validGroups={validGroups}
                  onSend={handleSend}
                />
              )}
              {ui.mode === 'campaign' && (
                <CreateCampaign
                  senderIds={senderIds}
                  validGroups={validGroups}
                  campaigns={campaigns}
                  onSend={handleSend}
                  onCampaignChange={handleCampaignChange}
                />
              )}
              {ui.mode === 'file' && (
                <SendFileSMS
                  senderIds={senderIds}
                  onSend={handleSend}
                />
              )}
            </div>
          </motion.div>
          {/* Logs Section */}
          <Logs logs={messageLogs} />
          {/* Stats Section */}
          <Stats groups={validGroups} senderIds={senderIds} campaigns={campaigns} />
        </div>
      )}
    </div>
  );
};

export default SendSMS;