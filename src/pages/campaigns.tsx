import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Clock, Trash2, Edit, Users } from 'lucide-react';
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
    launch_date: '',
  });
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
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
        launch_date: campaignData.launch_date || '',
        workspace_id: currentWorkspaceId,
      };

      if (editingCampaign) {
        const updatePayload = {
          name: campaignData.name,
          description: campaignData.description,
          launch_date: campaignData.launch_date || '',
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
        setNewCampaign({ name: '', description: '', launch_date: '' });
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
      launch_date: campaign.launch_date,
    });
  };

  const handleAssignGroup = async (campaignId: string, groupId: string) => {
    try {
      await assignGroupToCampaign(groupId, campaignId);
      const updatedGroups = await getCampaignGroups(campaignId);
      setCampaignGroups({ ...campaignGroups, [campaignId]: updatedGroups });
      setError(null);
    } catch (error) {
      console.error('Error assigning group to campaign:', error);
      setError('Failed to assign group.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-8">
        <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-[#00333e]" />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#00333e]">SMS Campaigns</h1>
      </div>
      {error && (
        <div className="text-red-500 text-sm sm:text-base mb-3 sm:mb-4">{error}</div>
      )}
      <div className="card p-4 sm:p-8">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
          {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
        </h2>
        <form onSubmit={handleCreateOrUpdateCampaign} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Campaign Name
            </label>
            <input
              type="text"
              className="input w-full text-xs sm:text-sm py-2 sm:py-3"
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
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Description
            </label>
            <textarea
              className="input min-h-[100px] sm:min-h-[120px] w-full text-xs sm:text-sm"
              placeholder="Type your campaign description here..."
              value={editingCampaign?.description || newCampaign.description}
              onChange={(e) =>
                editingCampaign
                  ? setEditingCampaign({ ...editingCampaign, description: e.target.value })
                  : setNewCampaign({ ...newCampaign, description: e.target.value })
              }
              required
            />
            <div className="mt-1 sm:mt-2 flex justify-between text-xs sm:text-sm text-gray-500">
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
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Launch Date (Optional)
            </label>
            <input
              type="datetime-local"
              className="input w-full text-xs sm:text-sm py-2 sm:py-3"
              value={editingCampaign?.launch_date || newCampaign.launch_date}
              onChange={(e) =>
                editingCampaign
                  ? setEditingCampaign({ ...editingCampaign, launch_date: e.target.value })
                  : setNewCampaign({ ...newCampaign, launch_date: e.target.value })
              }
            />
          </div>
          {!editingCampaign && (
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Assign Group (Optional)
              </label>
              <select
                className="input w-full text-xs sm:text-sm py-2 sm:py-3"
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
              >
                <option value="">Select a group</option>
                {groups.map((group) => (
                  <option key={group.group_id} value={group.group_id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-4">
            {editingCampaign && (
              <button
                type="button"
                onClick={() => {
                  setEditingCampaign(null);
                  setNewCampaign({ name: '', description: '', launch_date: '' });
                }}
                className="btn btn-secondary text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              disabled={isCreating}
              className="btn bg-[#00333e] text-white flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              {isCreating ? 'Processing...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
      <div className="card p-4 sm:p-8">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Active Campaigns</h2>
        {campaigns.length === 0 ? (
          <p className="text-gray-500 text-xs sm:text-sm">No campaigns created yet.</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.campaign_id} className="flex flex-col p-3 sm:p-4 border rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  <div>
                    <h3 className="font-medium text-sm sm:text-base">{campaign.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {campaign.description.length > 50
                        ? `${campaign.description.substring(0, 50)}...`
                        : campaign.description}
                    </p>
                    <div className="mt-1 flex flex-col sm:flex-row sm:gap-4 text-xs sm:text-sm text-gray-500">
                      {campaign.launch_date && (
                        <span>Launch: {new Date(campaign.launch_date).toLocaleString()}</span>
                      )}
                      <span>Created: {new Date(campaign.created_at).toLocaleString()}</span>
                      <span>By: {campaign.created_by}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button
                      onClick={() => handleEditCampaign(campaign)}
                      className="text-[#00333e] hover:text-[#6f888c]"
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
                <div className="mt-2 sm:mt-3">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Assigned Groups
                  </label>
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-1 sm:mb-2">
                    {campaignGroups[campaign.campaign_id]?.map((group) => (
                      <span
                        key={group.group_id}
                        className="bg-[#fddf0d] text-[#00333e] px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm"
                      >
                        {group.name}
                      </span>
                    ))}
                  </div>
                  <select
                    className="input w-full sm:max-w-xs text-xs sm:text-sm py-2 sm:py-3"
                    onChange={(e) => handleAssignGroup(campaign.campaign_id, e.target.value)}
                    value=""
                  >
                    <option value="">Assign a group</option>
                    {groups
                      .filter(
                        (g) =>
                          !campaignGroups[campaign.campaign_id]?.some(
                            (cg) => cg.group_id === g.group_id
                          )
                      )
                      .map((group) => (
                        <option key={group.group_id} value={group.group_id}>
                          {group.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="card p-4 sm:p-6">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#00333e] mb-2 sm:mb-3" />
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Scheduled Campaigns</h3>
          <p className="text-[#6f888c] text-xs sm:text-sm">
            {campaigns.filter((c) => c.launch_date).length} pending
          </p>
        </div>
        <div className="card p-4 sm:p-6">
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-[#00333e] mb-2 sm:mb-3" />
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Total Campaigns</h3>
          <p className="text-[#6f888c] text-xs sm:text-sm">{campaigns.length} campaigns</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SMSCampaigns;