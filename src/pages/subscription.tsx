import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check, X } from 'lucide-react';
import {
  getPlans,
  getSubscriptionUsage,
  subscribeToPlan,
  renewSubscription,
  upgradeSubscription,
  Plan,
  SubscriptionUsage,
} from '../services/api';
import type { RootState } from '..';

interface Contact {
  name: string;
  phone_number: string;
  email: string;
}

interface PaymentDetails {
  planId: string;
  smsCount: number;
  totalAmount: number;
  action: 'subscribe' | 'upgrade' | 'renew';
}

const salesContacts: Contact[] = [
  {
    name: "Innocent Singo",
    phone_number: "+255-123-456-789",
    email: "sales@briq.tz",
  },
];

const Subscription: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionUsage | null>(null);
  const [showSmsInputModal, setShowSmsInputModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [smsCountInput, setSmsCountInput] = useState('');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    const fetchPlansAndSubscription = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const plansData = await getPlans();
        console.log('Fetched plans:', plansData);

        if (!plansData || plansData.length === 0) {
          console.warn('No plans were returned from the API');
        }

        setPlans(plansData);

        try {
          const subscriptionData = await getSubscriptionUsage();
          setSubscriptionDetails(subscriptionData);
        } catch (subErr: any) {
          console.error('Specific error fetching subscription:', subErr.message, 'Status:', subErr.response?.status);
        }
      } catch (err: any) {
        console.error('Error fetching plans:', err.message, 'Status:', err.response?.status);
        setError('Failed to load plans. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchPlansAndSubscription();
    } else {
      console.error('No authentication token available');
      setError('You must be logged in to view subscription plans.');
    }
  }, [token]);

  const calculateTotalAmount = (plan: Plan, smsCount: number): number => {
    if (smsCount <= 0) return 0;

    const basePrice = parseFloat(plan.price) || 0;

    let pricePerSms: number;
    if (smsCount >= 1 && smsCount <= 5999) {
      pricePerSms = basePrice;
    } else if (smsCount >= 6000 && smsCount <= 54999) {
      pricePerSms = basePrice - 1;
    } else if (smsCount >= 55000 && smsCount <= 499999) {
      pricePerSms = basePrice - 2;
    } else {
      pricePerSms = basePrice - 3;
    }

    const totalAmount = smsCount * pricePerSms;
    return Math.round(totalAmount);
  };

  const handleInitiatePayment = (planId: string, action: 'subscribe' | 'upgrade' | 'renew') => {
    setError(null);
    setSuccess(null);
    setPaymentDetails(null);
    setSmsCountInput('');

    const selectedPlan = plans.find(plan => plan.plan_id === planId);
    if (selectedPlan) {
      // Initialize the SMS count input to the plan's minimum
      setSmsCountInput(selectedPlan.sms_count.toString());
    }

    setShowSmsInputModal(true);
    setPaymentDetails({ planId, smsCount: 0, totalAmount: 0, action });
  };

  const handleSubscribe = (planId: string) => {
    const selectedPlan = plans.find(plan => plan.plan_id === planId);
    if (!selectedPlan) {
      setError('Could not find the selected plan. Please try again.');
      return;
    }

    if (subscriptionDetails) {
      handleInitiatePayment(planId, 'upgrade');
    } else {
      handleInitiatePayment(planId, 'subscribe');
    }
  };

  const handleRenew = () => {
    if (!subscriptionDetails || !subscriptionDetails.plan_id) {
      setError('No active subscription found to renew.');
      return;
    }
    handleInitiatePayment(subscriptionDetails.plan_id, 'renew');
  };

  const handleSmsCountSubmit = () => {
    const smsCount = parseInt(smsCountInput, 10);
    if (isNaN(smsCount) || smsCount <= 0) {
      setError('Please enter a valid number of SMS (greater than 0).');
      return;
    }

    if (!paymentDetails) {
      setError('Payment details are missing. Please try again.');
      return;
    }

    const selectedPlan = plans.find(plan => plan.plan_id === paymentDetails.planId);
    if (!selectedPlan) {
      setError('Could not find the selected plan. Please try again.');
      return;
    }

    // Enforce the minimum SMS limit with a red popup error
    if (smsCount < selectedPlan.sms_count) {
      setError(`The number of SMS must be at least ${selectedPlan.sms_count.toLocaleString()} for the ${selectedPlan.plan_name} plan.`);
      return;
    }

    const totalAmount = calculateTotalAmount(selectedPlan, smsCount);
    setPaymentDetails({ ...paymentDetails, smsCount, totalAmount });
    setShowSmsInputModal(false);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      return;
    }

    if (!paymentDetails) {
      setError('Payment details are missing. Please try again.');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      if (paymentDetails.action === 'subscribe') {
        await subscribeToPlan(paymentDetails.planId);
      } else if (paymentDetails.action === 'upgrade') {
        await upgradeSubscription(paymentDetails.planId);
      } else if (paymentDetails.action === 'renew') {
        await renewSubscription();
      }

      setSuccess(`Successfully ${paymentDetails.action}d the plan!`);
      setShowPaymentModal(false);
      setMobileMoneyNumber('');
      setPaymentDetails(null);
      setSmsCountInput('');

      try {
        const subscriptionData = await getSubscriptionUsage();
        setSubscriptionDetails(subscriptionData);
      } catch (subErr: any) {
        console.error(`Error refreshing subscription after ${paymentDetails.action}:`, subErr.message, 'Status:', subErr.response?.status);
        setError(`Subscription was ${paymentDetails.action}d but failed to refresh details. Please reload the page.`);
      }
    } catch (err: any) {
      console.error(`Error ${paymentDetails.action}ing plan:`, err.message, 'Status:', err.response?.status);
      setError(`Failed to ${paymentDetails.action} the plan. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan = subscriptionDetails ? plans.find(plan => plan.plan_id === subscriptionDetails.plan_id) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#00333e]">SMS Service Only: Packages</h1>
        <p className="mt-4 text-xl text-[#6f888c]">Choose the perfect SMS package for your needs</p>
      </div>

      {/* Error Popup */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white rounded-lg p-4 shadow-lg max-w-md w-full"
          >
            <div className="flex justify-between items-center">
              <p>{error}</p>
              <button onClick={() => setError(null)} className="text-white hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Popup */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white rounded-lg p-4 shadow-lg max-w-md w-full"
          >
            <div className="flex justify-between items-center">
              <p>{success}</p>
              <button onClick={() => setSuccess(null)} className="text-white hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && !plans.length && (
        <div className="text-center py-12">
          <p className="text-lg text-[#6f888c]">Loading subscription plans...</p>
        </div>
      )}

      {subscriptionDetails && currentPlan && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-[#00333e]">Current Subscription</h3>
            <p className="mt-1 max-w-2xl text-sm text-[#6f888c]">Your active SMS package details</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Package</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{currentPlan.plan_name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">SMS Used</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {subscriptionDetails.sms_count.toLocaleString()} / {currentPlan.sms_count.toLocaleString()} (Min: {currentPlan.sms_count.toLocaleString()})
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Actions</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <button
                    onClick={handleRenew}
                    className="btn btn-primary mr-2"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Renew'}
                  </button>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {!isLoading && !subscriptionDetails && plans.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-700 text-center mb-4">
          <p>You don't have an active subscription. Choose a plan below to get started.</p>
        </div>
      )}

      {plans.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-x-6 mt-16">
          {plans.map((plan) => (
            <motion.div
              key={plan.plan_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-2xl border ${
                plan.plan_name.toLowerCase().includes('bumbuli') ? 'border-primary-500' : 'border-gray-200'
              } shadow-sm flex flex-col`}
            >
              {plan.plan_name.toLowerCase().includes('bumbuli') && (
                <div className="absolute top-0 right-0 -mr-1 -mt-1 px-3 py-1 bg-[#fddf0d] text-white text-sm font-medium rounded-full transform translate-x-1/2 -translate-y-1/2">
                  Popular
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900">{plan.plan_name}</h3>

                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-[#00333e]">{plan.price}</span>
                  <span className="ml-2 text-[#6f888c]">per SMS</span>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Deliverables</h4>
                  <ul className="space-y-4">
                    {plan.description.split('\n').map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                        <span className="ml-3 text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-[#6f888c]">
                    Minimum SMS Volume: {plan.sms_count.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#6f888c]">
                    Minimum Email Volume: {plan.email_count.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#6f888c]">
                    Call Minutes: {plan.call_minutes.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#6f888c]">
                    Duration: {plan.duration}
                  </p>
                </div>
              </div>

              <div className="p-8 mt-auto">
                <button
                  onClick={() => handleSubscribe(plan.plan_id)}
                  className="w-full btn flex items-center justify-center space-x-2 bg-[#00333e] text-white"
                  disabled={isLoading}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{subscriptionDetails ? 'Upgrade Plan' : 'Subscribe Now'}</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : !isLoading && (
        <div className="text-center py-12">
          <p className="text-lg text-[#6f888c]">No plans available at this time. Please check back later or contact support.</p>
        </div>
      )}

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Need a custom solution?</h2>
        <p className="mt-4 text-gray-600">
          Contact our sales team for tailored options beyond Paradiso.
        </p>
        <button
          className="mt-6 btn bg-[#00333e] text-white"
          onClick={() => setShowContactModal(true)}
        >
          Contact Sales
        </button>
      </div>

      {showSmsInputModal && paymentDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Enter Number of SMS</h2>
            <p className="text-sm text-gray-600 mb-4">
              For the <strong>{plans.find(plan => plan.plan_id === paymentDetails.planId)?.plan_name}</strong> plan, you must purchase at least{' '}
              <strong>{plans.find(plan => plan.plan_id === paymentDetails.planId)?.sms_count.toLocaleString()}</strong> SMS.
            </p>
            <input
              type="number"
              className="input mb-4 w-full"
              value={smsCountInput}
              onChange={(e) => setSmsCountInput(e.target.value)}
              placeholder="Enter number of SMS"
              step="1"
              aria-label="Number of SMS"
            />
            <button
              className="btn bg-[#00333e] text-white w-full"
              onClick={handleSmsCountSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
            <button
              className="btn bg-[#6f888c] text-white w-full mt-2"
              onClick={() => setShowSmsInputModal(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showPaymentModal && paymentDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            <p className="mb-2">
              <strong>Plan:</strong> {plans.find(plan => plan.plan_id === paymentDetails.planId)?.plan_name}
            </p>
            <p className="mb-2">
              <strong>Number of SMS:</strong> {paymentDetails.smsCount.toLocaleString()}
            </p>
            <p className="mb-4">
              <strong>Total Amount:</strong> {paymentDetails.totalAmount.toLocaleString()} TZS
            </p>
            <h3 className="text-lg font-semibold mb-2">Enter Mobile Money Number</h3>
            <input
              type="text"
              className="input mb-4 w-full"
              value={mobileMoneyNumber}
              onChange={(e) => setMobileMoneyNumber(e.target.value)}
              placeholder="+255XXXXXXXXX"
            />
            <button
              className="btn bg-[#00333e] text-white w-full"
              onClick={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Pay Now'}
            </button>
            <button
              className="btn bg-[#6f888c] text-white w-full mt-2"
              onClick={() => setShowPaymentModal(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-in-out">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#00333e]">Contact Our Sales Team</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-[#6f888c] mb-6">Reach out to our sales representatives for assistance.</p>
            <div className="space-y-4">
              {salesContacts.map((contact, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                  <p className="text-[#6f888c] mt-1">
                    <span className="font-medium">Phone:</span>{' '}
                    <a href={`tel:${contact.phone_number}`} className="hover:text-[#00333e] transition-colors">
                      {contact.phone_number}
                    </a>
                  </p>
                  <p className="text-[#6f888c] mt-1">
                    <span className="font-medium">Email:</span>{' '}
                    <a href={`mailto:${contact.email}`} className="hover:text-[#00333e] transition-colors">
                      {contact.email}
                    </a>
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowContactModal(false)}
                className="btn bg-[#00333e] text-white hover:bg-[#5a6f73] transition-colors px-6 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Subscription;