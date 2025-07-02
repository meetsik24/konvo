import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, CheckCircle, Users, X, Clock, Trash2, Edit, MessageSquare } from 'lucide-react';
import { useWorkspace } from '../pages/WorkspaceContext.tsx';
import {
  sendInstantMessage,
  generateMessage,
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  assignGroupToCampaign,
  getCampaignGroups,
} from '../services/api.tsx';

import CampaignModal from '../pages/CampaignModal.tsx';

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

interface Group {
  group_id: string;
  name: string;
  workspace_id?: string;
  created_at?: string;
}

interface SenderId {
  sender_id: string;
  name: string;
  is_approved: boolean;
}

interface FormState {
  senderId: string;
  message: string;
  campaignId: string;
  schedule: string;
  groups: string[];
  keywords: string;
  campaignName: string;
  campaignDescription: string;
  campaignScheduleType: 'daily' | 'weekly' | 'monthly';
  campaignStartDate: string;
  campaignEndDate: string;
  campaignEndTime: string;
}

interface UiState {
  isSending: boolean;
  isCreatingCampaign: boolean;
  error: string | null;
  success: string | null;
  modals: { ai: boolean; campaign: boolean; group: boolean };
  editingCampaign: Campaign | null;
  selectedGroupId: string;
}

interface Props {
  senderIds: SenderId[];
  validGroups: Group[];
  campaigns: Campaign[];
  onSend: () => void;
  onCampaignChange: () => void;
}

