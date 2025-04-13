import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Clock, Trash2, Edit, Users, X } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getWorkspaceGroups,
  getCampaignGroups,
  assignGroupToCampaign,
} from '../services/api';

interface Campaign {
  campaign_id: string;
  workspace_id: string;
  name: string;
  description: string;
  launch_date: string;
  created_by: string;
  created_at: string;
}

interface Group {
  group_id: string;
  name: string;
  workspace_id: string;
  created_at: string;
}

const SMSCampaigns: React.FC = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    launch_date: '', // Added launch_date to state
  });
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [campaignGroups, setCampaignGroups] = useState<{ [key: string]: Group[] }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!currentWorkspaceId) return;
      try {
        const campaignData = await getCampaigns();
        const workspaceCampaigns = campaignData.filter(
          (c: Campaign) => c.workspace_id === currentWorkspaceId
        );
        setCampaigns(workspaceCampaigns);

        const groupData = await retryRequest(() => getWorkspaceGroups(currentWorkspaceId));
        setGroups(groupData);

        const campaignGroupsData: { [key: string]: Group[] } = {};
        for (const campaign of workspaceCampaigns) {
          const groups = await getCampaignGroups(campaign.campaign_id);
          campaignGroupsData[campaign.campaign_id] = groups;
        }
        setCampaignGroups(campaignGroupsData);

        setError(null);
      } catch (error) {
        console.error('Failed to fetch campaigns or groups:', error);
        setError('Unable to fetch campaigns or groups.');
        setCampaigns([]);
      }
    };
    fetchData();
  }, [currentWorkspaceId]);

  const retryRequest = async (
    requestFn: () => Promise<any>,
    retries = 3,
    delay = 1000
  ): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  };

  const handleCreateOrUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspaceId) {
      setError('No workspace selected.');
      return;
    }
    setIsCreating(true);
    try {
      const campaignData = editingCampaign || newCampaign;
      const campaignPayload = {
        name: campaignData.name,
        description: campaignData.description,
        launch_date: campaignData.launch_date || undefined, // Include launch_date if provided
        workspace_id: currentWorkspaceId,
      };

      if (editingCampaign) {
        const updatePayload = {
          name: campaignData.name,
          description: campaignData.description,
          launch_date: campaignData.launch_date || undefined, // Include launch_date for update
        };
        const updatedCampaign = await updateCampaign(editingCampaign.campaign_id, updatePayload);
        setCampaigns(
          campaigns.map((c) => (c.campaign_id === editingCampaign.campaign_id ? updatedCampaign : c))
        );
        setEditingCampaign(null);
      } else {
        const createdCampaign = await createCampaign(campaignPayload);
        setCampaigns([...campaigns, createdCampaign]);
        if (selectedGroupId) {
          await assignGroupToCampaign(selectedGroupId, createdCampaign.campaign_id);
          const updatedGroups = await getCampaignGroups(createdCampaign.campaign_id);
          setCampaignGroups({ ...campaignGroups, [createdCampaign.campaign_id]: updatedGroups });
        }
        setNewCampaign({ name: '', description: '', launch_date: '' }); // Reset launch_date
        setSelectedGroupId('');
      }
      setError(null);
    } catch (error) {
      console.error('Error creating/updating campaign:', error);
      setError('Failed to create/update campaign.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!currentWorkspaceId) {
      setError('No workspace selected.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id);
        setCampaigns(campaigns.filter((c) => c.campaign_id !== id));
        setCampaignGroups((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        setError(null);
      } catch (error) {
        console.error('Error deleting campaign:', error);
        setError('Failed to delete campaign.');
      }
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setNewCampaign({
      name: campaign.name,
      description: campaign.description,
      launch_date: campaign.launch_date || '', // Set launch_date for editing
    });
  };

  const handleAssignGroup = async (campaignId: string, groupId: string) => {
    try {
      await assignGroupToCampaign(groupId, campaignId);
      const updatedGroups = await getCampaignGroups(campaignId);
      setCampaignGroups({ ...campaignGroups, [campaignId]: updatedGroups });
      setError(null);
      setIsGroupModalOpen(false);
    } catch (error) {
      console.error('Error assigning group to campaign:', error);
      setError('Failed to assign group.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 sm:space-y-4 p-2 sm:p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#00333e]" />
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#00333e]">SMS Campaigns</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-400 text-xs sm:text-sm mb-2 sm:mb-3 bg-red-50 p-2 rounded-lg">{error}</div>
      )}

      {/* Create/Edit Campaign Form */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md w-full">
        <h2 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-[#00333e]">
          {editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
        </h2>
        <form onSubmit={handleCreateOrUpdateCampaign} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Campaign Name
            </label>
            <input
              type="text"
              className="w-full text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
              placeholder="e.g., Spring Promotion"
              value={editingCampaign?.name || newCampaign.name}
              onChange={(e) =>
                editingCampaign
                  ? setEditingCampaign({ ...editingCampaign, name: e.target.value })
                  : setNewCampaign({ ...newCampaign, name: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
              placeholder="Campaign description..."
              value={editingCampaign?.description || newCampaign.description}
              onChange={(e) =>
                editingCampaign
                  ? setEditingCampaign({ ...editingCampaign, description: e.target.value })
                  : setNewCampaign({ ...newCampaign, description: e.target.value })
              }
              required
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>
                {(editingCampaign?.description || newCampaign.description).length} characters
              </span>
              <span>
                {Math.ceil(
                  (editingCampaign?.description || newCampaign.description).length / 160
                )}{' '}
                message(s)
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Launch Date (Optional)
            </label>
            <input
              type="datetime-local"
              className="w-full text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
              value={editingCampaign?.launch_date || newCampaign.launch_date}
              onChange={(e) =>
                editingCampaign
                  ? setEditingCampaign({ ...editingCampaign, launch_date: e.target.value })
                  : setNewCampaign({ ...newCampaign, launch_date: e.target.value })
              }
            />
            {(editingCampaign?.launch_date || newCampaign.launch_date) && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Scheduled for:{' '}
                {new Date(
                  editingCampaign?.launch_date || newCampaign.launch_date
                ).toLocaleString()}
              </p>
            )}
          </div>
          {!editingCampaign && (
            <div>
              <button
                type="button"
                onClick={() => setIsGroupModalOpen(true)}
                className="text-xs sm:text-sm text-[#00333e] hover:bg-[#fddf0d] px-2 sm:px-3 py-1 rounded-lg transition-colors"
              >
                Assign Group (Optional)
              </button>
              {selectedGroupId && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  Selected Group: {groups.find((g) => g.group_id === selectedGroupId)?.name}
                </p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-1 sm:gap-2">
            {editingCampaign && (
              <button
                type="button"
                onClick={() => {
                  setEditingCampaign(null);
                  setNewCampaign({ name: '', description: '', launch_date: '' });
                }}
                className="text-xs sm:text-sm text-[#00333e] hover:bg-[#fddf0d] px-2 sm:px-3 py-1 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isCreating}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1 sm:py-2 px-3 sm:px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] transition-colors disabled:bg-[#00333e]/50"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              {isCreating ? 'Processing...' : editingCampaign ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      {/* Group Selection Modal */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-[90vw] sm:max-w-sm p-3 sm:p-4">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-bold text-[#00333e]">
                {editingCampaign ? 'Assign Group to Campaign' : 'Select Group for New Campaign'}
              </h3>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="text-gray-500 hover:text-[#00333e] transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="mb-3 sm:mb-4 max-h-40 sm:max-h-48 overflow-y-auto">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <div
                    key={group.group_id}
                    className="flex items-center gap-1 sm:gap-2 mb-2 cursor-pointer"
                    onClick={() => {
                      if (editingCampaign) {
                        handleAssignGroup(editingCampaign.campaign_id, group.group_id);
                      } else {
                        setSelectedGroupId(group.group_id);
                        setIsGroupModalOpen(false);
                      }
                    }}
                  >
                    <span className="text-xs sm:text-sm text-gray-700">{group.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-gray-500">No groups available.</p>
              )}
            </div>
            <div className="flex justify-end gap-1 sm:gap-2">
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Campaigns */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md w-full">
        <h2 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3 text-[#00333e]">
          Active Campaigns
        </h2>
        {campaigns.length === 0 ? (
          <p className="text-gray-500 text-xs sm:text-sm">No campaigns created yet.</p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.campaign_id} className="p-2 sm:p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-xs sm:text-sm text-[#00333e]">
                      {campaign.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {campaign.description.length > 30
                        ? `${campaign.description.substring(0, 30)}...`
                        : campaign.description}
                    </p>
                    {campaign.launch_date && (
                      <p className="text-xs sm:text-sm text-gray-600">
                        Launch Date: {new Date(campaign.launch_date).toLocaleString()}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                      {campaignGroups[campaign.campaign_id]?.map((group) => (
                        <span
                          key={group.group_id}
                          className="bg-[#fddf0d] text-[#00333e] px-1 sm:px-2 py-0.5 rounded text-xs"
                        >
                          {group.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setIsGroupModalOpen(true)}
                      className="text-[#00333e] hover:text-[#fddf0d]"
                      onMouseDown={() => setEditingCampaign(campaign)}
                    >
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => handleEditCampaign(campaign)}
                      className="text-[#00333e] hover:text-[#fddf0d]"
                    >
                      <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(campaign.campaign_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#00333e] mb-1 sm:mb-2" />
          <h3 className="text-sm sm:text-base font-semibold mb-1 text-[#00333e]">
            Scheduled Campaigns
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">
            {campaigns.filter((c) => c.launch_date).length} pending
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#00333e] mb-1 sm:mb-2" />
          <h3 className="text-sm sm:text-base font-semibold mb-1 text-[#00333e]">
            Total Campaigns
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">{campaigns.length} campaigns</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SMSCampaigns;