
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Phone, Clock } from 'lucide-react';
import { useContacts } from '../components/ContactsContext';
import { ContactsProvider } from '../components/ContactsContext';
const SendSMS: React.FC = () => {
  const { contacts } = useContacts();
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [schedule, setSchedule] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement SMS sending logic
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
              Recipient Phone Number
            </label>
            <div className="flex gap-3">
              <div className="w-24">
                <select className="input">
                  <option>+1</option>
                  <option>+44</option>
                  <option>+91</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              className="input min-h-[120px]"
              placeholder="Type your message here..."
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
          <p className="text-gray-600">Send SMS to over 200 countries worldwide</p>
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