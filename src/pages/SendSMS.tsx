import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Phone, Clock, Bot } from 'lucide-react';
import { useContacts } from '../components/ContactsContext';
import { getSenderId } from '../services/api';

const SendSMS: React.FC = () => {
  const { contacts } = useContacts();
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [schedule, setSchedule] = useState('');
  const [senderId, setSenderId] = useState('');
  const [senderIds, setSenderIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keywords, setKeywords] = useState(''); // New state for keywords

  useEffect(() => {
    const fetchSenderIds = async () => {
      try {
        const ids = await getSenderId();
        setSenderIds(ids);
      } catch (error) {
        console.error('Failed to fetch sender IDs', error);
      }
    };

    fetchSenderIds();
  }, []);

  const generateAIMessage = async () => {
    if (!keywords.trim()) {
      alert('Please enter some keywords to generate a message');
      return;
    }

    setIsGenerating(true);
    try {
      // Split keywords into array and clean them up
      const keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k);
      
      // Simulate AI text generation with keywords (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate message based on keywords
      let aiMessage = `Hello! This is ${senderId || 'your company'} reaching out regarding `;
      if (keywordsArray.length > 0) {
        aiMessage += keywordsArray.join(' and ') + '. ';
      }
      aiMessage += 'How can we assist you today with these topics?';
      
      setMessage(aiMessage);
    } catch (error) {
      console.error('Error generating AI message:', error);
      setMessage('Sorry, there was an error generating the message.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ senderId, recipient, message, schedule });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Send SMS</h1>
      </div>

      <div className="card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender ID
            </label>
            <select
              className="input"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
            >
              <option value="" disabled>Select Sender ID</option>
              {senderIds.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Phone Number
            </label>
            <div className="flex gap-3">
              <div className="w-40">
                <select className="input" defaultValue="+255">
                  <option value="+255">🇹🇿 +255</option>
                </select>
              </div>
              <input
                type="tel"
                className="input"
                placeholder="(555) 123-4567"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="input max-w-[200px]"
                  placeholder="Enter keywords (e.g., sale, support)"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
                <button
                  type="button"
                  onClick={generateAIMessage}
                  disabled={isGenerating}
                  className="btn btn-sm btn-secondary flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  {isGenerating ? 'Generating...' : 'Generate AI Message'}
                </button>
              </div>
            </div>
            <textarea
              className="input min-h-[120px]"
              placeholder="Type your message here or generate one using keywords..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <span>{message.length} characters</span>
              <span>{Math.ceil(message.length / 160)} message(s)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule (Optional)
            </label>
            <input
              type="datetime-local"
              className="input"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button type="submit" className="btn btn-primary flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </div>
        </form>
      </div>

      {/* Rest of the component remains unchanged */}
      <div className="card p-8">
        <h2 className="text-lg font-semibold mb-4">Import Contacts</h2>
        <ul className="space-y-2">
          {contacts.map((contact) => (
            <li key={contact.id} className="flex justify-between items-center">
              <span>{contact.name}</span>
              <button
                className="btn btn-secondary"
                onClick={() => setRecipient(contact.phone)}
              >
                Use
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <Phone className="w-6 h-6 text-primary-500 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Global Coverage</h3>
          <p className="text-gray-600">Send SMS to all networks</p>
        </div>
        <div className="card p-6">
          <Clock className="w-6 h-6 text-primary-500 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Scheduled Delivery</h3>
          <p className="text-gray-600">Schedule messages for future delivery</p>
        </div>
        <div className="card p-6">
          <MessageSquare className="w-6 h-6 text-primary-500 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Delivery Reports</h3>
          <p className="text-gray-600">Track message status in real-time</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SendSMS;