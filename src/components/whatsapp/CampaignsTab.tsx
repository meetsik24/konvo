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
  const [formErrors, setFormErrors] = useState<{name?: string, template?: string}>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
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

  // Debug logs
  console.log('CampaignsTab - campaigns:', campaigns);
  console.log('CampaignsTab - templates:', templates);
  console.log('CampaignsTab - approved templates:', templates.filter(t => t.status === 'approved'));

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
    console.log('Creating campaign with data:', newCampaign);
    
    // Clear previous errors
    setFormErrors({});
    
    // Validate form
    const errors: {name?: string, template?: string} = {};
    
    if (!newCampaign.name.trim()) {
      errors.name = 'Campaign name is required';
    }
    
    if (!newCampaign.template_id) {
      errors.template = 'Please select a template';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      console.log('Validation failed:', errors);
      return;
    }

    const campaign: WhatsAppCampaign = {
      id: Date.now().toString(),
      name: newCampaign.name.trim(),
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

    console.log('New campaign object:', campaign);
    console.log('Current campaigns before update:', campaigns);

    try {
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
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
      
      console.log('Campaign created successfully');
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
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
    <div className="h-full bg-[#f5f5f5] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#004d66] rounded-full flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#004d66]">Campaign Management</h2>
            <p className="text-sm text-gray-600">Create and manage your WhatsApp broadcast campaigns</p>
          </div>
        </div>
        <button
          onClick={() => {
            alert('Create Campaign button clicked!');
            console.log('Create Campaign button clicked - opening modal');
            setShowCreateForm(true);
            setFormErrors({});
            console.log('Modal should be open now, showCreateForm:', true);
          }}
          className="px-4 py-2 bg-[#004d66] text-white rounded-lg hover:bg-[#003d52] flex items-center gap-2 font-medium"
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
          className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-[#004d66] rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sent</p>
              <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.sent.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Send className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.delivered.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Read</p>
              <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.read.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.responseRate}%</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent bg-white"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">Create your first campaign to start messaging customers</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-[#004d66] text-white rounded-lg hover:bg-[#003d52] flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#004d66] rounded-full flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-[#004d66] truncate">{campaign.name}</h3>
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
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setShowPreview(campaign.id)}
                          className="p-2 text-gray-400 hover:text-[#004d66] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-[#004d66] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Audience:</span>
                        <span className="font-medium">{campaign.audience_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Send className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Sent:</span>
                        <span className="font-medium">{campaign.sent_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Delivered:</span>
                        <span className="font-medium">{campaign.delivered_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Response:</span>
                        <span className="font-medium">{campaign.response_rate}%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Created: {new Date(campaign.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => handleStatusChange(campaign.id, 'scheduled')}
                            className="px-3 py-1 bg-[#25D366] text-white text-xs rounded hover:bg-[#1DA851] transition-colors"
                          >
                            Schedule
                          </button>
                        )}
                        {campaign.status === 'scheduled' && (
                          <button
                            onClick={() => handleStatusChange(campaign.id, 'running')}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                          >
                            Start
                          </button>
                        )}
                        {campaign.status === 'running' && (
                          <button
                            onClick={() => handleStatusChange(campaign.id, 'paused')}
                            className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors"
                          >
                            Pause
                          </button>
                        )}
                        {campaign.status === 'paused' && (
                          <button
                            onClick={() => handleStatusChange(campaign.id, 'running')}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                          >
                            Resume
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          {console.log('Rendering Create Campaign Modal')}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#004d66] rounded-full flex items-center justify-center">
                  <Megaphone className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#004d66]">Create Campaign</h3>
                  <p className="text-xs text-gray-600">Set up a new broadcast campaign</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Debug Info - Remove in production */}
              <div className="bg-gray-100 p-2 rounded text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>Name: "{newCampaign.name}" (length: {newCampaign.name.length})</p>
                <p>Template ID: "{newCampaign.template_id}"</p>
                <p>Button Disabled: {(!newCampaign.name.trim() || !newCampaign.template_id).toString()}</p>
                <p>Available Templates: {templates.filter(t => t.status === 'approved').length}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#004d66] mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => {
                    console.log('Campaign name changed:', e.target.value);
                    setNewCampaign({...newCampaign, name: e.target.value});
                    if (formErrors.name) {
                      setFormErrors({...formErrors, name: undefined});
                    }
                  }}
                  placeholder="e.g., Summer Sale Promotion"
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#004d66] mb-1">Template</label>
                <select
                  value={newCampaign.template_id}
                  onChange={(e) => {
                    console.log('Template changed:', e.target.value);
                    setNewCampaign({...newCampaign, template_id: e.target.value});
                    if (formErrors.template) {
                      setFormErrors({...formErrors, template: undefined});
                    }
                  }}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm ${
                    formErrors.template ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Template</option>
                  {templates.filter(t => t.status === 'approved').map(template => {
                    console.log('Rendering template option:', template);
                    return (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.category})
                      </option>
                    );
                  })}
                </select>
                {formErrors.template && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.template}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#004d66] mb-1">Schedule (Optional)</label>
                <input
                  type="datetime-local"
                  value={newCampaign.scheduled_at}
                  onChange={(e) => setNewCampaign({...newCampaign, scheduled_at: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#004d66] mb-1">Target Audience</label>
                <select
                  value={newCampaign.target_audience.type}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign, 
                    target_audience: {...newCampaign.target_audience, type: e.target.value as any}
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                >
                  <option value="all">All Contacts</option>
                  <option value="groups">Specific Groups</option>
                  <option value="tags">By Tags</option>
                  <option value="custom">Custom List</option>
                </select>
              </div>
              
              {newCampaign.target_audience.type === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-[#004d66] mb-1">Phone Numbers</label>
                  <textarea
                    value={newCampaign.target_audience.phone_numbers.join('\n')}
                    onChange={(e) => setNewCampaign({
                      ...newCampaign,
                      target_audience: {
                        ...newCampaign.target_audience,
                        phone_numbers: e.target.value.split('\n').filter(phone => phone.trim())
                      }
                    })}
                    rows={3}
                    placeholder="Enter phone numbers, one per line"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Create Campaign button clicked');
                    console.log('Form state:', newCampaign);
                    console.log('Button disabled?', !newCampaign.name.trim() || !newCampaign.template_id);
                    handleCreateCampaign();
                  }}
                  disabled={false}
                  className="px-4 py-1.5 bg-[#25D366] text-white rounded-md hover:bg-[#1DA851] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Create Campaign
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg w-full max-w-sm shadow-xl"
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#004d66] rounded-full flex items-center justify-center">
                  <Eye className="w-3 h-3 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#004d66]">Campaign Preview</h3>
                  <p className="text-xs text-gray-600">Preview campaign details</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(null)}
                className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            {(() => {
              const campaign = campaigns.find(c => c.id === showPreview);
              const template = templates.find(t => t.id === campaign?.template_id);
              return campaign ? (
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-medium text-[#004d66]">{campaign.name}</h4>
                    <p className="text-xs text-gray-600">Status: {campaign.status}</p>
                  </div>
                  {template && (
                    <div className="bg-[#F0F2F5] p-3 rounded-md border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Template Content:</p>
                      <p className="text-sm">{template.content}</p>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Audience: {campaign.audience_count.toLocaleString()}</p>
                    <p>Created: {new Date(campaign.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : null;
            })()}
          </motion.div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Campaign created successfully!</span>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CampaignsTab;
