import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check, X, MessageSquare } from 'lucide-react';
import {
  getPlans,
  getPlanById,
  getSubscriptionUsage,
  purchaseSmsCredits,
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
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
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
    const fetchPlansAndCreditBalance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch all plans
        const plansData = await getPlans();
        console.log('Fetched plans:', plansData);
        setPlans(plansData);

        // Fetch user credit balance
        try {
          const creditBalanceData = await getSubscriptionUsage();
          setSubscriptionDetails(creditBalanceData);

          // Fetch the current plan if the user has a plan_id (for button logic)
          if (creditBalanceData.plan_id) {
            try {
              const currentPlanData = await getPlanById(creditBalanceData.plan_id);
              setCurrentPlan(currentPlanData);
            } catch (planErr: any) {
              console.error('Error fetching current plan:', planErr.message);
              setError(planErr.message || 'Failed to fetch current plan details.');
            }
          }
        } catch (subErr: any) {
          console.error('Error fetching credit balance:', subErr.message);
          setError(subErr.message || 'Failed to fetch credit balance.');
        }
      } catch (err: any) {
        console.error('Error fetching plans:', err.message);
        setError(err.message || 'Failed to load plans. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchPlansAndCreditBalance();
    } else {
      console.error('No authentication token available');
      setError('You must be logged in to view subscription plans.');
    }
  }, [token]);

  const calculateTotalAmount = (plan: Plan, smsCount: number): number => {
    if (smsCount <= 0) return 0;

    const pricePerSms = parseFloat(plan.sms_unit_price) || 0;
    const totalAmount = smsCount * pricePerSms;
    return Math.round(totalAmount);
  };

  const handleInitiatePurchase = (planId: string) => {
    setError(null);
    setSuccess(null);
    setPaymentDetails(null);
    setSmsCountInput('');

    const selectedPlan = plans.find(plan => plan.plan_id === planId);
    if (selectedPlan) {
      setSmsCountInput(selectedPlan.minimum_sms_purchase.toString());
    }

    setShowSmsInputModal(true);
    setPaymentDetails({ planId, smsCount: 0, totalAmount: 0 });
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

    if (smsCount < selectedPlan.minimum_sms_purchase) {
      setError(`The number of SMS must be at least ${selectedPlan.minimum_sms_purchase.toLocaleString()} for the ${selectedPlan.name} plan.`);
      return;
    }

    const totalAmount = calculateTotalAmount(selectedPlan, smsCount);
    setPaymentDetails({ ...paymentDetails, smsCount, totalAmount });
    setShowSmsInputModal(false);
    setShowPaymentModal(true);
  };

  const handlePurchase = async () => {
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
      await purchaseSmsCredits(paymentDetails.planId, paymentDetails.smsCount, mobileMoneyNumber);
      setSuccess(
        paymentDetails.planId === subscriptionDetails?.plan_id
          ? 'Successfully purchased SMS credits!'
          : 'Successfully updated plan and purchased SMS credits!'
      );
      setShowPaymentModal(false);
      setMobileMoneyNumber('');
      setPaymentDetails(null);
      setSmsCountInput('');

      try {
        const creditBalanceData = await getSubscriptionUsage();
        setSubscriptionDetails(creditBalanceData);

        // Fetch the new current plan if the plan_id has changed
        if (creditBalanceData.plan_id !== currentPlan?.plan_id) {
          const newPlanData = await getPlanById(creditBalanceData.plan_id);
          setCurrentPlan(newPlanData);
        }
      } catch (subErr: any) {
        console.error('Error refreshing credit balance after purchase:', subErr.message);
        setError(subErr.message || 'SMS credits were purchased but failed to refresh balance. Please reload the page.');
      }
    } catch (err: any) {
      console.error('Error purchasing SMS credits:', err.message);
      setError(err.message || 'Failed to purchase SMS credits. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#00333e]">SMS Credit Packages</h1>
        <p className="mt-4 text-xl text-[#6f888c]">Purchase SMS credits to reach your audience</p>
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
          <p className="text-lg text-[#6f888c]">Loading plans...</p>
        </div>
      )}

      {subscriptionDetails && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-xl p-6 mb-8 max-w-md mx-auto"
        >
          <div className="flex items-center justify-center space-x-4">
            <MessageSquare className="w-10 h-10 text-blue-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-[#00333e]">Your SMS Credits</h3>
              <p className="mt-2 text-4xl font-bold text-[#00333e]">
                {subscriptionDetails.sms_credits.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-[#6f888c]">Available Credits</p>
            </div>
          </div>
        </motion.div>
      )}

      {plans.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-x-6 mt-16">
          {plans.map((plan) => (
            <motion.div
              key={plan.plan_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative rounded-2xl border ${
                plan.name.toLowerCase().includes('paradiso') ? 'border-primary-500' : 'border-gray-200'
              } shadow-sm flex flex-col`}
            >
              {plan.name.toLowerCase().includes('paradiso') && (
                <div className="absolute top-0 right-0 -mr-1 -mt-1 px-3 py-1 bg-[#fddf0d] text-white text-sm font-medium rounded-full transform translate-x-1/2 -translate-y-1/2">
                  Popular
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>

                <div className="mt-4">
                  <span className="text-3xl font-extrabold text-[#00333e]">{plan.sms_unit_price}</span>
                  <span className="ml-2 text-[#6f888c]">TZS per SMS</span>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Features</h4>
                  <ul className="space-y-4">
                    {plan.description.split(', ').map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                        <span className="ml-3 text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <p className="text-sm text-[#6f888c]">
                    Minimum SMS Purchase: {plan.minimum_sms_purchase.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-8 mt-auto">
                <button
                  onClick={() => handleInitiatePurchase(plan.plan_id)}
                  className="w-full btn flex items-center justify-center space-x-2 bg-[#00333e] text-white"
                  disabled={isLoading}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>
                    {subscriptionDetails?.plan_id === plan.plan_id ? 'Purchase More Credits' : 'Switch to This Plan'}
                  </span>
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
            <h2 className="text-xl font-semibold mb-4">Enter Number of SMS Credits</h2>
            <p className="text-sm text-gray-600 mb-4">
              For the <strong>{plans.find(plan => plan.plan_id === paymentDetails.planId)?.name}</strong> plan, you must purchase at least{' '}
              <strong>{plans.find(plan => plan.plan_id === paymentDetails.planId)?.minimum_sms_purchase.toLocaleString()}</strong> SMS credits.
            </p>
            <input
              type="number"
              className="input mb-4 w-full"
              value={smsCountInput}
              onChange={(e) => setSmsCountInput(e.target.value)}
              placeholder="Enter number of SMS credits"
              step="1"
              aria-label="Number of SMS credits"
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
              <strong>Plan:</strong> {plans.find(plan => plan.plan_id === paymentDetails.planId)?.name}
            </p>
            <p className="mb-2">
              <strong>Number of SMS Credits:</strong> {paymentDetails.smsCount.toLocaleString()}
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
              onClick={handlePurchase}
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