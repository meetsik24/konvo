import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, 
  Shield, 
  FileText, 
  Megaphone, 
  Bot, 
  MessageCircle,
  Lock,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { WABAStatus, WhatsAppTemplate, WhatsAppCampaign, ChatConversation, AutomationFlow } from '../types/whatsapp';

// Import components
import OnboardingModal from '../components/whatsapp/OnboardingModal';
import MessagingTab from '../components/whatsapp/MessagingTab';
import TemplatesTab from '../components/whatsapp/TemplatesTab';
import CampaignsTab from '../components/whatsapp/CampaignsTab';
import AutomationTab from '../components/whatsapp/AutomationTab';

const WhatsApp: React.FC = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'messaging' | 'templates' | 'campaigns' | 'automation'>('messaging');
  const [wabaStatus, setWabaStatus] = useState<WABAStatus>({
    status: 'not_connected',
    last_updated: new Date().toISOString()
  });
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [flows, setFlows] = useState<AutomationFlow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  useEffect(() => {
    const fetchWhatsAppData = async () => {
      setIsLoading(true);
      try {
        if (!currentWorkspaceId) throw new Error('No workspace selected.');
        
        // Check if user has already completed onboarding
        const savedWabaStatus = localStorage.getItem('whatsapp_waba_status');
        if (savedWabaStatus) {
          const parsedStatus = JSON.parse(savedWabaStatus);
          setWabaStatus(parsedStatus);
      } else {
          // First time user - show onboarding modal
          setShowOnboardingModal(true);
        }
        
        setTemplates([
          {
            id: '1',
            name: 'Welcome Message',
            category: 'transactional',
            status: 'approved',
            content: 'Welcome to {{business_name}}! How can we help you today?',
            variables: ['business_name'],
            created_at: new Date().toISOString(),
            language: 'en'
          },
          {
            id: '2',
            name: 'Order Confirmation',
            category: 'transactional',
            status: 'approved',
            content: 'Your order #{{order_id}} has been confirmed. Total: {{amount}}',
            variables: ['order_id', 'amount'],
            created_at: new Date().toISOString(),
            language: 'en'
          },
          {
            id: '3',
            name: 'Promotional Offer',
            category: 'marketing',
            status: 'pending',
            content: 'Special offer! Get {{discount}}% off on {{product_name}}. Use code: {{coupon_code}}',
            variables: ['discount', 'product_name', 'coupon_code'],
            created_at: new Date().toISOString(),
            language: 'en'
          }
        ]);
        
        setCampaigns([
          {
            id: '1',
            name: 'Summer Sale Campaign',
            template_id: '3',
            status: 'running',
            audience_count: 1500,
            sent_count: 1200,
            delivered_count: 1150,
            read_count: 800,
            response_rate: 12,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Welcome New Users',
            template_id: '1',
            status: 'scheduled',
            audience_count: 500,
            sent_count: 0,
            delivered_count: 0,
            read_count: 0,
            response_rate: 0,
            created_at: new Date().toISOString(),
            scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
        
        setConversations([
          {
            id: '1',
            customer_name: 'John Doe',
            customer_phone: '+255123456789',
            last_message: 'Hello, I need help with my order',
            last_message_time: '2 minutes ago',
            unread_count: 1,
            status: 'active',
            assigned_agent: 'Agent 1',
            tags: ['support', 'order'],
            messages: [
              {
                id: '1',
                content: 'Hello, I need help with my order',
                type: 'text',
                sender: 'customer',
                timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
              }
            ]
          },
          {
            id: '2',
            customer_name: 'Jane Smith',
            customer_phone: '+255987654321',
            last_message: 'Thank you for the quick response!',
            last_message_time: '1 hour ago',
            unread_count: 0,
            status: 'active',
            assigned_agent: 'Agent 2',
            tags: ['satisfied'],
            messages: [
              {
                id: '2',
                content: 'Thank you for the quick response!',
                type: 'text',
                sender: 'customer',
                timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString()
              }
            ]
          }
        ]);
        
        setFlows([
          {
            id: '1',
            name: 'Welcome New Customers',
            trigger: 'welcome',
            status: 'active',
            steps: [
              {
                id: '1',
                type: 'message',
                content: 'Welcome to our store! How can we help you today?',
                next_step_id: '2'
              },
              {
                id: '2',
                type: 'quick_reply',
                options: ['Browse Products', 'Track Order', 'Contact Support'],
                next_step_id: '3'
              }
            ],
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Order Status Inquiry',
            trigger: 'keyword',
            status: 'inactive',
            steps: [
              {
                id: '1',
                type: 'message',
                content: 'Please provide your order number to check status',
                next_step_id: '2'
              }
            ],
            created_at: new Date().toISOString()
          }
        ]);
        
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load WhatsApp data.';
      setError(errorMessage);
    } finally {
        setIsLoading(false);
      }
    };
    fetchWhatsAppData();
  }, [currentWorkspaceId]);

  const handleOnboardingComplete = (newWabaStatus: WABAStatus) => {
    setWabaStatus(newWabaStatus);
    setShowOnboardingModal(false);
    // Save to localStorage
    localStorage.setItem('whatsapp_waba_status', JSON.stringify(newWabaStatus));
  };

  const handleOpenOnboarding = () => {
    setShowOnboardingModal(true);
  };

  const isWhatsAppReady = wabaStatus.status === 'verified' || wabaStatus.status === 'pending';

  const tabs = [
    { 
      id: 'messaging', 
      label: 'Messaging Dashboard', 
      icon: MessageSquare,
      description: 'Manage conversations and chat with customers'
    },
    { 
      id: 'templates', 
      label: 'Template Management', 
      icon: FileText,
      description: 'Create and manage message templates'
    },
    { 
      id: 'campaigns', 
      label: 'Campaign Management', 
      icon: Megaphone,
      description: 'Create and run broadcast campaigns'
    },
    { 
      id: 'automation', 
      label: 'Automation & Flows', 
      icon: Bot,
      description: 'Build automated conversation flows'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-6 w-6 text-[#004d66]" viewBox="0 0 24 24" aria-label="Loading">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="ml-3 text-[#004d66] text-sm">Loading WhatsApp Business...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-[#f5f5f5] min-h-screen font-inter">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-[#25D366]" />
            <div>
              <h1 className="text-2xl font-semibold text-[#004d66]">WhatsApp Business</h1>
              <p className="text-sm text-gray-600">Manage your WhatsApp Business communications</p>
            </div>
          </div>
          
          {/* Status Indicator */}
          {wabaStatus.status !== 'not_connected' && (
            <div className="flex items-center gap-2">
              {wabaStatus.status === 'verified' ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Verified
                </div>
              ) : wabaStatus.status === 'pending' ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  Pending Verification
                </div>
              ) : wabaStatus.status === 'rejected' ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  <XCircle className="w-4 h-4" />
                  Verification Rejected
                </div>
              ) : null}
              
              <button
                onClick={handleOpenOnboarding}
                className="px-3 py-1 text-sm text-[#25D366] hover:bg-gray-100 rounded-md transition-colors"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="border border-red-200 bg-red-50 p-3 text-red-700 text-sm font-medium rounded-md text-center mb-6"
        >
          {error}
        </motion.div>
      )}

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2 border-b border-gray-300 mb-6"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            className={`py-3 px-4 text-sm font-medium flex items-center gap-2 rounded-t-md transition-colors ${
              activeTab === tab.id 
                ? 'border-b-2 border-[#25D366] text-[#25D366] bg-white' 
                : 'text-gray-600 hover:text-[#25D366] hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <tab.icon className="w-5 h-5" />
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              {tab.label}
            </motion.span>
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
        <motion.div
        key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        className="bg-white rounded-md p-6 border border-gray-200"
      >
        {!isWhatsAppReady ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-[#004d66] mb-4">WhatsApp Business Not Set Up</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Complete the WhatsApp Business setup to start using messaging, templates, campaigns, and automation features.
            </p>
                          <button
              onClick={handleOpenOnboarding}
              className="px-6 py-3 bg-[#25D366] text-white rounded-md hover:bg-[#1DA851] transition-colors flex items-center gap-2 mx-auto"
                          >
              <Shield className="w-5 h-5" />
              Set Up WhatsApp Business
                          </button>
                      </div>
                    ) : (
          <>
            {activeTab === 'messaging' && (
              <MessagingTab conversations={conversations} setConversations={setConversations} />
            )}
            {activeTab === 'templates' && (
              <TemplatesTab templates={templates} setTemplates={setTemplates} />
            )}
            {activeTab === 'campaigns' && (
              <CampaignsTab campaigns={campaigns} setCampaigns={setCampaigns} templates={templates} />
            )}
            {activeTab === 'automation' && (
              <AutomationTab flows={flows} setFlows={setFlows} />
            )}
                  </>
                )}
        </motion.div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onComplete={handleOnboardingComplete}
        wabaStatus={wabaStatus}
      />
    </div>
  );
};

export default WhatsApp;
