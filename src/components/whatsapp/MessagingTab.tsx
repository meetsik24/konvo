import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import { 
  MessageSquare, 
  Search, 
  Phone, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical,
  User,
  Mic,
  Image,
  FileText,
  MapPin,
  Megaphone,
  XCircle,
  Users
} from 'lucide-react';
import { ChatConversation, ChatMessage, WhatsAppTemplate } from '../../types/whatsapp';
import StandardModal from './StandardModal';
import ModalButton from './ModalButton';

interface MessagingTabProps {
  conversations: ChatConversation[];
  setConversations: (conversations: ChatConversation[]) => void;
  templates: WhatsAppTemplate[];
  setTemplates: (templates: WhatsAppTemplate[]) => void;
}

const MessagingTab: React.FC<MessagingTabProps> = ({ conversations, setConversations, templates, setTemplates }) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showBulkMessaging, setShowBulkMessaging] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState('');
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messageType, setMessageType] = useState<'text' | 'image' | 'document' | 'location' | 'interactive' | 'contacts'>('text');
  const [showInteractiveBuilder, setShowInteractiveBuilder] = useState(false);
  const [interactiveType, setInteractiveType] = useState<'button' | 'list' | 'product' | 'product_list'>('button');
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'transactional' as const,
    content: '',
    language: 'en'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);



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

  // Close emoji and attachment menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.emoji-picker') && !target.closest('.attachment-menu')) {
        setShowEmojiPicker(false);
        setShowAttachmentMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            ...     conv,
            messages: [...(conv.messages || []), newMsg],
            last_message: newMessage,
            last_message_time: 'Just now',
            unread_count: 0
          }
        : conv
    ));

    setNewMessage('');
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

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = (type: 'image' | 'document') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt,.xlsx,.xls';
      fileInputRef.current.click();
    }
    setShowAttachmentMenu(false);
  };

  const handleInteractiveSelect = (type: 'button' | 'list' | 'product' | 'product_list') => {
    setInteractiveType(type);
    setMessageType('interactive');
    setShowInteractiveBuilder(true);
    setShowAttachmentMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMessageType(file.type.startsWith('image/') ? 'image' : 'document');
    }
  };

  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          };
          
          const newMsg: ChatMessage = {
            id: Date.now().toString(),
            content: `📍 ${location.address}`,
            type: 'location',
            sender: 'agent',
            timestamp: new Date().toISOString(),
            location: location
          };

          if (selectedConversation) {
            setConversations(conversations.map(conv => 
              conv.id === selectedConversation 
                ? {
                    ...conv,
                    messages: [...(conv.messages || []), newMsg],
                    last_message: '📍 Location shared',
                    last_message_time: 'Just now',
                    unread_count: 0
                  }
                : conv
            ));
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to access location. Please check your browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
    setShowAttachmentMenu(false);
  };

  const handleSendRichMessage = () => {
    if (!selectedConversation) return;

    let messageContent = newMessage;
    let messageTypeToSend = messageType;

    if (selectedFile) {
      if (messageType === 'image') {
        messageContent = `📷 Image: ${selectedFile.name}`;
      } else if (messageType === 'document') {
        messageContent = `📄 Document: ${selectedFile.name}`;
      }
    }

    if (!messageContent.trim() && !selectedFile) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      content: messageContent,
      type: messageTypeToSend,
      sender: 'agent',
      timestamp: new Date().toISOString(),
      file: selectedFile ? {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type
      } : undefined
    };

    setConversations(conversations.map(conv => 
      conv.id === selectedConversation 
        ? {
            ...conv,
            messages: [...(conv.messages || []), newMsg],
            last_message: messageContent,
            last_message_time: 'Just now',
            unread_count: 0
          }
        : conv
    ));

    setNewMessage('');
    setSelectedFile(null);
    setMessageType('text');
  };

  const extractVariables = (content: string): string[] => {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const matches = content.match(variableRegex);
    return matches ? matches.map(match => match.replace(/\{\{|\}\}/g, '')) : [];
  };

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
    setShowCreateTemplate(false);
  };


  return (
    <div className="h-full flex bg-[#ECE5DD] rounded-lg overflow-hidden font-sans">
      {/* Sidebar - Conversations List - Mobile Responsive */}
      <div className={`${selectedConversation ? 'hidden sm:flex' : 'flex'} w-full sm:w-1/3 bg-white border-r border-gray-200 flex-col`}>
        {/* Header - Mobile Responsive */}
        <div className="bg-[#F0F2F5] p-2 sm:p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#004d66] rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs sm:text-sm font-semibold text-[#004d66] truncate">WhatsApp Business</h2>
              <p className="text-xs text-gray-600 hidden sm:block">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button 
              onClick={() => setShowContactPicker(true)} 
              className="p-1 sm:p-1.5 text-[#004d66] hover:bg-gray-200 rounded transition-colors"
              title="New Chat"
            >
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button 
              onClick={() => setShowBulkMessaging(true)}
              className="p-1 sm:p-1.5 text-[#004d66] hover:bg-gray-200 rounded transition-colors"
              title="Broadcast"
            >
              <Megaphone className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Search - Mobile Responsive */}
        <div className="p-2 sm:p-3 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
            <input
              type="text"
              placeholder="Search chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 sm:pl-8 pr-2 sm:pr-3 py-1.5 sm:py-2 bg-[#F0F2F5] rounded text-xs sm:text-sm focus:ring-1 focus:ring-[#25D366] focus:border-transparent focus:bg-white"
            />
          </div>
        </div>

         {/* Conversations List */}
         <div className="flex-1 overflow-y-auto">
           {filteredConversations.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-center p-6">
               <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
               <p className="text-gray-500 text-sm">No conversations yet</p>
               <p className="text-gray-400 text-xs">Start a new chat to begin</p>
             </div>
           ) : (
             filteredConversations.map((conversation) => (
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
                     <div className="w-12 h-12 bg-[#004d66] rounded-full flex items-center justify-center">
                       <User className="w-6 h-6 text-white" />
                     </div>
                     {conversation.unread_count > 0 && (
                       <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#25D366] text-white text-xs rounded-full flex items-center justify-center font-medium">
                         {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                       </div>
                     )}
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between mb-1">
                       <h4 className="font-medium text-gray-900 truncate">{conversation.customer_name}</h4>
                       <span className="text-xs text-gray-500">{conversation.last_message_time}</span>
                     </div>
                     <p className="text-sm text-gray-600 truncate mb-1">{conversation.last_message}</p>
                     <div className="flex items-center justify-between">
                       {conversation.assigned_agent && (
                         <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                           {conversation.assigned_agent}
                         </span>
                       )}
                       <div className="flex items-center gap-1">
                         {conversation.status === 'active' && (
                           <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                         )}
                         {conversation.tags.length > 0 && (
                           <span className="text-xs text-blue-600">#{conversation.tags[0]}</span>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
               </motion.div>
             ))
           )}
         </div>
      </div>

      {/* Main Chat Area - Mobile Responsive */}
      <div className={`${selectedConversation ? 'flex' : 'hidden sm:flex'} flex-1 flex-col bg-[#ECE5DD]`}>
        {selectedConversation && selectedConv ? (
          <>
             {/* Chat Header - Mobile Responsive */}
             <div className="bg-[#F0F2F5] p-2 sm:p-3 border-b border-gray-200 flex items-center justify-between">
               <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                 <button 
                   onClick={() => setSelectedConversation(null)}
                   className="sm:hidden p-1 text-[#004d66] hover:bg-gray-200 rounded transition-colors mr-1"
                 >
                   <XCircle className="w-4 h-4" />
                 </button>
                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#004d66] rounded-full flex items-center justify-center flex-shrink-0">
                   <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                 </div>
                 <div className="min-w-0 flex-1">
                   <h3 className="font-medium text-[#004d66] text-sm sm:text-base truncate">{selectedConv.customer_name}</h3>
                   <p className="text-xs text-gray-600 truncate">{selectedConv.customer_phone}</p>
                 </div>
               </div>
               <div className="flex items-center gap-1 flex-shrink-0">
                 <button className="p-1.5 sm:p-2 text-[#004d66] hover:bg-gray-200 rounded-full transition-colors" title="Voice Call">
                   <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                 </button>
                 <select
                   value={selectedConv.assigned_agent || 'Unassigned'}
                   onChange={(e) => handleAssignAgent(selectedConv.id, e.target.value)}
                   className="p-1.5 sm:p-2 text-xs text-[#004d66] bg-transparent border-none focus:ring-0 rounded hover:bg-gray-200 hidden sm:block"
                 >
                   {agents.map(agent => (
                     <option key={agent} value={agent}>{agent}</option>
                   ))}
                 </select>
                 <button className="p-1.5 sm:p-2 text-[#004d66] hover:bg-gray-200 rounded-full transition-colors" title="More options">
                   <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                 </button>
               </div>
             </div>

             {/* Messages Area - Mobile Responsive */}
             <div className="flex-1 p-2 sm:p-4 space-y-2 overflow-y-auto bg-[#ECE5DD] relative">
               <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIwIDQwQzMxLjA0NTcgNDAgNDAgMzEuMDQ1NyA0MCAyMEM0MCA4Ljk1NDMgMzEuMDQ1NyAwIDIwIDBDOC45NTQzIDAgMCA4Ljk1NDMgMCAyMEMwIDMxLjA0NTcgOC45NTQzIDQwIDIwIDQwWiIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9zdmc+')] opacity-30"></div>
               <div className="relative z-10">
                 {selectedConv.messages && selectedConv.messages.length > 0 ? (
                   selectedConv.messages.map((message) => (
                     <motion.div
                       key={message.id}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className={`flex ${message.sender === 'agent' ? 'justify-end' : 'justify-start'} mb-2`}
                     >
                     <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${
                       message.sender === 'agent' 
                         ? 'bg-[#DCF8C6] text-gray-900 rounded-br-sm' 
                         : 'bg-white text-gray-900 rounded-bl-sm'
                     }`}>
                       {message.type === 'image' && message.file && (
                         <div className="mb-2">
                           <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                             <Image className="w-8 h-8 text-gray-400" />
                           </div>
                           <p className="text-xs text-gray-600 mt-1">{message.file.name}</p>
                         </div>
                       )}
                       {message.type === 'document' && message.file && (
                         <div className="mb-2 flex items-center gap-2 p-2 bg-gray-100 rounded">
                           <FileText className="w-4 h-4 text-gray-600" />
                           <div>
                             <p className="text-xs font-medium">{message.file.name}</p>
                             <p className="text-xs text-gray-500">{(message.file.size / 1024).toFixed(1)} KB</p>
                           </div>
                         </div>
                       )}
                       {message.type === 'location' && message.location && (
                         <div className="mb-2">
                           <div className="w-32 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                             <MapPin className="w-6 h-6 text-gray-400" />
                           </div>
                           <p className="text-xs text-gray-600 mt-1">Location shared</p>
                         </div>
                       )}
                       <p className="text-sm leading-relaxed">{message.content}</p>
                       <p className={`text-xs mt-1 ${
                         message.sender === 'agent' ? 'text-gray-600 text-right' : 'text-gray-500'
                       }`}>
                         {formatTime(message.timestamp)}
                       </p>
                     </div>
                     </motion.div>
                   ))
                 ) : (
                   <div className="text-center py-12">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                       <MessageSquare className="w-8 h-8 text-gray-400" />
                     </div>
                     <p className="text-gray-500 text-lg">Start the conversation</p>
                     <p className="text-gray-400 text-sm">Send a message to begin chatting</p>
                   </div>
                 )}
                 <div ref={messagesEndRef} />
               </div>
             </div>

             {/* Message Input - Mobile Responsive */}
             <div className="p-2 sm:p-3 bg-[#F0F2F5] flex items-center gap-1 sm:gap-2">
               {/* Emoji Picker */}
               <div className="relative emoji-picker">
                 <button 
                   onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                   className="p-1.5 sm:p-2 text-[#004d66] hover:bg-gray-200 rounded-full transition-colors" 
                   title="Emoji"
                 >
                   <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                 </button>
                 {showEmojiPicker && (
                   <div className="absolute bottom-12 left-0 z-20 w-72 sm:w-80">
                     <EmojiPicker
                       onEmojiClick={handleEmojiSelect}
                       width="100%"
                       height={300}
                       searchDisabled={false}
                       skinTonesDisabled={false}
                       previewConfig={{
                         showPreview: false
                       }}
                     />
                   </div>
                 )}
               </div>

               {/* Attachment Menu */}
               <div className="relative attachment-menu">
                 <button 
                   onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                   className="p-1.5 sm:p-2 text-[#004d66] hover:bg-gray-200 rounded-full transition-colors" 
                   title="Attach"
                 >
                   <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                 </button>
                 {showAttachmentMenu && (
                   <div className="absolute bottom-12 left-0 flex flex-col bg-white rounded-lg shadow-lg p-2 z-20 min-w-[160px] sm:min-w-[180px]">
                     <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">Media</div>
                     <button 
                       onClick={() => handleFileSelect('image')}
                       className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-sm w-full text-left"
                     >
                       <Image className="w-4 h-4 flex-shrink-0" /> 
                       <span>Image</span>
                     </button>
                     <button 
                       onClick={() => handleFileSelect('document')}
                       className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-sm w-full text-left"
                     >
                       <FileText className="w-4 h-4 flex-shrink-0" /> 
                       <span>Document</span>
                     </button>
                     <button 
                       onClick={handleLocationShare}
                       className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-sm w-full text-left"
                     >
                       <MapPin className="w-4 h-4 flex-shrink-0" /> 
                       <span>Location</span>
                     </button>
                     
                     <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100 mt-2">Interactive</div>
                     <button 
                       onClick={() => handleInteractiveSelect('button')}
                       className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-sm w-full text-left"
                     >
                       <div className="w-4 h-4 bg-[#25D366] rounded flex items-center justify-center flex-shrink-0">
                         <span className="text-white text-xs font-bold">B</span>
                       </div>
                       <span>Quick Reply Buttons</span>
                     </button>
                     <button 
                       onClick={() => handleInteractiveSelect('list')}
                       className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-sm w-full text-left"
                     >
                       <div className="w-4 h-4 bg-[#25D366] rounded flex items-center justify-center flex-shrink-0">
                         <span className="text-white text-xs font-bold">L</span>
                       </div>
                       <span>List Message</span>
                     </button>
                     <button 
                       onClick={() => handleInteractiveSelect('product')}
                       className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded text-sm w-full text-left"
                     >
                       <div className="w-4 h-4 bg-[#25D366] rounded flex items-center justify-center flex-shrink-0">
                         <span className="text-white text-xs font-bold">P</span>
                       </div>
                       <span>Product Message</span>
                     </button>
                   </div>
                 )}
               </div>

               {/* File Input (Hidden) */}
               <input
                 ref={fileInputRef}
                 type="file"
                 onChange={handleFileChange}
                 className="hidden"
               />

               {/* Message Input */}
               <div className="flex-1 relative">
                 <input
                   type="text"
                   placeholder={selectedFile ? `📎 ${selectedFile.name}` : "Type a message..."}
                   value={newMessage}
                   onChange={(e) => setNewMessage(e.target.value)}
                   onKeyPress={(e) => {
                     if (e.key === 'Enter' && !e.shiftKey) {
                       e.preventDefault();
                       if (selectedFile) {
                         handleSendRichMessage();
                       } else {
                         handleSendMessage();
                       }
                     }
                   }}
                   className="w-full p-3 bg-white rounded-full text-sm focus:ring-2 focus:ring-[#25D366] focus:border-transparent focus:outline-none"
                 />
                 {selectedFile && (
                   <button
                     onClick={() => {
                       setSelectedFile(null);
                       setMessageType('text');
                     }}
                     className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                   >
                     <XCircle className="w-4 h-4" />
                   </button>
                 )}
               </div>

               {/* Send Button - Mobile Responsive */}
               {(newMessage.trim() || selectedFile) ? (
                 <button 
                   onClick={selectedFile ? handleSendRichMessage : handleSendMessage}
                   className="p-1.5 sm:p-2 bg-[#25D366] text-white rounded-full hover:bg-[#1DA851] transition-colors"
                   title="Send message"
                 >
                   <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                 </button>
               ) : (
                 <button className="p-1.5 sm:p-2 text-[#004d66] hover:bg-gray-200 rounded-full transition-colors" title="Voice message">
                   <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                 </button>
               )}
             </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#ECE5DD] p-4">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm">
                <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">WhatsApp Business</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">Select a chat to start messaging</p>
              <button 
                onClick={() => setShowContactPicker(true)}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 text-white rounded-full hover:bg-[#1DA851] transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Start New Chat</span>
                <span className="sm:hidden">New Chat</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Messaging Modal */}
      <StandardModal
        isOpen={showBulkMessaging}
        onClose={() => setShowBulkMessaging(false)}
        title="New Broadcast"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">Send a message to multiple contacts</p>
          
          {/* Template Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-[#004d66]">Choose Template</label>
              <ModalButton
                onClick={() => setShowCreateTemplate(true)}
                variant="primary"
                size="sm"
              >
                Create Template
              </ModalButton>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                          selectedTemplate?.id === template.id
                            ? 'border-[#25D366] bg-[#DCF8C6] shadow-sm'
                            : 'border-gray-200 hover:border-[#25D366] hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            selectedTemplate?.id === template.id ? 'bg-[#25D366]' : 'bg-[#004d66]'
                          }`}>
                            <FileText className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm text-gray-900 truncate">{template.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                template.category === 'transactional' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : template.category === 'marketing'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {template.category}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{template.content}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className={`px-1.5 py-0.5 rounded ${
                                template.status === 'approved' 
                                  ? 'bg-green-100 text-green-700' 
                                  : template.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {template.status}
                              </span>
                              <span>•</span>
                              <span>{template.variables.length} variables</span>
                            </div>
                          </div>
                          {selectedTemplate?.id === template.id && (
                            <div className="flex-shrink-0">
                              <div className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
            </div>
          </div>
          
          {/* Message Content */}
          <div>
            <label className="block text-sm font-medium text-[#004d66] mb-3">Message Content</label>
            <div className="relative">
              <textarea
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#25D366] focus:border-transparent h-32 resize-none bg-white"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-xs text-gray-400">{bulkMessage.length}</span>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            {selectedTemplate && (
              <div className="mt-3 p-3 bg-[#F0F2F5] rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-[#004d66]" />
                  <span className="text-sm font-medium text-[#004d66]">Template Preview</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedTemplate.content}</p>
                {selectedTemplate.variables.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedTemplate.variables.map((variable, index) => (
                      <span key={index} className="text-xs bg-[#25D366] text-white px-2 py-1 rounded">
                        {variable}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Recipients Selection */}
          <div>
            <label className="block text-sm font-medium text-[#004d66] mb-3">
              Select Recipients ({selectedAudience.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-white">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center gap-3 p-3 hover:bg-[#F0F2F5] cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  onClick={() => handleAudienceToggle(conversation.id)}
                >
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedAudience.includes(conversation.id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-[#25D366] border-gray-300 rounded focus:ring-[#25D366]"
                    />
                  </div>
                  <div className="w-10 h-10 bg-[#004d66] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{conversation.customer_name}</p>
                      {conversation.status === 'active' && (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">{conversation.customer_phone}</p>
                    {conversation.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {conversation.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            #{tag}
                          </span>
                        ))}
                        {conversation.tags.length > 2 && (
                          <span className="text-xs text-gray-400">+{conversation.tags.length - 2} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  {selectedAudience.includes(conversation.id) && (
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#004d66] rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#004d66]">{selectedAudience.length} contacts selected</p>
                <p className="text-xs text-gray-600">Ready to send broadcast</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ModalButton
                onClick={() => setShowBulkMessaging(false)}
                variant="secondary"
                size="md"
              >
                Cancel
              </ModalButton>
              <ModalButton
                onClick={handleBulkSend}
                disabled={!bulkMessage.trim() || selectedAudience.length === 0}
                variant="primary"
                size="md"
                icon={Send}
              >
                Send to {selectedAudience.length} contacts
              </ModalButton>
            </div>
          </div>
        </div>
      </StandardModal>

      {/* Contact Picker Modal */}
      <StandardModal
        isOpen={showContactPicker}
        onClose={() => setShowContactPicker(false)}
        title="New Chat"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Select a contact to start messaging</p>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F0F2F5] rounded-lg text-sm focus:ring-2 focus:ring-[#25D366] focus:bg-white transition-colors"
            />
          </div>
          <div className="max-h-80 overflow-y-auto">
            {conversations
              .filter(conv => 
                conv.customer_name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                conv.customer_phone.includes(contactSearch)
              )
              .map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                  onClick={() => handleStartNewChat(conversation.id)}
                >
                  <div className="w-10 h-10 bg-[#004d66] rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{conversation.customer_name}</p>
                    <p className="text-xs text-gray-600">{conversation.customer_phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {conversation.status === 'active' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            {conversations.filter(conv => 
              conv.customer_name.toLowerCase().includes(contactSearch.toLowerCase()) ||
              conv.customer_phone.includes(contactSearch)
            ).length === 0 && (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No contacts found</p>
                <p className="text-gray-400 text-xs">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      </StandardModal>

      {/* Interactive Message Builder Modal */}
      <StandardModal
        isOpen={showInteractiveBuilder}
        onClose={() => setShowInteractiveBuilder(false)}
        title="Interactive Message Builder"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {interactiveType === 'button' ? 'B' : interactiveType === 'list' ? 'L' : 'P'}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#004d66]">
                {interactiveType === 'button' ? 'Quick Reply Buttons' : 
                 interactiveType === 'list' ? 'List Message' : 'Product Message'}
              </h3>
              <p className="text-xs text-gray-600">Create interactive message</p>
            </div>
          </div>
              <div>
                <label className="block text-sm font-medium text-[#004d66] mb-1">Header Text (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter header text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#004d66] mb-1">Body Text *</label>
                <textarea
                  rows={3}
                  placeholder="Enter your message body"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#004d66] mb-1">Footer Text (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter footer text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                />
              </div>
              
              {interactiveType === 'button' && (
                <div>
                  <label className="block text-sm font-medium text-[#004d66] mb-1">Buttons (Max 3)</label>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          placeholder={`Button ${i} text`}
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                        />
                        <select className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm">
                          <option value="reply">Reply</option>
                          <option value="url">URL</option>
                          <option value="phone">Phone</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {interactiveType === 'list' && (
                <div>
                  <label className="block text-sm font-medium text-[#004d66] mb-1">List Sections</label>
                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-3">
                      <input
                        type="text"
                        placeholder="Section title"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm mb-2"
                      />
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              placeholder={`Option ${i} title`}
                              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                            />
                            <input
                              type="text"
                              placeholder={`Option ${i} description`}
                              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <ModalButton
              onClick={() => setShowInteractiveBuilder(false)}
              variant="secondary"
              size="sm"
            >
              Cancel
            </ModalButton>
            <ModalButton
              onClick={() => {
                // Handle interactive message creation
                setShowInteractiveBuilder(false);
                setMessageType('text');
              }}
              variant="primary"
              size="sm"
            >
              Create Message
            </ModalButton>
          </div>
        </div>
      </StandardModal>

      {/* Create Template Modal */}
      <StandardModal
        isOpen={showCreateTemplate}
        onClose={() => setShowCreateTemplate(false)}
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
              onClick={() => setShowCreateTemplate(false)}
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
    </div>
  );
};

export default MessagingTab;