import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Plus, 
  BarChart3, 
  Send, 
  CheckCircle, 
  Eye, 
  Edit, 
  Trash2,
  Search,
  Users,
  Calendar,
  Target
} from 'lucide-react';
import { WhatsAppCampaign, WhatsAppTemplate } from '../../types/whatsapp';
import StandardModal from './StandardModal';
import ModalButton from './ModalButton';

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
  const [formErrors, setFormErrors] = useState<{
    name?: string, 
    template?: string, 
    message_id?: string,
    phone_numbers?: string,
    template_parameters?: string
  }>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    template_id: '',
    template_name: '',
    template_language: 'en',
    scheduled_at: '',
    message_id: '',
    target_audience: {
      type: 'all' as 'all' | 'groups' | 'tags' | 'custom',
      group_ids: [] as string[],
      tags: [] as string[],
      phone_numbers: [] as string[]
    },
    template_parameters: [] as {name: string, value: string}[],
    delivery_time: 'immediate' as 'immediate' | 'scheduled',
    notify_url: '',
    callback_data: ''
  });



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
    console.log('handleCreateCampaign called');
    console.log('Form data:', newCampaign);
    
    // Clear previous errors
    setFormErrors({});
    
    // Validate form
    const errors: {
      name?: string, 
      template?: string, 
      message_id?: string,
      phone_numbers?: string,
      template_parameters?: string
    } = {};
    
    if (!newCampaign.name.trim()) {
      errors.name = 'Campaign name is required';
    }
    
    if (!newCampaign.template_id) {
      errors.template = 'Please select a template';
    }
    
    if (!newCampaign.message_id.trim()) {
      errors.message_id = 'Message ID is required for tracking';
    }
    
    if (newCampaign.target_audience.type === 'custom' && (!newCampaign.target_audience.phone_numbers || newCampaign.target_audience.phone_numbers.length === 0)) {
      errors.phone_numbers = 'Please provide at least one phone number';
    }
    
    console.log('Validation errors:', errors);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const campaign: WhatsAppCampaign = {
      id: Date.now().toString(),
      name: newCampaign.name.trim(),
      template_id: newCampaign.template_id,
      status: 'draft',
      audience_count: newCampaign.target_audience.phone_numbers.length || 0,
      sent_count: 0,
      delivered_count: 0,
      read_count: 0,
      response_rate: 0,
      created_at: new Date().toISOString(),
      scheduled_at: newCampaign.scheduled_at || undefined,
      target_audience: newCampaign.target_audience,
      // Additional API fields
      message_id: newCampaign.message_id,
      template_name: newCampaign.template_name,
      template_language: newCampaign.template_language,
      template_parameters: newCampaign.template_parameters,
      delivery_time: newCampaign.delivery_time,
      notify_url: newCampaign.notify_url,
      callback_data: newCampaign.callback_data
    };

    try {
      setCampaigns([...campaigns, campaign]);
      
      setNewCampaign({
        name: '',
        template_id: '',
        template_name: '',
        template_language: 'en',
        scheduled_at: '',
        message_id: '',
        target_audience: {
          type: 'all' as 'all' | 'groups' | 'tags' | 'custom',
          group_ids: [],
          tags: [],
          phone_numbers: []
        },
        template_parameters: [],
        delivery_time: 'immediate',
        notify_url: '',
        callback_data: ''
      });
      setShowCreateForm(false);
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
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
    <div className="h-full bg-[#f5f5f5] p-2 sm:p-4 space-y-3 sm:space-y-4">
      {/* Header - Mobile Responsive */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#004d66] rounded-lg flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-lg font-semibold text-[#004d66] truncate">Campaign Management</h2>
            <p className="text-xs text-gray-600 hidden sm:block">Create and manage your WhatsApp broadcast campaigns</p>
          </div>
        </div>
        <button
          onClick={() => {
            console.log('Create Campaign button clicked');
            setShowCreateForm(true);
            setFormErrors({});
            console.log('Modal should be open now, showCreateForm:', true);
          }}
          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#004d66] text-white rounded hover:bg-[#003d52] flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium transition-colors flex-shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">Create Campaign</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Campaign Stats - Mobile Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-2 sm:p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Campaigns</p>
              <p className="text-lg sm:text-2xl font-bold text-[#004d66] mt-1">{stats.total}</p>
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
          className="bg-white p-2 sm:p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Sent</p>
              <p className="text-lg sm:text-2xl font-bold text-[#004d66] mt-1">{stats.sent.toLocaleString()}</p>
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
          className="bg-white p-2 sm:p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-lg sm:text-2xl font-bold text-[#004d66] mt-1">{stats.delivered.toLocaleString()}</p>
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
          className="bg-white p-2 sm:p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Read</p>
              <p className="text-lg sm:text-2xl font-bold text-[#004d66] mt-1">{stats.read.toLocaleString()}</p>
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
          className="bg-white p-2 sm:p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-lg sm:text-2xl font-bold text-[#004d66] mt-1">{stats.responseRate}%</p>
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

      {/* Campaigns List - Mobile Responsive */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Megaphone className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">Create your first campaign to start messaging customers</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#004d66] text-white rounded-lg hover:bg-[#003d52] flex items-center gap-1.5 sm:gap-2 mx-auto text-sm sm:text-base"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Create Campaign</span>
              <span className="sm:hidden">Create</span>
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
                className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#004d66] rounded-full flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <h3 className="font-medium text-[#004d66] truncate text-sm sm:text-base">{campaign.name}</h3>
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                        {campaign.scheduled_at && (
                          <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span className="hidden sm:inline">{new Date(campaign.scheduled_at).toLocaleDateString()}</span>
                            <span className="sm:hidden">{new Date(campaign.scheduled_at).toLocaleDateString().split('/')[0]}/{new Date(campaign.scheduled_at).toLocaleDateString().split('/')[1]}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <button 
                          onClick={() => setShowPreview(campaign.id)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-[#004d66] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-[#004d66] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="text-gray-600">Audience:</span>
                        <span className="font-medium">{campaign.audience_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Send className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="text-gray-600">Sent:</span>
                        <span className="font-medium">{campaign.sent_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="text-gray-600">Delivered:</span>
                        <span className="font-medium">{campaign.delivered_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        <span className="text-gray-600">Response:</span>
                        <span className="font-medium">{campaign.response_rate}%</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
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
      <StandardModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create New Campaign"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Set up a new broadcast campaign</p>
              
              
              {/* Campaign Basic Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-[#004d66] border-b border-gray-200 pb-2">Campaign Information</h4>
                
                <div>
                  <label className="block text-sm font-medium text-[#004d66] mb-1">Campaign Name *</label>
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
                  <label className="block text-sm font-medium text-[#004d66] mb-1">Message ID *</label>
                  <input
                    type="text"
                    value={newCampaign.message_id}
                    onChange={(e) => {
                      console.log('Message ID changed:', e.target.value);
                      setNewCampaign({...newCampaign, message_id: e.target.value});
                      if (formErrors.message_id) {
                        setFormErrors({...formErrors, message_id: undefined});
                      }
                    }}
                    placeholder="Unique message identifier for tracking"
                    className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm ${
                      formErrors.message_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.message_id && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.message_id}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Used for tracking and delivery status</p>
                </div>
              </div>

              {/* Template Configuration */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-[#004d66] border-b border-gray-200 pb-2">Template Configuration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#004d66] mb-1">Template *</label>
                    <select
                      value={newCampaign.template_id}
                      onChange={(e) => {
                        console.log('Template changed:', e.target.value);
                        const selectedTemplate = templates.find(t => t.id === e.target.value);
                        setNewCampaign({
                          ...newCampaign, 
                          template_id: e.target.value,
                          template_name: selectedTemplate?.name || '',
                          template_language: selectedTemplate?.language || 'en'
                        });
                        if (formErrors.template) {
                          setFormErrors({...formErrors, template: undefined});
                        }
                      }}
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm ${
                        formErrors.template ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Template</option>
                      {templates.filter(t => t.status === 'approved').map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.category})
                        </option>
                      ))}
                    </select>
                    {formErrors.template && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.template}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#004d66] mb-1">Language</label>
                    <select
                      value={newCampaign.template_language}
                      onChange={(e) => setNewCampaign({...newCampaign, template_language: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                    >
                      <option value="en">English</option>
                      <option value="sw">Swahili</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Delivery Configuration */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-[#004d66] border-b border-gray-200 pb-2">Delivery Configuration</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#004d66] mb-1">Delivery Time</label>
                    <select
                      value={newCampaign.delivery_time}
                      onChange={(e) => setNewCampaign({...newCampaign, delivery_time: e.target.value as 'immediate' | 'scheduled'})}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                    >
                      <option value="immediate">Send Immediately</option>
                      <option value="scheduled">Schedule for Later</option>
                    </select>
                  </div>

                  {newCampaign.delivery_time === 'scheduled' && (
                    <div>
                      <label className="block text-sm font-medium text-[#004d66] mb-1">Scheduled Time</label>
                      <input
                        type="datetime-local"
                        value={newCampaign.scheduled_at}
                        onChange={(e) => setNewCampaign({...newCampaign, scheduled_at: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#004d66] mb-1">Notification URL (Optional)</label>
                    <input
                      type="url"
                      value={newCampaign.notify_url}
                      onChange={(e) => setNewCampaign({...newCampaign, notify_url: e.target.value})}
                      placeholder="https://your-domain.com/webhook"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Webhook URL for delivery status updates</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#004d66] mb-1">Callback Data (Optional)</label>
                    <input
                      type="text"
                      value={newCampaign.callback_data}
                      onChange={(e) => setNewCampaign({...newCampaign, callback_data: e.target.value})}
                      placeholder="Custom data for tracking"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Custom data returned in webhook</p>
                  </div>
                </div>
              </div>

              {/* Audience Targeting */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-[#004d66] border-b border-gray-200 pb-2">Audience Targeting</h4>
                
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
                    <option value="custom">Custom Phone Numbers</option>
                  </select>
                </div>
                
                {newCampaign.target_audience.type === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-[#004d66] mb-1">Phone Numbers *</label>
                    <textarea
                      value={newCampaign.target_audience.phone_numbers?.join('\n') || ''}
                      onChange={(e) => {
                        const phoneNumbers = e.target.value.split('\n').filter(phone => phone.trim());
                        setNewCampaign({
                          ...newCampaign,
                          target_audience: {
                            ...newCampaign.target_audience,
                            phone_numbers: phoneNumbers
                          }
                        });
                        if (formErrors.phone_numbers) {
                          setFormErrors({...formErrors, phone_numbers: undefined});
                        }
                      }}
                      rows={4}
                      placeholder="Enter phone numbers in international format, one per line&#10;Example: +1234567890&#10;+9876543210"
                      className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm ${
                        formErrors.phone_numbers ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.phone_numbers && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.phone_numbers}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Use international format (e.g., +1234567890). One number per line.
                    </p>
                  </div>
                )}
              </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <ModalButton
              onClick={() => setShowCreateForm(false)}
              variant="secondary"
              size="sm"
            >
              Cancel
            </ModalButton>
            <ModalButton
              onClick={() => {
                console.log('Modal Create Campaign button clicked');
                console.log('Form state:', newCampaign);
                console.log('Button disabled?', !newCampaign.name.trim() || !newCampaign.template_id || !newCampaign.message_id.trim() || (newCampaign.target_audience.type === 'custom' && (!newCampaign.target_audience.phone_numbers || newCampaign.target_audience.phone_numbers.length === 0)));
                handleCreateCampaign();
              }}
              disabled={false}
              variant="primary"
              size="sm"
            >
              Create Campaign
            </ModalButton>
          </div>
        </div>
      </StandardModal>

      {/* Preview Modal */}
      <StandardModal
        isOpen={!!showPreview}
        onClose={() => setShowPreview(null)}
        title="Campaign Preview"
        size="sm"
      >
        {(() => {
          const campaign = campaigns.find(c => c.id === showPreview);
          const template = templates.find(t => t.id === campaign?.template_id);
          return campaign ? (
            <div className="space-y-3">
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
      </StandardModal>

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
