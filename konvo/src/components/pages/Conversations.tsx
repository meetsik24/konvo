import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Send, Phone, MoveVertical as MoreVertical, Bot, User, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePharmacyConversations, useConversationMessages } from '@/hooks/use-pharmacy';
import { formatRelativeTime, formatMessageTime, getMessagePreview } from '@/lib/format';
import type { SarufiConversationRecord, SarufiMessageRecord } from '@/api/types';

interface Chat {
  id: string;
  phone: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  status: 'bot' | 'human';
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: string;
}

function conversationToChat(c: SarufiConversationRecord): Chat {
  return {
    id: c.id,
    phone: c.user_phone,
    name: c.contact_name ?? c.user_phone,
    lastMessage: c.last_message_preview ?? '',
    timestamp: formatRelativeTime(c.last_message_at),
    unread: c.unread_count,
    status: c.unread_count > 0 ? 'human' : 'bot',
  };
}

function sarufiMessagesToDisplay(rows: SarufiMessageRecord[]): Message[] {
  return rows.map((r) => ({
    id: r.id,
    text:
      r.responder === 'HUMAN'
        ? getMessagePreview((r.message ?? {}) as Record<string, unknown>)
        : getMessagePreview((r.response ?? {}) as Record<string, unknown>),
    sender: r.responder === 'HUMAN' ? 'user' : 'bot',
    timestamp: formatMessageTime(r.received_at),
  }));
}

export function Conversations() {
  const { data: conversationsData, isLoading: conversationsLoading, error: conversationsError } = usePharmacyConversations({ limit: 50 });
  const conversations = conversationsData?.conversations ?? [];
  const chats = useMemo(() => conversations.map(conversationToChat), [conversations]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(chats[0] ?? null);
  const { data: messagesData, isLoading: historyLoading, error: historyError } = useConversationMessages(selectedChat?.id ?? null);
  const messages = useMemo(() => (messagesData?.messages ? sarufiMessagesToDisplay(messagesData.messages) : []), [messagesData?.messages]);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    if (chats.length > 0) setSelectedChat((prev) => prev ?? chats[0]);
  }, [chats]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Conversations</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="divide-y divide-gray-100">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading…
              </div>
            ) : conversationsError ? (
              <div className="p-4 text-sm text-red-600">Failed to load conversations.</div>
            ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-emerald-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {chat.name}
                      </p>
                      <span className="text-xs text-gray-500">{chat.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="ml-2 bg-emerald-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          chat.status === 'bot'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {chat.status === 'bot' ? (
                          <>
                            <Bot className="w-3 h-3" />
                            Bot
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3" />
                            Human
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {!selectedChat ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            {chats.length === 0 && !conversationsLoading ? 'No conversations yet.' : 'Select a conversation'}
          </div>
        ) : (
        <>
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
                <p className="text-sm text-gray-500">{selectedChat.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6 bg-gray-50">
          <div className="space-y-4 max-w-4xl mx-auto">
            {historyLoading ? (
              <div className="flex justify-center py-8 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : historyError ? (
              <p className="text-sm text-red-600 py-4">Failed to load messages.</p>
            ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md ${
                    message.sender === 'user'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-900'
                  } rounded-2xl px-4 py-2.5 shadow-sm`}
                >
                  {message.sender !== 'user' && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <Bot className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-600">Bot</span>
                    </div>
                  )}
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-emerald-100' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))
            )}
          </div>
        </ScrollArea>

        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} className="bg-emerald-500 hover:bg-emerald-600">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-2 text-center">
            <Button variant="link" className="text-sm text-emerald-600 hover:text-emerald-700">
              Take over conversation
            </Button>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
