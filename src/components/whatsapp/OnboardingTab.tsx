import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Phone, 
  Building2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Upload, 
  ArrowRight,
  ArrowLeft,
  FileText,
  Camera
} from 'lucide-react';
import { WABAStatus } from '../../types/whatsapp';

interface OnboardingTabProps {
  wabaStatus: WABAStatus;
  setWabaStatus: (status: WABAStatus) => void;
}

const OnboardingTab: React.FC<OnboardingTabProps> = ({ wabaStatus, setWabaStatus }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [verificationDocs, setVerificationDocs] = useState<File[]>([]);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isUploadingDocs, setIsUploadingDocs] = useState(false);

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
    setWabaStatus({
      status: 'pending',
      phone_number: phoneNumber,
      business_name: businessName,
      verification_documents: verificationDocs.map(doc => doc.name),
      last_updated: new Date().toISOString()
    });
    setCurrentStep(4);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-[#25D366]" />
        <h2 className="text-xl font-semibold text-[#004d66]">WhatsApp Business Account Setup</h2>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              currentStep >= step.id 
                ? 'bg-[#25D366] text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              <step.icon className="w-5 h-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#004d66]">{step.title}</p>
              <p className="text-xs text-gray-600">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 transition-colors ${
                currentStep > step.id ? 'bg-[#25D366]' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* WABA Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg border ${getStatusColor(wabaStatus.status)}`}
      >
        <div className="flex items-center gap-3">
          {getStatusIcon(wabaStatus.status)}
          <div>
            <h3 className="font-medium">WhatsApp Business Account Status</h3>
            <p className="text-sm">
              {wabaStatus.status === 'not_connected' && 'Not connected to WhatsApp Business API'}
              {wabaStatus.status === 'pending' && 'Verification pending - documents under review'}
              {wabaStatus.status === 'verified' && 'Account verified and ready to use'}
              {wabaStatus.status === 'rejected' && 'Verification rejected - please resubmit documents'}
            </p>
            {wabaStatus.business_name && (
              <p className="text-xs mt-1">Business: {wabaStatus.business_name}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-lg border border-gray-200"
      >
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <Phone className="w-16 h-16 text-[#25D366] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#004d66] mb-2">Phone Number Verification</h3>
              <p className="text-gray-600">Enter your business phone number to start the verification process</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+255123456789"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include country code (e.g., +255 for Tanzania)
                </p>
              </div>
              
              <button 
                onClick={handlePhoneVerification}
                disabled={!phoneNumber || isVerifyingPhone}
                className="w-full px-4 py-3 bg-[#25D366] text-white rounded-md hover:bg-[#1DA851] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <Building2 className="w-16 h-16 text-[#25D366] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#004d66] mb-2">Business Information</h3>
              <p className="text-gray-600">Tell us about your business</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Business Name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Category</label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#25D366] focus:border-transparent"
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
              <FileText className="w-16 h-16 text-[#25D366] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#004d66] mb-2">Document Verification</h3>
              <p className="text-gray-600">Upload your business documents for verification</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Documents</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#25D366] transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Drag and drop business documents here</p>
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
                    className="px-4 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#1DA851] cursor-pointer inline-block"
                  >
                    Choose Files
                  </label>
                </div>
                
                {verificationDocs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Uploaded Documents:</p>
                    {verificationDocs.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{doc.name}</span>
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
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#004d66] mb-2">Setup Complete!</h3>
              <p className="text-gray-600">Your WhatsApp Business account is being verified</p>
            </div>
            
            <div className="max-w-md mx-auto space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">What happens next?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Your documents are being reviewed</li>
                  <li>• You'll receive an email when verification is complete</li>
                  <li>• This usually takes 24-48 hours</li>
                </ul>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Business: <span className="font-medium">{businessName}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Phone: <span className="font-medium">{phoneNumber}</span>
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
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            className="px-6 py-2 bg-[#25D366] text-white rounded-md hover:bg-[#1DA851] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleCompleteSetup}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            Complete Setup
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingTab;
