import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Phone, 
  Settings, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  User,
  Clock,
  Tag,
  Mic,
  Image,
  FileText,
  MapPin
} from 'lucide-react';
import { ChatConversation, ChatMessage } from '../../types/whatsapp';

interface MessagingTabProps {
  conversations: ChatConversation[];
  setConversations: (conversations: ChatConversation[]) => void;
}

const MessagingTab: React.FC<MessagingTabProps> = ({ conversations, setConversations }) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed' | 'pending'>('all');
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.customer_phone.includes(searchQuery) ||
                         conv.last_message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || conv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-6 h-6 text-[#25D366]" />
        <h2 className="text-xl font-semibold text-[#004d66]">Messaging Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
              >
                <option value="all">All Conversations</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
              </select>
              <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversations */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation === conversation.id
                    ? 'bg-[#25D366] text-white'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <h4 className="font-medium truncate">{conversation.customer_name}</h4>
                  </div>
                  {conversation.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unread_count}
                    </span>
                  )}
                </div>
                <p className={`text-sm truncate ${
                  selectedConversation === conversation.id ? 'opacity-75' : 'text-gray-600'
                }`}>
                  {conversation.last_message}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${
                    selectedConversation === conversation.id ? 'opacity-75' : 'text-gray-500'
                  }`}>
                    {conversation.last_message_time}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      conversation.status === 'active' ? 'bg-green-100 text-green-800' :
                      conversation.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {conversation.status}
                    </span>
                    {conversation.assigned_agent && (
                      <span className="text-xs opacity-75">
                        {conversation.assigned_agent}
                      </span>
                    )}
                  </div>
                </div>
                {conversation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conversation.tags.slice(0, 2).map((tag, index) => (
                      <span key={index} className="text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedConversation && selectedConv ? (
            <div className="border border-gray-200 rounded-lg h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#004d66]">{selectedConv.customer_name}</h3>
                      <p className="text-sm text-gray-600">{selectedConv.customer_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 hover:text-[#25D366] hover:bg-gray-100 rounded-md">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-[#25D366] hover:bg-gray-100 rounded-md">
                      <Tag className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-[#25D366] hover:bg-gray-100 rounded-md">
                      <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-[#25D366] hover:bg-gray-100 rounded-md">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
                {selectedConv.messages && selectedConv.messages.length > 0 ? (
                  selectedConv.messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'agent' 
                          ? 'bg-[#25D366] text-white' 
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'agent' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No messages yet</p>
                    <p className="text-sm text-gray-500">Start the conversation</p>
                  </div>
                )}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:text-[#25D366] hover:bg-gray-100 rounded-md">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-[#25D366] hover:bg-gray-100 rounded-md">
                    <Image className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-[#25D366] hover:bg-gray-100 rounded-md">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-[#25D366] hover:bg-gray-100 rounded-md">
                    <MapPin className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                  />
                  <button className="p-2 text-gray-600 hover:text-[#25D366] hover:bg-gray-100 rounded-md">
                    <Smile className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-[#25D366] hover:bg-gray-100 rounded-md">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-[#25D366] text-white rounded-md hover:bg-[#1DA851] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingTab;
