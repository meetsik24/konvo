import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  Copy, 
  Edit, 
  Trash2,
  Search
} from 'lucide-react';
import { WhatsAppTemplate } from '../../types/whatsapp';
import StandardModal from './StandardModal';
import ModalButton from './ModalButton';

interface TemplatesTabProps {
  templates: WhatsAppTemplate[];
  setTemplates: (templates: WhatsAppTemplate[]) => void;
}

const TemplatesTab: React.FC<TemplatesTabProps> = ({ templates, setTemplates }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'transactional' as const,
    content: '',
    language: 'en'
  });


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'disabled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'paused':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'pending_deletion':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'deleted':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getQualityScore = (score?: number) => {
    if (!score) return null;
    if (score >= 80) return { color: 'text-green-600', label: 'High Quality' };
    if (score >= 60) return { color: 'text-yellow-600', label: 'Medium Quality' };
    return { color: 'text-red-600', label: 'Low Quality' };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'transactional':
        return 'bg-blue-100 text-blue-800';
      case 'marketing':
        return 'bg-purple-100 text-purple-800';
      case 'otp':
        return 'bg-orange-100 text-orange-800';
      case 'notification':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || template.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) return;

    const template: WhatsAppTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      category: newTemplate.category,
      status: 'pending',
      content: newTemplate.content,
      variables: extractVariables(newTemplate.content),
      created_at: new Date().toISOString(),
      language: newTemplate.language
    };

    setTemplates([...templates, template]);
    setNewTemplate({ name: '', category: 'transactional', content: '', language: 'en' });
    setShowCreateForm(false);
  };

  const extractVariables = (content: string): string[] => {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const matches = content.match(variableRegex);
    return matches ? matches.map(match => match.replace(/\{\{|\}\}/g, '')) : [];
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(t => t.id !== templateId));
  };

  const handleCopyTemplate = (template: WhatsAppTemplate) => {
    const copiedTemplate: WhatsAppTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    setTemplates([...templates, copiedTemplate]);
  };

  const stats = {
    total: templates.length,
    approved: templates.filter(t => t.status === 'approved').length,
    pending: templates.filter(t => t.status === 'pending').length,
    rejected: templates.filter(t => t.status === 'rejected').length
  };

  return (
    <div className="h-full bg-[#f5f5f5] p-2 sm:p-4 space-y-3 sm:space-y-4">
      {/* Header - Mobile Responsive */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#004d66] rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-lg font-semibold text-[#004d66] truncate">Template Management</h2>
            <p className="text-xs text-gray-600 hidden sm:block">Create and manage your WhatsApp message templates</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#004d66] text-white rounded hover:bg-[#003d52] flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium transition-colors flex-shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">Create Template</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Template Stats - Mobile Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-2 sm:p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Approved</p>
              <p className="text-lg sm:text-2xl font-bold text-[#004d66] mt-1">{stats.approved}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
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
              <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-[#004d66] mt-1">{stats.pending}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
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
              <p className="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-lg sm:text-2xl font-bold text-[#004d66] mt-1">{stats.rejected}</p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
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
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-[#004d66] mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-[#004d66] rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter - Mobile Responsive */}
      <div className="bg-white p-2 sm:p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-2 sm:gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent bg-white text-sm"
            >
              <option value="all">All Categories</option>
              <option value="transactional">Transactional</option>
              <option value="marketing">Marketing</option>
              <option value="otp">OTP</option>
              <option value="notification">Notification</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Templates List - Mobile Responsive */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">Create your first template to get started</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#004d66] text-white rounded-lg hover:bg-[#003d52] flex items-center gap-1.5 sm:gap-2 mx-auto text-sm sm:text-base"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Create Template</span>
              <span className="sm:hidden">Create</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 sm:p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-2 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#004d66] rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                                  <h3 className="font-medium text-[#004d66] truncate text-sm sm:text-base">{template.name}</h3>
                                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                                    {template.status}
                                  </span>
                                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                                    {template.category}
                                  </span>
                                  {template.quality_score && (
                                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getQualityScore(template.quality_score)?.color} bg-gray-100`}>
                                      {template.quality_score}/100
                                    </span>
                                  )}
                                </div>
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <button 
                          onClick={() => setShowPreview(template.id)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-[#004d66] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => handleCopyTemplate(template)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-[#004d66] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-[#004d66] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{template.content}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 gap-1 sm:gap-0">
                      <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                      <span>{template.variables.length} variables</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      <StandardModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create New Template"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Design a message template for your broadcasts</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#004d66] mb-1">Template Name</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="e.g., Welcome Message"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#004d66] mb-1">Category</label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                  >
                    <option value="transactional">Transactional</option>
                    <option value="marketing">Marketing</option>
                    <option value="otp">OTP</option>
                    <option value="notification">Notification</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#004d66] mb-1">Language</label>
                <select
                  value={newTemplate.language}
                  onChange={(e) => setNewTemplate({...newTemplate, language: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#004d66] mb-1">Content</label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                  placeholder="Enter your template content here... Use {{variable_name}} for dynamic content"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{{variable}}'} for dynamic content (e.g., {'{{name}}'}, {'{{amount}}'})
                </p>
              </div>
              {newTemplate.content && extractVariables(newTemplate.content).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#004d66] mb-1">Detected Variables</label>
                  <div className="flex flex-wrap gap-1">
                    {extractVariables(newTemplate.content).map((variable, index) => (
                      <span key={index} className="px-2 py-1 bg-[#25D366] text-white rounded text-xs">
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <ModalButton
              onClick={() => setShowCreateForm(false)}
              variant="secondary"
              size="sm"
            >
              Cancel
            </ModalButton>
            <ModalButton
              onClick={handleCreateTemplate}
              disabled={!newTemplate.name.trim() || !newTemplate.content.trim()}
              variant="primary"
              size="sm"
            >
              Create Template
            </ModalButton>
          </div>
        </div>
      </StandardModal>

      {/* Preview Modal */}
      <StandardModal
        isOpen={!!showPreview}
        onClose={() => setShowPreview(null)}
        title="Template Preview"
        size="sm"
      >
        {(() => {
          const template = templates.find(t => t.id === showPreview);
          return template ? (
            <div className="space-y-3">
                  <div className="bg-[#F0F2F5] p-3 rounded-md border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Template Content:</p>
                    <p className="text-sm leading-relaxed">{template.content}</p>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(template.status)}`}>
                        {template.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Variables:</span>
                      <span className="text-gray-900">{template.variables.length}</span>
                    </div>
                    {template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {template.variables.map((variable, index) => (
                          <span key={index} className="px-1.5 py-0.5 bg-[#25D366] text-white rounded text-xs">
                            {variable}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
            </div>
          ) : null;
        })()}
      </StandardModal>
    </div>
  );
};

export default TemplatesTab;
