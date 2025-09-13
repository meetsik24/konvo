import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Plus, 
  MessageSquare, 
  Zap, 
  Clock, 
  Settings, 
  Play, 
  Pause, 
  Edit, 
  Trash2,
  Search,
  ArrowRight,
  Circle,
  Diamond
} from 'lucide-react';
import { AutomationFlow } from '../../types/whatsapp';
import StandardModal from './StandardModal';
import ModalButton from './ModalButton';

interface AutomationTabProps {
  flows: AutomationFlow[];
  setFlows: (flows: AutomationFlow[]) => void;
}

const AutomationTab: React.FC<AutomationTabProps> = ({ flows, setFlows }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFlowBuilder, setShowFlowBuilder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrigger, setFilterTrigger] = useState<string>('all');
  const [newFlow, setNewFlow] = useState({
    name: '',
    trigger: 'welcome' as const,
    description: ''
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <Pause className="w-5 h-5 text-gray-500" />;
      default:
        return <Pause className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'inactive':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'welcome':
        return <MessageSquare className="w-5 h-5" />;
      case 'keyword':
        return <Zap className="w-5 h-5" />;
      case 'time_based':
        return <Clock className="w-5 h-5" />;
      case 'event':
        return <Circle className="w-5 h-5" />;
      case 'webhook':
        return <Diamond className="w-5 h-5" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      case 'quick_reply':
        return <Zap className="w-4 h-4" />;
      case 'condition':
        return <Diamond className="w-4 h-4" />;
      case 'delay':
        return <Clock className="w-4 h-4" />;
      case 'webhook':
        return <Circle className="w-4 h-4" />;
      case 'assign_agent':
        return <Settings className="w-4 h-4" />;
      default:
        return <Circle className="w-4 h-4" />;
    }
  };

  const filteredFlows = flows.filter(flow => {
    const matchesSearch = flow.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrigger = filterTrigger === 'all' || flow.trigger === filterTrigger;
    return matchesSearch && matchesTrigger;
  });

  const handleCreateFlow = () => {
    if (!newFlow.name.trim()) return;

    const flow: AutomationFlow = {
      id: Date.now().toString(),
      name: newFlow.name,
      trigger: newFlow.trigger,
      status: 'inactive',
      steps: [],
      created_at: new Date().toISOString()
    };

    setFlows([...flows, flow]);
    setNewFlow({ name: '', trigger: 'welcome', description: '' });
    setShowCreateForm(false);
  };

  const handleDeleteFlow = (flowId: string) => {
    setFlows(flows.filter(f => f.id !== flowId));
  };

  const handleStatusToggle = (flowId: string) => {
    setFlows(flows.map(f => 
      f.id === flowId 
        ? { ...f, status: f.status === 'active' ? 'inactive' : 'active' }
        : f
    ));
  };

  const flowTypes = [
    { 
      id: 'welcome', 
      name: 'Welcome Messages', 
      // description: 'Auto-reply to new conversations',
      icon: MessageSquare,
      color: 'text-blue-500'
    },
    { 
      id: 'keyword', 
      name: 'Keyword Responses', 
      // description: 'Respond to specific keywords',
      icon: Zap,
      color: 'text-purple-500'
    },
    { 
      id: 'time_based', 
      name: 'Time-based', 
      // description: 'Scheduled automated messages',
      icon: Clock,
      color: 'text-orange-500'
    },
    { 
      id: 'event', 
      name: 'Event Triggers', 
      // description: 'Triggered by specific events',
      icon: Circle,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header - Mobile Responsive */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#004d66] rounded-lg flex items-center justify-center flex-shrink-0">
            <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-lg font-semibold text-[#004d66] truncate">Automation & Flows</h2>
            <p className="text-xs text-gray-600 hidden sm:block">Create and manage automated workflows</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#004d66] text-white rounded hover:bg-[#003d52] flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium transition-colors flex-shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span className="hidden sm:inline">Create Flow</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Flow Types - Mobile Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {flowTypes.map((type, index) => (
          <motion.div
            key={type.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-2 sm:p-4 rounded-lg border border-gray-200 text-center hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setNewFlow({...newFlow, trigger: type.id as any})}
          >
            <type.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${type.color} mx-auto mb-1 sm:mb-2`} />
            <h3 className="font-medium text-[#004d66] text-sm sm:text-base">{type.name}</h3>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
          <input
            type="text"
            placeholder="Search flows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-6 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
          />
        </div>
        <select
          value={filterTrigger}
          onChange={(e) => setFilterTrigger(e.target.value)}
          className="px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
        >
          <option value="all">All Triggers</option>
          <option value="welcome">Welcome</option>
          <option value="keyword">Keyword</option>
          <option value="time_based">Time-based</option>
          <option value="event">Event</option>
          <option value="webhook">Webhook</option>
        </select>
      </div>

      {/* Flows List - Mobile Responsive */}
      <div className="space-y-3 sm:space-y-4">
        {filteredFlows.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600">No automation flows created yet</p>
            <p className="text-xs sm:text-sm text-gray-500">Create flows to automate your customer interactions</p>
          </div>
        ) : (
          filteredFlows.map((flow, index) => (
            <motion.div
              key={flow.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2">
                    {getTriggerIcon(flow.trigger)}
                    <h3 className="font-medium text-[#004d66] text-sm sm:text-base">{flow.name}</h3>
                  </div>
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {flow.trigger}
                  </span>
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getStatusColor(flow.status)}`}>
                    {flow.status}
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  {getStatusIcon(flow.status)}
                  <button 
                    onClick={() => setShowFlowBuilder(flow.id)}
                    className="p-1 text-gray-600 hover:text-[#25D366]"
                    title="Edit Flow"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button 
                    onClick={() => handleStatusToggle(flow.id)}
                    className={`p-1 hover:text-[#25D366] ${
                      flow.status === 'active' ? 'text-green-600' : 'text-gray-600'
                    }`}
                    title={flow.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    {flow.status === 'active' ? <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4" />}
                  </button>
                  <button 
                    onClick={() => handleDeleteFlow(flow.id)}
                    className="p-1 text-gray-600 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
              
              {/* Flow Steps Preview - Mobile Responsive */}
              <div className="mb-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <span>Steps: {flow.steps.length}</span>
                  <span>•</span>
                  <span>Created: {new Date(flow.created_at).toLocaleDateString()}</span>
                </div>
                
                {flow.steps.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 sm:gap-2 overflow-x-auto">
                    {flow.steps.slice(0, 5).map((step, stepIndex) => (
                      <div key={step.id} className="flex items-center gap-1">
                        <div className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 rounded text-xs">
                          {getStepIcon(step.type)}
                          <span className="hidden sm:inline">{step.type}</span>
                          <span className="sm:hidden">{step.type.charAt(0)}</span>
                        </div>
                        {stepIndex < flow.steps.length - 1 && stepIndex < 4 && (
                          <ArrowRight className="w-2 h-2 sm:w-3 sm:h-3 text-gray-400" />
                        )}
                      </div>
                    ))}
                    {flow.steps.length > 5 && (
                      <span className="text-xs text-gray-500">+{flow.steps.length - 5} more</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Flow Modal */}
      <StandardModal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title="Create New Flow"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Set up a new automation flow</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flow Name</label>
            <input
              type="text"
              value={newFlow.name}
              onChange={(e) => setNewFlow({...newFlow, name: e.target.value})}
              placeholder="e.g., Welcome Message Flow"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trigger Type</label>
            <select
              value={newFlow.trigger}
              onChange={(e) => setNewFlow({...newFlow, trigger: e.target.value as any})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
            >
              {flowTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={newFlow.description}
              onChange={(e) => setNewFlow({...newFlow, description: e.target.value})}
              rows={3}
              placeholder="Describe what this flow does..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
            />
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
              onClick={handleCreateFlow}
              disabled={!newFlow.name.trim()}
              variant="primary"
              size="sm"
            >
              Create Flow
            </ModalButton>
          </div>
        </div>
      </StandardModal>

      {/* Flow Builder Modal */}
      <StandardModal
        isOpen={!!showFlowBuilder}
        onClose={() => setShowFlowBuilder(null)}
        title="Flow Builder"
        size="xl"
      >
        {(() => {
          const flow = flows.find(f => f.id === showFlowBuilder);
          return flow ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Build and configure your automation flow</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800">{flow.name}</h4>
                <p className="text-sm text-gray-600">Trigger: {flow.trigger}</p>
                <p className="text-sm text-gray-600">Status: {flow.status}</p>
              </div>
              
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Flow builder coming soon</p>
                <p className="text-sm text-gray-500">Drag and drop interface for building automation flows</p>
              </div>
            </div>
          ) : null;
        })()}
      </StandardModal>
    </div>
  );
};

export default AutomationTab;
