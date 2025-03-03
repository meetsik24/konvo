import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hash, MessageSquare, Mail, Phone, PlusCircle, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {createSenderId, getSenderId,deleteSenderId} from '../serivices/api'

interface SenderID {
  id: string;
  value: string;
  type: 'sms' | 'voice' | 'email';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  notes?: string;
}

const SenderID = () => {
  const [senderIds, setSenderIds] = useState<SenderID[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    value: '',
    type: 'sms' as const,
    notes: ''
  });

  // Simulate fetching sender IDs
  useEffect(() => {
    setLoading(true);

    //TODO: REMOVE SIMULATION AND IMPLEMENT THE ACTUAL DATA
    // Simulate API call
    setTimeout(() => {
      setSenderIds([
        {
          id: '1',
          value: 'COMPANYNAME',
          type: 'sms',
          status: 'approved',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          value: 'support@company.com',
          type: 'email',
          status: 'approved',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          value: 'MARKETING',
          type: 'sms',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status: SenderID['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getTypeIcon = (type: SenderID['type']) => {
    switch (type) {
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-primary-500" />;
      case 'email':
        return <Mail className="w-5 h-5 text-primary-500" />;
      case 'voice':
        return <Phone className="w-5 h-5 text-primary-500" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newSenderId: SenderID = {
      id: Date.now().toString(),
      value: newRequest.value,
      type: newRequest.type,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: newRequest.notes
    };

    setSenderIds([...senderIds, newSenderId]);
    setShowRequestForm(false);
    setNewRequest({ value: '', type: 'sms', notes: '' });
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6 p-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <Hash className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Sender ID Management</h1>
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Your Sender IDs</h2>
            <p className="text-gray-600 mt-1">Manage your approved and pending sender IDs</p>
          </div>
          <button
            onClick={() => setShowRequestForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Request New ID
          </button>
        </div>

        {showRequestForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 border rounded-lg p-6 bg-gray-50"
          >
            <h3 className="text-lg font-semibold mb-4">Request New Sender ID</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender ID Value
                </label>
                <input
                  type="text"
                  className="input"
                  value={newRequest.value}
                  onChange={(e) => setNewRequest({ ...newRequest, value: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  className="input"
                  value={newRequest.type}
                  onChange={(e) => setNewRequest({ ...newRequest, type: e.target.value as SenderID['type'] })}
                >
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="voice">Voice</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  className="input min-h-[100px]"
                  value={newRequest.notes}
                  onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  Submit Request
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Sender ID</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {senderIds.map((senderId) => (
                  <tr key={senderId.id} className="border-b">
                    <td className="py-3 px-4">
                      <span className="font-mono">{senderId.value}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(senderId.type)}
                        <span className="capitalize">{senderId.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(senderId.status)}
                        <span className="capitalize">{senderId.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(senderId.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <AlertCircle className="w-6 h-6 text-primary-500 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Sender ID Requirements</h3>
          <ul className="text-gray-600 space-y-2">
            <li>• Must be 3-11 characters for SMS</li>
            <li>• Alphanumeric characters only</li>
            <li>• No special characters allowed</li>
          </ul>
        </div>
        <div className="card p-6">
          <Clock className="w-6 h-6 text-primary-500 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Approval Process</h3>
          <p className="text-gray-600">Approval typically takes 1-2 business days</p>
        </div>
        <div className="card p-6">
          <CheckCircle className="w-6 h-6 text-primary-500 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Verification</h3>
          <p className="text-gray-600">Business verification may be required</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SenderID;
