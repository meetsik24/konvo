import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Plus, 
  BarChart3, 
  Send, 
  CheckCircle, 
  Clock, 
  Play, 
  Pause, 
  Settings, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Filter,
  Upload,
  Users,
  Calendar,
  Target
} from 'lucide-react';
import { WhatsAppCampaign, WhatsAppTemplate, CampaignAudience } from '../../types/whatsapp';

interface CampaignsTabProps {
  campaigns: WhatsAppCampaign[];
  setCampaigns: (campaigns: WhatsAppCampaign[]) => void;
  templates: WhatsAppTemplate[];
}

const CampaignsTab: React.FC<CampaignsTabProps> = ({ campaigns, setCampaigns, templates }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    template_id: '',
    scheduled_at: '',
    target_audience: {
      type: 'all' as const,
      group_ids: [] as string[],
      tags: [] as string[],
      phone_numbers: [] as string[]
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Play className="w-5 h-5 text-blue-500" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-orange-500" />;
      case 'draft':
        return <Edit className="w-5 h-5 text-gray-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'running':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'paused':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'draft':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCampaign = () => {
    if (!newCampaign.name.trim() || !newCampaign.template_id) return;

    const campaign: WhatsAppCampaign = {
      id: Date.now().toString(),
      name: newCampaign.name,
      template_id: newCampaign.template_id,
      status: 'draft',
      audience_count: 0, // Will be calculated based on audience type
      sent_count: 0,
      delivered_count: 0,
      read_count: 0,
      response_rate: 0,
      created_at: new Date().toISOString(),
      scheduled_at: newCampaign.scheduled_at || undefined,
      target_audience: newCampaign.target_audience
    };

    setCampaigns([...campaigns, campaign]);
    setNewCampaign({
      name: '',
      template_id: '',
      scheduled_at: '',
      target_audience: {
        type: 'all',
        group_ids: [],
        tags: [],
        phone_numbers: []
      }
    });
    setShowCreateForm(false);
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaigns(campaigns.filter(c => c.id !== campaignId));
  };

  const handleStatusChange = (campaignId: string, newStatus: WhatsAppCampaign['status']) => {
    setCampaigns(campaigns.map(c => 
      c.id === campaignId ? { ...c, status: newStatus } : c
    ));
  };

  const stats = {
    total: campaigns.length,
    sent: campaigns.reduce((sum, c) => sum + c.sent_count, 0),
    delivered: campaigns.reduce((sum, c) => sum + c.delivered_count, 0),
    read: campaigns.reduce((sum, c) => sum + c.read_count, 0),
    responseRate: campaigns.length > 0 
      ? Math.round(campaigns.reduce((sum, c) => sum + c.response_rate, 0) / campaigns.length) 
      : 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Megaphone className="w-6 h-6 text-[#25D366]" />
          <h2 className="text-xl font-semibold text-[#004d66]">Campaign Management</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#1DA851] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Total Campaigns</span>
          </div>
          <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.total}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Sent</span>
          </div>
          <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.sent.toLocaleString()}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Delivered</span>
          </div>
          <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.delivered.toLocaleString()}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Read</span>
          </div>
          <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.read.toLocaleString()}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium">Response Rate</span>
          </div>
          <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.responseRate}%</p>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="running">Running</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No campaigns found</p>
            <p className="text-sm text-gray-500">Create your first campaign to start messaging customers</p>
          </div>
        ) : (
          filteredCampaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-[#004d66]">{campaign.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  {campaign.scheduled_at && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(campaign.scheduled_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(campaign.status)}
                  <button 
                    onClick={() => setShowPreview(campaign.id)}
                    className="p-1 text-gray-600 hover:text-[#25D366]"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-600 hover:text-[#25D366]" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="p-1 text-gray-600 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Audience:</span>
                  <span className="ml-1 font-medium">{campaign.audience_count.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Sent:</span>
                  <span className="ml-1 font-medium">{campaign.sent_count.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Delivered:</span>
                  <span className="ml-1 font-medium">{campaign.delivered_count.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Response Rate:</span>
                  <span className="ml-1 font-medium">{campaign.response_rate}%</span>
                </div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Created: {new Date(campaign.created_at).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  {campaign.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(campaign.id, 'scheduled')}
                      className="px-3 py-1 bg-[#25D366] text-white text-xs rounded hover:bg-[#1DA851]"
                    >
                      Schedule
                    </button>
                  )}
                  {campaign.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusChange(campaign.id, 'running')}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      Start
                    </button>
                  )}
                  {campaign.status === 'running' && (
                    <button
                      onClick={() => handleStatusChange(campaign.id, 'paused')}
                      className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                    >
                      Pause
                    </button>
                  )}
                  {campaign.status === 'paused' && (
                    <button
                      onClick={() => handleStatusChange(campaign.id, 'running')}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      Resume
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-medium text-[#004d66] mb-4">Create New Campaign</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  placeholder="e.g., Summer Sale Promotion"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                <select
                  value={newCampaign.template_id}
                  onChange={(e) => setNewCampaign({...newCampaign, template_id: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                >
                  <option value="">Select Template</option>
                  {templates.filter(t => t.status === 'approved').map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.category})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Optional)</label>
                <input
                  type="datetime-local"
                  value={newCampaign.scheduled_at}
                  onChange={(e) => setNewCampaign({...newCampaign, scheduled_at: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  value={newCampaign.target_audience.type}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign, 
                    target_audience: {...newCampaign.target_audience, type: e.target.value as any}
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                >
                  <option value="all">All Contacts</option>
                  <option value="groups">Specific Groups</option>
                  <option value="tags">By Tags</option>
                  <option value="custom">Custom List</option>
                </select>
              </div>
              
              {newCampaign.target_audience.type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers</label>
                  <textarea
                    value={newCampaign.target_audience.phone_numbers.join('\n')}
                    onChange={(e) => setNewCampaign({
                      ...newCampaign,
                      target_audience: {
                        ...newCampaign.target_audience,
                        phone_numbers: e.target.value.split('\n').filter(phone => phone.trim())
                      }
                    })}
                    rows={4}
                    placeholder="Enter phone numbers, one per line"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCampaign}
                disabled={!newCampaign.name.trim() || !newCampaign.template_id}
                className="px-4 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#1DA851] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Campaign
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-[#004d66]">Campaign Preview</h3>
              <button
                onClick={() => setShowPreview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            {(() => {
              const campaign = campaigns.find(c => c.id === showPreview);
              const template = templates.find(t => t.id === campaign?.template_id);
              return campaign ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800">{campaign.name}</h4>
                    <p className="text-sm text-gray-600">Status: {campaign.status}</p>
                  </div>
                  {template && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Template Content:</p>
                      <p className="text-sm">{template.content}</p>
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    <p>Audience: {campaign.audience_count.toLocaleString()}</p>
                    <p>Created: {new Date(campaign.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : null;
            })()}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CampaignsTab;
