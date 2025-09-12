import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Settings, 
  Eye, 
  Copy, 
  Edit, 
  Trash2,
  Search,
  Filter,
  Upload,
  Download
} from 'lucide-react';
import { WhatsAppTemplate } from '../../types/whatsapp';

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-[#25D366]" />
          <h2 className="text-xl font-semibold text-[#004d66]">Template Management</h2>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#1DA851] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Template Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Approved</span>
          </div>
          <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.approved}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.pending}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium">Rejected</span>
          </div>
          <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.rejected}</p>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-[#004d66] mt-1">{stats.total}</p>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
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
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Templates List */}
      <div className="space-y-4">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No templates found</p>
            <p className="text-sm text-gray-500">Create your first template to get started</p>
          </div>
        ) : (
          filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-[#004d66]">{template.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                    {template.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                  {template.language && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      {template.language.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(template.status)}
                  <button 
                    onClick={() => setShowPreview(template.id)}
                    className="p-1 text-gray-600 hover:text-[#25D366]"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleCopyTemplate(template)}
                    className="p-1 text-gray-600 hover:text-[#25D366]"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-600 hover:text-[#25D366]" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="p-1 text-gray-600 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{template.content}</p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                <span>Variables: {template.variables.length}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-medium text-[#004d66] mb-4">Create New Template</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="e.g., Welcome Message"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  >
                    <option value="transactional">Transactional</option>
                    <option value="marketing">Marketing</option>
                    <option value="otp">OTP</option>
                    <option value="notification">Notification</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select
                  value={newTemplate.language}
                  onChange={(e) => setNewTemplate({...newTemplate, language: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newTemplate.content}
                  onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                  rows={6}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  placeholder="Enter your template content here... Use {{variable_name}} for dynamic content"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use double curly braces for variables: {{name}}, {{amount}}, etc.
                </p>
              </div>
              {newTemplate.content && extractVariables(newTemplate.content).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Detected Variables</label>
                  <div className="flex flex-wrap gap-2">
                    {extractVariables(newTemplate.content).map((variable, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {variable}
                      </span>
                    ))}
                  </div>
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
                onClick={handleCreateTemplate}
                disabled={!newTemplate.name.trim() || !newTemplate.content.trim()}
                className="px-4 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#1DA851] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Template
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
              <h3 className="text-lg font-medium text-[#004d66]">Template Preview</h3>
              <button
                onClick={() => setShowPreview(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            {(() => {
              const template = templates.find(t => t.id === showPreview);
              return template ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Template Content:</p>
                    <p className="text-sm">{template.content}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>Category: {template.category}</p>
                    <p>Status: {template.status}</p>
                    <p>Variables: {template.variables.join(', ')}</p>
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

export default TemplatesTab;
