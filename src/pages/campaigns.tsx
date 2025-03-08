import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Clock, Users, BarChart2, Bot, Trash2, Edit } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { getSenderId } from '../services/api';

interface Campaign {
  id: string;
  name: string;
  senderId: string;
  message: string;
  recipients: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  schedule?: string;
  deliveryRate?: number;
  recipientGroups: string[];
}

const SMSCampaigns: React.FC = () => {
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId } = useWorkspace();
  const workspace = getCurrentWorkspace();
  const contacts = workspace?.contacts || [];
  const [campaigns, setCampaigns] = useState<Campaign[]>(workspace?.campaigns || []);
  const [senderIds, setSenderIds] = useState<string[]>([]);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    senderId: '',
    message: '',
    schedule: '',
    recipientGroups: [] as string[],
  });
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [error, setError] = useState<string | null>(null);
  const contactGroups = ['All Customers', 'VIP Members', 'New Subscribers'];

  useEffect(() => {
    const fetchSenderIds = async () => {
      try {
        const ids = await getSenderId();
        setSenderIds(ids);
        setError(null);
        if (!workspace?.campaigns?.length) {
          setCampaigns([
            {
              id: '1',
              name: 'Welcome Campaign',
              senderId: ids[0] || 'Company',
              message: 'Welcome to our service!',
              recipients: 150,
              status: 'sent',
              deliveryRate: 95,
              recipientGroups: ['All Customers'],
            },
            {
              id: '2',
              name: 'Promo March',
              senderId: ids[0] || 'Company',
              message: 'Get 20% off this month!',
              recipients: 200,
              status: 'scheduled',
              schedule: '2025-03-05T10:00',
              recipientGroups: ['VIP Members'],
            },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch sender IDs:', error);
        setError('Unable to fetch sender IDs. Using fallback data.');
        setSenderIds(['FallbackSender1', 'FallbackSender2']);
        if (!workspace?.campaigns?.length) {
          setCampaigns([
            {
              id: '1',
              name: 'Welcome Campaign',
              senderId: 'FallbackSender1',
              message: 'Welcome to our service!',
              recipients: 150,
              status: 'sent',
              deliveryRate: 95,
              recipientGroups: ['All Customers'],
            },
          ]);
        }
      }
    };
    fetchSenderIds();
  }, [workspace]);

  // Sync local campaigns state with workspace context
  useEffect(() => {
    if (currentWorkspaceId && workspace) {
      updateWorkspace(currentWorkspaceId, { campaigns });
    }
  }, [campaigns, currentWorkspaceId, updateWorkspace]);

  const generateAIMessage = async () => {
    if (!keywords.trim()) {
      alert('Please enter some keywords to generate a message');
      return;
    }
    setIsGenerating(true);
    try {
      const keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k);
      await new Promise(resolve => setTimeout(resolve, 1000));
      let aiMessage = `Hello! This is ${newCampaign.senderId || 'your company'} reaching out regarding `;
      if (keywordsArray.length > 0) {
        aiMessage += keywordsArray.join(' and ') + '. ';
      }
      aiMessage += 'How can we assist you today with these topics?';
      if (editingCampaign) {
        setEditingCampaign({ ...editingCampaign, message: aiMessage });
      } else {
        setNewCampaign({ ...newCampaign, message: aiMessage });
      }
    } catch (error) {
      console.error('Error generating AI message:', error);
      setError('Failed to generate AI message.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateOrUpdateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const campaignData = editingCampaign || newCampaign;
      const campaign: Campaign = {
        id: editingCampaign?.id || Date.now().toString(),
        name: campaignData.name,
        senderId: campaignData.senderId,
        message: campaignData.message,
        recipients: contacts.length,
        status: campaignData.schedule ? 'scheduled' : 'draft',
        schedule: campaignData.schedule || undefined,
        recipientGroups: campaignData.recipientGroups,
      };
      if (editingCampaign) {
        setCampaigns(campaigns.map(c => (c.id === campaign.id ? campaign : c)));
        setEditingCampaign(null);
      } else {
        setCampaigns([...campaigns, campaign]);
        setNewCampaign({ name: '', senderId: '', message: '', schedule: '', recipientGroups: [] });
      }
      setKeywords('');
      setError(null);
    } catch (error) {
      console.error('Error creating/updating campaign:', error);
      setError('Failed to create/update campaign.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCampaign = (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      setCampaigns(campaigns.filter(c => c.id !== id));
    }
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setNewCampaign({
      name: campaign.name,
      senderId: campaign.senderId,
      message: campaign.message,
      schedule: campaign.schedule || '',
      recipientGroups: campaign.recipientGroups,
    });
  };

  const toggleRecipientGroup = (group: string) => {
    const currentCampaign = editingCampaign || newCampaign;
    const updatedGroups = currentCampaign.recipientGroups.includes(group)
      ? currentCampaign.recipientGroups.filter(g => g !== group)
      : [...currentCampaign.recipientGroups, group];
    if (editingCampaign) {
      setEditingCampaign({ ...editingCampaign, recipientGroups: updatedGroups });
    } else {
      setNewCampaign({ ...newCampaign, recipientGroups: updatedGroups });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">SMS Campaigns</h1>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="card p-8">
        <h2 className="text-lg font-semibold mb-4">{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</h2>
        <form onSubmit={handleCreateOrUpdateCampaign} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
            <input
              type="text"
              className="input"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Sender ID</label>
            <select
              className="input"
              value={editingCampaign?.senderId || newCampaign.senderId}
              onChange={(e) =>
                editingCampaign
                  ? setEditingCampaign({ ...editingCampaign, senderId: e.target.value })
                  : setNewCampaign({ ...newCampaign, senderId: e.target.value })
              }
              required
            >
              <option value="" disabled>
                Select Sender ID
              </option>
              {senderIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Groups</label>
            <div className="flex flex-wrap gap-2">
              {contactGroups.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => toggleRecipientGroup(group)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    (editingCampaign?.recipientGroups || newCampaign.recipientGroups).includes(group)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="input max-w-[200px]"
                  placeholder="Enter keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
                <button
                  type="button"
                  onClick={generateAIMessage}
                  disabled={isGenerating}
                  className="btn btn-sm btn-secondary flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Generate AI Message'}
                </button>
              </div>
            </div>
            <textarea
              className="input min-h-[120px]"
              placeholder="Type your campaign message here..."
              value={editingCampaign?.message || newCampaign.message}
              onChange={(e) =>
                editingCampaign
                  ? setEditingCampaign({ ...editingCampaign, message: e.target.value })
                  : setNewCampaign({ ...newCampaign, message: e.target.value })
              }
              required
            />
            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <span>{(editingCampaign?.message || newCampaign.message).length} characters</span>
              <span>
                {Math.ceil((editingCampaign?.message || newCampaign.message).length / 160)} message(s)
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Optional)</label>
            <input
              type="datetime-local"
              className="input"
              value={editingCampaign?.schedule || newCampaign.schedule}
              onChange={(e) =>
                editingCampaign
                  ? setEditingCampaign({ ...editingCampaign, schedule: e.target.value })
                  : setNewCampaign({ ...newCampaign, schedule: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-4">
            {editingCampaign && (
              <button
                type="button"
                onClick={() => {
                  setEditingCampaign(null);
                  setNewCampaign({ name: '', senderId: '', message: '', schedule: '', recipientGroups: [] });
                  setKeywords('');
                }}
                className="btn btn-secondary"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              disabled={isCreating}
              className="btn btn-primary flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              {isCreating ? 'Processing...' : editingCampaign ? 'Update Campaign' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
      <div className="card p-8">
        <h2 className="text-lg font-semibold mb-4">Active Campaigns</h2>
        {campaigns.length === 0 ? (
          <p className="text-gray-500">No campaigns created yet.</p>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{campaign.name}</h3>
                  <p className="text-sm text-gray-600">{campaign.message.substring(0, 50)}...</p>
                  <div className="mt-1 flex gap-4 text-sm text-gray-500">
                    <span>Sender: {campaign.senderId}</span>
                    <span>Recipients: {campaign.recipients}</span>
                    <span>Groups: {campaign.recipientGroups.join(', ')}</span>
                    {campaign.schedule && (
                      <span>Scheduled: {new Date(campaign.schedule).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      campaign.status === 'sent'
                        ? 'bg-green-100 text-green-800'
                        : campaign.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-800'
                        : campaign.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {campaign.status}
                  </span>
                  {campaign.deliveryRate && (
                    <span className="text-sm text-gray-600">Delivery: {campaign.deliveryRate}%</span>
                  )}
                  <button
                    onClick={() => handleEditCampaign(campaign)}
                    className="text-primary-500 hover:text-primary-700"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <Users className="w-6 h-6 text-primary-500 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Total Recipients</h3>
          <p className="text-gray-600">{contacts.length} contacts</p>
        </div>
        <div className="card p-6">
          <Clock className="w-6 h-6 text-primary-500 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Scheduled Campaigns</h3>
          <p className="text-gray-600">{campaigns.filter((c) => c.status === 'scheduled').length} pending</p>
        </div>
        <div className="card p-6">
          <BarChart2 className="w-6 h-6 text-primary-500 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
          <p className="text-gray-600">
            {campaigns.length > 0
              ? Math.round(
                  (campaigns.reduce((acc, c) => acc + (c.deliveryRate || 0), 0) /
                    campaigns.filter((c) => c.deliveryRate !== undefined).length) || 0
                )
              : 0}
            % average
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SMSCampaigns;