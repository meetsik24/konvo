import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Building2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Upload, 
  ArrowRight,
  ArrowLeft,
  FileText
} from 'lucide-react';
import { WABAStatus } from '../../types/whatsapp';
import StandardModal from './StandardModal';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (wabaStatus: WABAStatus) => void;
  wabaStatus: WABAStatus;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ 
  isOpen, 
  onClose, 
  onComplete, 
  wabaStatus 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [verificationDocs, setVerificationDocs] = useState<File[]>([]);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  const steps = [
    { 
      id: 1, 
      title: 'Connect Phone Number', 
      description: 'Verify your WhatsApp Business phone number',
      icon: Phone
    },
    { 
      id: 2, 
      title: 'Business Information', 
      description: 'Provide your business details',
      icon: Building2
    },
    { 
      id: 3, 
      title: 'Document Verification', 
      description: 'Upload business documents for verification',
      icon: FileText
    },
    { 
      id: 4, 
      title: 'Complete Setup', 
      description: 'Review and finalize your WhatsApp Business account',
      icon: CheckCircle
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
      case 'inactive':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
      case 'inactive':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handlePhoneVerification = async () => {
    setIsVerifyingPhone(true);
    // Simulate API call
    setTimeout(() => {
      setIsVerifyingPhone(false);
      setCurrentStep(2);
    }, 2000);
  };

  const handleDocumentUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      setVerificationDocs(prev => [...prev, ...newFiles]);
    }
  };

  const handleCompleteSetup = () => {
    const newWabaStatus: WABAStatus = {
      status: 'pending',
      phone_number: phoneNumber,
      business_name: businessName,
      verification_documents: verificationDocs.map(doc => doc.name),
      last_updated: new Date().toISOString()
    };
    onComplete(newWabaStatus);
    onClose();
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <StandardModal
          isOpen={isOpen}
          onClose={onClose}
          title="WhatsApp Business Setup"
          size="xl"
          showCloseButton={false}
        >
          <div className="space-y-6">

            {/* Content */}
            <div className="p-6">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-6">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                      currentStep >= step.id 
                        ? 'bg-[#004d66] text-white' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="ml-2 flex-1">
                      <p className="text-xs font-medium text-[#004d66]">{step.title}</p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-1 mx-2 rounded-full transition-colors ${
                        currentStep > step.id ? 'bg-[#004d66]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* WABA Status Card */}
              {wabaStatus.status !== 'not_connected' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-md border mb-6 ${getStatusColor(wabaStatus.status)}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(wabaStatus.status)}
                    <div>
                      <h3 className="font-medium text-sm">WhatsApp Business Account Status</h3>
                      <p className="text-xs mt-1">
                        {wabaStatus.status === 'pending' && 'Verification pending - documents under review'}
                        {wabaStatus.status === 'verified' && 'Account verified and ready to use'}
                        {wabaStatus.status === 'rejected' && 'Verification rejected - please resubmit documents'}
                      </p>
                      {wabaStatus.business_name && (
                        <p className="text-xs mt-1 font-medium">Business: {wabaStatus.business_name}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step Content */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-50 p-6 rounded-md border border-gray-200"
              >
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Phone className="w-12 h-12 text-[#004d66] mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-[#004d66] mb-2">Phone Number Verification</h3>
                      <p className="text-gray-600 text-sm">Enter your business phone number to start the verification process</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+255123456789"
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Include country code (e.g., +255 for Tanzania)
                        </p>
                      </div>
                      
                      <button 
                        onClick={handlePhoneVerification}
                        disabled={!phoneNumber || isVerifyingPhone}
                        className="w-full px-4 py-3 bg-[#004d66] text-white rounded-md hover:bg-[#1DA851] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        {isVerifyingPhone ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending Verification Code...
                          </>
                        ) : (
                          <>
                            Send Verification Code
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <Building2 className="w-12 h-12 text-[#004d66] mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-[#004d66] mb-2">Business Information</h3>
                      <p className="text-gray-600 text-sm">Tell us about your business</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Business Name</label>
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Your Business Name"
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Business Category</label>
                        <select
                          value={businessCategory}
                          onChange={(e) => setBusinessCategory(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                        >
                          <option value="">Select Category</option>
                          <option value="ecommerce">E-commerce</option>
                          <option value="healthcare">Healthcare</option>
                          <option value="education">Education</option>
                          <option value="finance">Finance</option>
                          <option value="retail">Retail</option>
                          <option value="services">Services</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-[#004d66] mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-[#004d66] mb-2">Document Verification</h3>
                      <p className="text-gray-600 text-sm">Upload your business documents for verification</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Upload Documents</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-[#25D366] hover:bg-[#25D366]/5 transition-colors">
                          <Upload className="w-8 h-8 text-[#004d66] mx-auto mb-3" />
                          <p className="text-sm text-gray-700 mb-1 font-medium">Drag and drop business documents here</p>
                          <p className="text-xs text-gray-500 mb-4">or click to browse</p>
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleDocumentUpload(e.target.files)}
                            className="hidden"
                            id="document-upload"
                          />
                          <label
                            htmlFor="document-upload"
                            className="px-4 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#1DA851] cursor-pointer inline-block text-sm font-medium transition-colors"
                          >
                            Choose Files
                          </label>
                        </div>
                        
                        {verificationDocs.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-gray-700">Uploaded Documents:</p>
                            {verificationDocs.map((doc, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                                <FileText className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-700">{doc.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-[#004d66] mb-2">Setup Complete!</h3>
                      <p className="text-gray-600 text-sm">Your WhatsApp Business account is being verified</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <h4 className="font-medium text-green-800 mb-3 text-sm">What happens next?</h4>
                        <ul className="text-green-700 space-y-1 text-xs">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            Your documents are being reviewed
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            You'll receive an email when verification is complete
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            This usually takes 24-48 hours
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 rounded-md p-4 text-center">
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Business:</span> {businessName}
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Phone:</span> {phoneNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
                
                {currentStep < 4 ? (
                  <button
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    disabled={
                      (currentStep === 1 && !phoneNumber) ||
                      (currentStep === 2 && (!businessName || !businessCategory)) ||
                      (currentStep === 3 && verificationDocs.length === 0)
                    }
                    className="px-4 py-2 bg-[#004d66] text-white rounded-md hover:bg-[#1DA851] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteSetup}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    Complete Setup
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </StandardModal>
      )}
    </AnimatePresence>
  );
};

export default OnboardingModal;
