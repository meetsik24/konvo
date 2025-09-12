import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Shield, CheckCircle, Clock, XCircle } from 'lucide-react';
import OnboardingModal from './OnboardingModal';
import { WABAStatus } from '../../types/whatsapp';

const WhatsAppDemo: React.FC = () => {
  const [wabaStatus, setWabaStatus] = useState<WABAStatus>({
    status: 'not_connected',
    last_updated: new Date().toISOString()
  });
  const [showModal, setShowModal] = useState(false);

  const handleOnboardingComplete = (newWabaStatus: WABAStatus) => {
    setWabaStatus(newWabaStatus);
    setShowModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <MessageCircle className="w-16 h-16 text-[#25D366] mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-[#004d66] mb-2">WhatsApp Business Demo</h1>
        <p className="text-gray-600">Click the button below to see the onboarding modal in action</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#004d66] mb-2">Current Status</h2>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(wabaStatus.status)}`}>
            {getStatusIcon(wabaStatus.status)}
            <span className="font-medium">
              {wabaStatus.status === 'not_connected' && 'Not Connected'}
              {wabaStatus.status === 'pending' && 'Pending Verification'}
              {wabaStatus.status === 'verified' && 'Verified'}
              {wabaStatus.status === 'rejected' && 'Verification Rejected'}
            </span>
          </div>
        </div>

        {wabaStatus.business_name && (
          <div className="mb-6 text-sm text-gray-600">
            <p><strong>Business:</strong> {wabaStatus.business_name}</p>
            {wabaStatus.phone_number && (
              <p><strong>Phone:</strong> {wabaStatus.phone_number}</p>
            )}
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-[#25D366] text-white rounded-md hover:bg-[#1DA851] transition-colors flex items-center gap-2 mx-auto"
        >
          <Shield className="w-5 h-5" />
          {wabaStatus.status === 'not_connected' ? 'Start Setup' : 'Update Settings'}
        </button>

        {wabaStatus.status !== 'not_connected' && (
          <button
            onClick={() => setWabaStatus({ status: 'not_connected', last_updated: new Date().toISOString() })}
            className="mt-4 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            Reset Demo
          </button>
        )}
      </div>

      <OnboardingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onComplete={handleOnboardingComplete}
        wabaStatus={wabaStatus}
      />
    </div>
  );
};

export default WhatsAppDemo;