const CreateCampaign: React.FC<Props> = ({ senderIds, validGroups, campaigns, onSend, onCampaignChange }) => {
  const { currentWorkspaceId } = useWorkspace();
  const [form, setForm] = useState<FormState>({
    senderId: senderIds[0]?.sender_id || '',
    message: '',
    campaignId: '',
    schedule: '',
    groups: [],
    keywords: '',
    campaignName: '',
    campaignDescription: '',
    campaignScheduleType: 'daily',
    campaignStartDate: '',
    campaignEndDate: '',
    campaignEndTime: '',
  });
  const [ui, setUi] = useState<UiState>({
    isSending: false,
    isCreatingCampaign: false,
    error: null,
    success: null,
    modals: { ai: false, campaign: false, group: false },
    editingCampaign: null,
    selectedGroupId: '',
  });
  const [campaignGroups, setCampaignGroups] = useState<{ [key: string]: Group[] }>({});

  useEffect(() => {
    const fetchCampaignGroups = async () => {
      const groupsData: { [key: string]: Group[] } = {};
      for (const campaign of campaigns) {
        try {
          const groups = await getCampaignGroups(campaign.campaign_id);
          groupsData[campaign.campaign_id] = groups.filter((g: Group) =>
            validGroups.some((vg) => vg.group_id === g.group_id)
          );
        } catch (error) {
          console.error(`Error fetching groups for campaign ${campaign.campaign_id}:`, error);
        }
      }
      setCampaignGroups(groupsData);
    };
    if (campaigns.length > 0) fetchCampaignGroups();
  }, [campaigns, validGroups]);

  const handleCreateOrUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspaceId) {
      setUi((prev) => ({ ...prev, error: 'No workspace selected.' }));
      return;
    }
    setUi((prev) => ({ ...prev, isCreatingCampaign: true, error: null }));
    try {
      const campaignPayload = {
        name: form.campaignName,
        description: form.campaignDescription,
        schedule_type: form.campaignScheduleType,
        start_date: form.campaignStartDate || undefined,
        end_date: form.campaignEndDate || undefined,
        end_time: form.campaignEndTime || undefined,
        workspace_id: currentWorkspaceId,
      };
      if (ui.editingCampaign) {
        const updatePayload = {
          ...campaignPayload,
          launch_date: ui.editingCampaign.launch_date || undefined,
        };
        await updateCampaign(ui.editingCampaign.campaign_id, updatePayload);
        onCampaignChange();
        setUi((prev) => ({ ...prev, success: 'Campaign updated successfully!', editingCampaign: null }));
      } else {
        const createdCampaign = await createCampaign(campaignPayload);
        if (ui.selectedGroupId) {
          await assignGroupToCampaign(ui.selectedGroupId, createdCampaign.campaign_id);
          setCampaignGroups({
            ...campaignGroups,
            [createdCampaign.campaign_id]: validGroups.filter((g) => g.group_id === ui.selectedGroupId),
          });
        }
        onCampaignChange();
        setUi((prev) => ({ ...prev, success: 'Campaign created successfully!' }));
        setForm((prev) => ({
          ...prev,
          campaignName: '',
          campaignDescription: '',
          campaignScheduleType: 'daily',
          campaignStartDate: '',
          campaignEndDate: '',
          campaignEndTime: '',
        }));
        setUi((prev) => ({ ...prev, selectedGroupId: '' }));
      }
      setTimeout(() => setUi((prev) => ({ ...prev, success: null })), 3000);
    } catch (error) {
      console.error('Error creating/updating campaign:', error);
      setUi((prev) => ({ ...prev, error: 'Failed to create/update campaign.', isCreatingCampaign: false }));
    } finally {
      setUi((prev) => ({ ...prev, isCreatingCampaign: false }));
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!currentWorkspaceId) {
      setUi((prev) => ({ ...prev, error: 'No workspace selected.' }));
      return;
    }
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id);
        onCampaignChange();
        setCampaignGroups((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        setUi((prev) => ({ ...prev, success: 'Campaign deleted successfully!' }));
        setTimeout(() => setUi((prev) => ({ ...prev, success: null })), 3000);
      } catch (error) {
        console.error('Error deleting campaign:', error);
        setUi((prev) => ({ ...prev, error: 'Failed to delete campaign.' }));
      }
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setUi((prev) => ({ ...prev, editingCampaign: campaign }));
    setForm((prev) => ({
      ...prev,
      campaignName: campaign.name,
      campaignDescription: campaign.description,
      campaignScheduleType: campaign.schedule_type || 'daily',
      campaignStartDate: campaign.start_date || '',
      campaignEndDate: campaign.end_date || '',
      campaignEndTime: campaign.end_time || '',
    }));
  };

  const handleAssignGroup = async (campaignId: string, groupId: string) => {
    try {
      await assignGroupToCampaign(groupId, campaignId);
      const updatedGroups = await getCampaignGroups(campaignId);
      setCampaignGroups({ ...campaignGroups, [campaignId]: updatedGroups });
      setUi((prev) => ({ ...prev, modals: { ...prev.modals, group: false }, success: 'Group assigned successfully!' }));
      setTimeout(() => setUi((prev) => ({ ...prev, success: null })), 3000);
    } catch (error) {
      console.error('Error assigning group:', error);
      setUi((prev) => ({ ...prev, error: 'Failed to assign group.' }));
    }
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspaceId) {
      setUi((prev) => ({ ...prev, error: 'No workspace selected.' }));
      return;
    }
    if (!form.senderId) {
      setUi((prev) => ({ ...prev, error: 'Please select a sender ID.' }));
      return;
    }
    if (!form.campaignId) {
      setUi((prev) => ({ ...prev, error: 'Please select a campaign.' }));
      return;
    }
    if (!form.message.trim()) {
      setUi((prev) => ({ ...prev, error: 'Please enter a message.' }));
      return;
    }
    setUi((prev) => ({ ...prev, isSending: true, error: null }));
    try {
      const contactCache = new Map<string, Contact[]>();
      const recipients = await getRecipients(currentWorkspaceId, form.groups, contactCache);
      if (!recipients.length) {
        throw new Error('No valid recipients found.');
      }
      await sendInstantMessage(currentWorkspaceId, {
        recipients,
        content: form.message,
        sender_id: form.senderId,
      });
      setForm((prev) => ({
        ...prev,
        senderId: senderIds[0]?.sender_id || '',
        message: '',
        campaignId: '',
        schedule: '',
        groups: [],
        keywords: '',
      }));
      setUi((prev) => ({ ...prev, success: 'Campaign SMS sent successfully!', isSending: false }));
      setTimeout(() => setUi((prev) => ({ ...prev, success: null })), 3000);
      onSend();
    } catch (err: any) {
      console.error('Send campaign SMS error:', err);
      setUi((prev) => ({ ...prev, error: err.message || 'Failed to send SMS.', isSending: false }));
    }
  };

  const handleGenerateAI = async () => {
    if (!form.keywords.trim()) {
      setUi((prev) => ({ ...prev, error: 'Please enter a prompt.' }));
      return;
    }
    setUi((prev) => ({ ...prev, isSending: true }));
    try {
      const message = await generateMessage(`Generate SMS: ${form.keywords}`);
      setForm((prev) => ({ ...prev, message }));
      setUi((prev) => ({ ...prev, modals: { ...prev.modals, ai: false }, isSending: false }));
    } catch (err: any) {
      console.error('AI generation error:', err);
      setUi((prev) => ({ ...prev, error: err.message || 'Failed to generate message.', isSending: false }));
    }
  };

  const getCampaignStatus = (campaign: Campaign): string => {
    const now = new Date();
    const start = campaign.start_date ? new Date(campaign.start_date) : null;
    const end = campaign.end_date ? new Date(campaign.end_date) : null;
    if (start && start > now) return 'Scheduled';
    if (start && end && start <= now && now <= end) return 'Started';
    if (end && end < now) return 'Completed';
    return 'Draft';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-6">
      {/* Notifications */}
      {ui.success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-100 border border-gray-200 p-3 text-[#00333e] text-sm text-center rounded-md"
        >
          <CheckCircle className="w-4 h-4 inline mr-2" />
          {ui.success}
        </motion.div>
      )}
      {ui.error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 p-3 text-sm text-center rounded-md"
        >
          {ui.error}
        </motion.div>
      )}

      {/* Campaign Creation Form */}
      <div className="border-b border-gray-200 pb-2">
        <h3 className="text-lg font-semibold text-[#00333e] mb-4">
          {ui.editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
        </h3>
        <form onSubmit={handleCreateOrUpdateCampaign} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#00333e] mb-1">Campaign Name</label>
            <input
              type="text"
              className="w-full text-sm text-sm py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#fddf0d]"
              placeholder="e.g., Spring Promotion"
              value={form.campaignName}
              onChange={(e) => setForm({ ...form, campaignName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#00333e] mb-1">Description</label>
            <textarea
              className="w-full text-sm min-h-[80px] py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#fddf0d]"
              placeholder="Campaign description..."
              value={form.campaignDescription}
              onChange={(e) => setForm({ ...form, campaignDescription: e.target.value })}
              required
            />
            <div className="mt-1 flex justify-between text-sm text-gray-500">
              <span>{form.campaignDescription.length} characters</span>
              <span>{Math.ceil(form.campaignDescription.length / 160)} message(s)</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#00333e] mb-1">Schedule Type</label>
            <select
              className="w-full text-sm py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#fddf0d]"
              value={form.campaignScheduleType}
              onChange={(e) => setForm({ ...form, campaignScheduleType: e.target.value as 'daily' | 'weekly' | 'monthly' })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#00333e] mb-1">Start Date</label>
            <input
              type="date"
              className="w-full text-sm py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#fddf0d]"
              value={form.campaignStartDate}
              onChange={(e) => setForm({ ...form, campaignStartDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#00333e] mb-1">End Date</label>
            <input
              type="date"
              className="w-full text-sm py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#fddf0d]"
              value={form.campaignEndDate}
              onChange={(e) => setForm({ ...form, campaignEndDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#00333e] mb-1">End Time</label>
            <input
              type="time"
              className="w-full text-sm py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#fddf0d]"
              value={form.campaignEndTime}
              onChange={(e) => setForm({ ...form, campaignEndTime: e.target.value })}
              required
            />
          </div>
          {!ui.editingCampaign && (
            <div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setUi({ ...ui, modals: { ...ui.modals, group: true } })}
                className="text-sm text-[#00333e] bg-gray-100 px-3 py-1 rounded-md hover:bg-[#fddf0d]"
              >
                Assign Group (Optional)
              </motion.button>
              {ui.selectedGroupId && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected: {validGroups.find((g) => g.group_id === ui.selectedGroupId)?.name}
                </p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            {ui.editingCampaign && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  setUi((prev) => ({ ...prev, editingCampaign: null }));
                  setForm((prev) => ({
                    ...prev,
                    campaignName: '',
                    campaignDescription: '',
                    campaignScheduleType: 'daily',
                    campaignStartDate: '',
                    campaignEndDate: '',
                    campaignEndTime: '',
                  }));
                }}
                className="px-3 py-1 text-sm text-[#00333e] bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={ui.isCreatingCampaign}
              className="flex items-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white rounded-md hover:bg-[#002a36] disabled:bg-[#00333e]/50"
            >
              <Send className="w-5 h-5" />
              {ui.isCreatingCampaign ? 'Processing...' : ui.editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </motion.button>
          </div>
        </form>
      </div>

      {/* SMS Composition Form */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-[#00333e] mb-4">Send Campaign SMS</h3>
        <form onSubmit={handleSendSMS} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#00333e] mb-1">Sender ID</label>
            <select
              className="w-full text-sm py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#fddf0d]"
              value={form.senderId}
              onChange={(e) => setForm({ ...form, senderId: e.target.value })}
              required
            >
              <option value="" disabled>Select Sender ID</option>
              {senderIds.map((sender) => (
                <option key={sender.sender_id} value={sender.sender_id}>
                  {sender.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setUi({ ...ui, modals: { ...ui.modals, campaign: true } })}
              className="flex items-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white rounded-md hover:bg-[#002a36]"
            >
              <Users className="w-5 h-5" />
              Select Campaign
            </motion.button>
            {form.campaignId && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {campaigns.find((c) => c.campaign_id === form.campaignId)?.name}{' '}
                {form.schedule && `(Scheduled: ${new Date(form.schedule).toLocaleString()})`}
              </p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-[#00333e]">Message</label>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setUi({ ...ui, modals: { ...ui.modals, ai: true } })}
                className="text-sm text-[#00333e] bg-gray-100 px-3 py-1 rounded-md hover:bg-[#fddf0d] flex items-center gap-1"
              >
                <Bot className="w-4 h-4" />
                Generate with AI
              </motion.button>
            </div>
            <textarea
              className="w-full text-sm min-h-[100px] py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#fddf0d]"
              placeholder="Type your message..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
            <div className="mt-1 flex justify-between text-sm text-gray-500">
              <span>{form.message.length} characters</span>
              <span>{Math.ceil(form.message.length / 160)} message(s)</span>
            </div>
          </div>
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={ui.isSending || !form.senderId || !form.campaignId}
              className="flex items-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white rounded-md hover:bg-[#002a36] disabled:bg-[#00333e]/50"
            >
              <Send className="w-5 h-5" />
              {ui.isSending ? 'Sending...' : 'Send Campaign SMS'}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Campaign List */}
      <div>
        <h3 className="text-lg font-semibold text-[#00333e] mb-4">Campaigns</h3>
        {campaigns.length === 0 ? (
          <p className="text-gray-500 text-sm">No campaigns created yet.</p>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <motion.div
                key={campaign.campaign_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-gray-200 rounded-md bg-gray-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-sm text-[#00333e]">{campaign.name}</h4>
                    <p className="text-sm text-gray-600">
                      {campaign.description.length > 30
                        ? `${campaign.description.substring(0, 30)}...`
                        : campaign.description}
                    </p>
                    {campaign.launch_date && (
                      <p className="text-sm text-gray-600">
                        Launch: {new Date(campaign.launch_date).toLocaleString()}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Status: {getCampaignStatus(campaign)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Schedule: {campaign.schedule_type?.charAt(0).toUpperCase() + campaign.schedule_type?.slice(1) || 'N/A'}
                    </p>
                    {campaign.start_date && (
                      <p className="text-sm text-gray-600">
                        Start: {new Date(campaign.start_date).toLocaleDateString()}
                      </p>
                    )}
                    {(campaign.end_date || campaign.end_time) && (
                      <p className="text-sm text-gray-600">
                        End: {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : ''}{' '}
                        {campaign.end_time || ''}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {campaignGroups[campaign.campaign_id]?.map((group) => (
                        <span
                          key={group.group_id}
                          className="bg-[#fddf0d] text-[#00333e] px-2 py-0.5 rounded text-xs"
                        >
                          {group.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setUi((prev) => ({ ...prev, modals: { ...prev.modals, group: true }, editingCampaign: campaign }));
                      }}
                      className="text-[#00333e] hover:text-[#fddf0d]"
                    >
                      <Users className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEditCampaign(campaign)}
                      className="text-[#00333e] hover:text-[#fddf0d]"
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteCampaign(campaign.campaign_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          campaignId: campaign.campaign_id,
                          groups: campaignGroups[campaign.campaign_id]?.map((g) => g.group_id) || [],
                          schedule: campaign.start_date || '',
                        }));
                      }}
                      className="text-[#00333e] hover:text-[#fddf0d]"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {ui.modals.ai && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-lg p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#00333e]">Generate AI Message</h3>
              <button
                onClick={() => setUi((prev) => ({ ...prev, modals: { ...prev.modals, ai: false } }))}
                className="text-gray-500 hover:text-[#00333e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#00333e] mb-1">Prompt</label>
              <input
                type="text"
                className="w-full text-sm py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#fddf0d]"
                placeholder="Write a prompt to generate SMS"
                value={form.keywords}
                onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUi((prev) => ({ ...prev, modals: { ...prev.modals, ai: false } }))}
                className="px-3 py-1 text-sm text-[#00333e] bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateAI}
                className="px-3 py-1 text-sm bg-[#00333e] text-white rounded-md hover:bg-[#002a36]"
                disabled={ui.isSending}
              >
                {ui.isSending ? 'Generating...' : 'Generate'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {ui.modals.campaign && (
        <CampaignModal
          isOpen={ui.modals.campaign}
          onClose={() => setUi((prev) => ({ ...prev, modals: { ...prev.modals, campaign: false } }))}
          onSelect={(campaignId, schedule, groups) => {
            setForm((prev) => ({ ...prev, campaignId, schedule, groups }));
            setUi((prev) => ({ ...prev, modals: { ...prev.modals, campaign: false } }));
          }}
          validGroups={validGroups}
        />
      )}
      {ui.modals.group && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-sm p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#00333e]"></h3>
              <button
                onClick={() => setUi((prev) => ({ ...prev, modals: { ...prev.modals, group: false } }))}
                className="text-gray-500 hover:text-[#00333e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4 max-h-48 overflow-y-auto">
              {validGroups.length > 0 ? (
                validGroups.map((group) => (
                  <div
                    key={group.group_id}
                    className="flex items-center gap-2 py-2 cursor-pointer"
                    onClick={() => {
                      if (ui.editingCampaign) {
                        handleAssignGroup(ui.editingCampaign.campaign_id, group.group_id);
                      } else {
                        setUi((prev) => ({ ...prev, selectedGroupId: group.group_id, modals: { ...prev.modals, group: false } }));
                      }
                    }}
                  >
                    <span className="text-sm text-gray-700">{group.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No groups available.</p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUi((prev) => ({ ...prev, modals: { ...prev.modals, group: false } }))}
                className="px-3 py-1 text-sm font-medium text-[#00333e] bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CreateCampaign;