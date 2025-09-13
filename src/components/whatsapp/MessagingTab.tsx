import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Phone, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  User,
  Tag,
  Mic,
  Image,
  FileText,
  MapPin,
  Megaphone,
  XCircle,
  Users
} from 'lucide-react';
import { ChatConversation, ChatMessage, WhatsAppTemplate } from '../../types/whatsapp';

interface MessagingTabProps {
  conversations: ChatConversation[];
  setConversations: (conversations: ChatConversation[]) => void;
}

const MessagingTab: React.FC<MessagingTabProps> = ({ conversations, setConversations }) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showBulkMessaging, setShowBulkMessaging] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState('');
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sample templates
  const templates: WhatsAppTemplate[] = [
    {
      id: '1',
      name: 'Welcome Message',
      content: 'Hello {{name}}, welcome to our service! We\'re excited to have you on board.',
      category: 'transactional',
      status: 'approved',
      language: 'en',
      variables: ['name'],
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Order Confirmation',
      content: 'Hi {{name}}, your order #{{order_id}} has been confirmed and will be delivered soon.',
      category: 'transactional',
      status: 'approved',
      language: 'en',
      variables: ['name', 'order_id'],
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '3',
      name: 'Promotional Offer',
      content: '🎉 Special offer for {{name}}! Get 20% off on your next purchase. Use code: SAVE20',
      category: 'marketing',
      status: 'approved',
      language: 'en',
      variables: ['name'],
      created_at: '2024-01-15T10:00:00Z'
    }
  ];

  // Sample agents for assignment
  const agents = ['Agent 1', 'Agent 2', 'Agent 3', 'Unassigned'];

  const filteredConversations = conversations.filter(conv => 
    conv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.customer_phone.includes(searchQuery) ||
    conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConv?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      type: 'text',
      sender: 'agent',
      timestamp: new Date().toISOString(),
    };

    setConversations(conversations.map(conv => 
      conv.id === selectedConversation 
        ? {
            ...conv,
            messages: [...(conv.messages || []), newMsg],
            last_message: newMessage,
            last_message_time: 'Just now',
            unread_count: 0
          }
        : conv
    ));

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleBulkSend = () => {
    if (!bulkMessage.trim() || selectedAudience.length === 0) return;

    selectedAudience.forEach(convId => {
      const conversation = conversations.find(c => c.id === convId);
      if (conversation) {
        const newMsg: ChatMessage = {
          id: Date.now().toString() + Math.random(),
          content: bulkMessage,
          type: 'text',
          sender: 'agent',
          timestamp: new Date().toISOString(),
        };

        setConversations(conversations.map(conv => 
          conv.id === convId 
            ? {
                ...conv,
                messages: [...(conv.messages || []), newMsg],
                last_message: bulkMessage,
                last_message_time: 'Just now',
                unread_count: 0
              }
            : conv
        ));
      }
    });

    setBulkMessage('');
    setSelectedAudience([]);
    setShowBulkMessaging(false);
  };

  const handleTemplateSelect = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setBulkMessage(template.content);
  };

  const handleAudienceToggle = (convId: string) => {
    setSelectedAudience(prev => 
      prev.includes(convId) 
        ? prev.filter(id => id !== convId)
        : [...prev, convId]
    );
  };

  const handleAssignAgent = (convId: string, agent: string) => {
    setConversations(conversations.map(conv => 
      conv.id === convId 
        ? { ...conv, assigned_agent: agent === 'Unassigned' ? undefined : agent }
        : conv
    ));
  };

  const handleStartNewChat = (convId: string) => {
    setSelectedConversation(convId);
    setShowContactPicker(false);
    setContactSearch('');
  };

  return (
    <div className="h-[600px] flex bg-[#ECE5DD] rounded-lg overflow-hidden font-sans">
      {/* Sidebar - Conversations List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-[#F0F2F5] p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-8 h-8 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowContactPicker(true)} 
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
              title="New Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowBulkMessaging(true)}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
              title="Bulk Messaging"
            >
              <Megaphone className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F0F2F5] rounded-full text-sm focus:ring-1 focus:ring-[#25D366] focus:bg-white"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedConversation(conversation.id)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-[#F0F2F5] transition-colors ${
                selectedConversation === conversation.id ? 'bg-[#EBEDF0]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  {conversation.unread_count > 0 && (
                    <div className="absolute top-0 right-0 w-5 h-5 bg-[#25D366] text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.unread_count}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{conversation.customer_name}</h4>
                    <span className="text-xs text-gray-500">{conversation.last_message_time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.last_message}</p>
                  {conversation.assigned_agent && (
                    <span className="text-xs text-gray-500">{conversation.assigned_agent}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#ECE5DD]">
        {selectedConversation && selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#F0F2F5] p-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{selectedConv.customer_name}</h3>
                  <p className="text-xs text-gray-600">{selectedConv.customer_phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
                  <Phone className="w-5 h-5" />
                </button>
                <select
                  value={selectedConv.assigned_agent || 'Unassigned'}
                  onChange={(e) => handleAssignAgent(selectedConv.id, e.target.value)}
                  className="p-2 text-sm text-gray-600 bg-transparent border-none focus:ring-0"
                >
                  {agents.map(agent => (
                    <option key={agent} value={agent}>{agent}</option>
                  ))}
                </select>
                <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-[url('https://i.imgur.com/5zKXz7W.png')] bg-repeat">
              {selectedConv.messages && selectedConv.messages.length > 0 ? (
                selectedConv.messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                      message.sender === 'agent' 
                        ? 'bg-[#DCF8C6] text-gray-900 rounded-br-none' 
                        : 'bg-white text-gray-900 rounded-bl-none'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-gray-500 text-right mt-1">{formatTime(message.timestamp)}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Start the conversation</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 bg-[#F0F2F5] flex items-center gap-2">
              <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
                <Smile className="w-5 h-5" />
              </button>
              <div className="relative group">
                <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="absolute bottom-12 left-0 hidden group-hover:flex flex-col bg-white rounded-lg shadow-lg p-2">
                  <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                    <Image className="w-5 h-5" /> Image
                  </button>
                  <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                    <FileText className="w-5 h-5" /> Document
                  </button>
                  <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                    <MapPin className="w-5 h-5" /> Location
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-3 bg-white rounded-full text-sm focus:ring-1 focus:ring-[#25D366]"
              />
              {newMessage.trim() ? (
                <button 
                  onClick={handleSendMessage}
                  className="p-2 bg-[#25D366] text-white rounded-full hover:bg-[#1DA851]"
                >
                  <Send className="w-5 h-5" />
                </button>
              ) : (
                <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
                  <Mic className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">WhatsApp</p>
              <p className="text-gray-500">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Messaging Modal */}
      {showBulkMessaging && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#25D366]" />
                <h3 className="text-lg font-semibold text-gray-900">New Broadcast</h3>
              </div>
              <button 
                onClick={() => setShowBulkMessaging(false)}
                className="p-2 text-gray-400 hover:bg-gray-200 rounded-full"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const template = templates.find(t => t.id === e.target.value);
                    if (template) handleTemplateSelect(template);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#25D366]"
                >
                  <option value="">Select a template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={bulkMessage}
                  onChange={(e) => setBulkMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#25D366] h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients ({selectedAudience.length})
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAudienceToggle(conversation.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAudience.includes(conversation.id)}
                        onChange={() => {}}
                        className="w-4 h-4 text-[#25D366] border-gray-300 rounded focus:ring-[#25D366]"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{conversation.customer_name}</p>
                        <p className="text-xs text-gray-600">{conversation.customer_phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowBulkMessaging(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkSend}
                  disabled={!bulkMessage.trim() || selectedAudience.length === 0}
                  className="px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1DA851] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send to {selectedAudience.length} contacts
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Contact Picker Modal */}
      {showContactPicker && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#25D366]" />
                <h3 className="text-lg font-semibold text-gray-900">New Chat</h3>
              </div>
              <button 
                onClick={() => setShowContactPicker(false)}
                className="p-2 text-gray-400 hover:bg-gray-200 rounded-full"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search contacts"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#F0F2F5] rounded-full text-sm focus:ring-1 focus:ring-[#25D366]"
                />
              </div>
              <div className="max-h-60 overflow-y-auto">
                {conversations
                  .filter(conv => 
                    conv.customer_name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                    conv.customer_phone.includes(contactSearch)
                  )
                  .map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleStartNewChat(conversation.id)}
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{conversation.customer_name}</p>
                        <p className="text-xs text-gray-600">{conversation.customer_phone}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MessagingTab;