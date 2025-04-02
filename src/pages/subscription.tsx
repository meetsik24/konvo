import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check, X, MessageSquare, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getPlans,
  getUserPlan,
  getProfile,
  getSubscriptionUsage,
  purchaseSmsCredits,
  checkPaymentStatus,
} from '../services/api';
import type { RootState } from '..';

interface Contact {
  name: string;
  phone_number: string;
  email: string;
}

interface Plan {
  plan_id: string;
  name: string;
  sms_unit_price: string;
  description: string;
  minimum_sms_purchase: number;
}

interface SubscriptionUsage {
  sms_credits: number;
}

interface PaymentDetails {
  smsCount: number;
  totalAmount: number;
  planId: string;
}

const salesContacts: Contact[] = [
  {
    name: "Innocent Singo",
    phone_number: "+255 679 396 566",
    email: "sms@briq.tz",
  },
];

const Subscription: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionUsage | null>(null);
  const [userPlan, setUserPlan] = useState<Plan | null>(null);
  const [showSmsInputModal, setShowSmsInputModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [smsCountInput, setSmsCountInput] = useState('');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchPlansAndCreditBalance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const plansData = await getPlans();
        // Debug: Log plan IDs to verify uniqueness
        console.log('Plan IDs:', plansData.map((plan: Plan) => plan.plan_id));
        // Check for duplicate plan_ids
        const planIds = plansData.map((plan: Plan) => plan.plan_id);
        const uniquePlanIds = new Set(planIds);
        if (uniquePlanIds.size !== planIds.length) {
          console.warn('Duplicate plan_ids detected:', planIds);
          // If duplicates exist, we can generate unique keys for rendering
          // For now, we'll proceed and handle this in rendering if needed
        }
        setPlans(plansData);

        let planId: string | null = null;
        try {
          const userPlanData = await getUserPlan();
          setUserPlan(userPlanData);
          planId = userPlanData.plan_id;
        } catch (planErr: any) {
          console.error('Error fetching user plan:', planErr);
          try {
            const userProfile = await getProfile();
            if (userProfile.plan_id) {
              planId = userProfile.plan_id;
              const matchingPlan = plansData.find((plan: Plan) => plan.plan_id === planId);
              if (matchingPlan) {
                setUserPlan(matchingPlan);
              } else {
                console.warn('User plan_id found in profile but not in available plans:', userProfile.plan_id);
                if (plansData.length > 0) {
                  planId = plansData[0].plan_id;
                  setUserPlan(plansData[0]);
                  console.warn('Using default plan:', plansData[0].name);
                } else {
                  throw new Error('No plans available to use as a default.');
                }
              }
            } else {
              if (plansData.length > 0) {
                planId = plansData[0].plan_id;
                setUserPlan(plansData[0]);
                console.warn('User plan not found in profile. Using default plan:', plansData[0].name);
              } else {
                throw new Error('No plans available to use as a default.');
              }
            }
          } catch (profileErr: any) {
            console.error('Error fetching user profile:', profileErr);
            if (plansData.length > 0) {
              planId = plansData[0].plan_id;
              setUserPlan(plansData[0]);
              console.warn('User profile fetch failed. Using default plan:', plansData[0].name);
            } else {
              throw new Error('No plans available and user profile fetch failed.');
            }
          }
        }

        if (planId) {
          try {
            const creditBalanceData = await getSubscriptionUsage(planId);
            setSubscriptionDetails(creditBalanceData);
          } catch (subErr: any) {
            console.error('Error fetching credit balance:', subErr);
            setError('Failed to fetch credit balance. Please try again later.');
          }
        } else {
          setError('Unable to determine your plan. Please contact support.');
        }
      } catch (err: any) {
        console.error('Error fetching plans:', err);
        setError('Failed to load plans. Please check your connection and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchPlansAndCreditBalance();
    } else {
      setError('You must be logged in to view subscription plans.');
    }
  }, [token]);

  const calculateTotalAmount = (smsUnitPrice: string, smsCount: number): number => {
    if (smsCount <= 0) return 0;
    const pricePerSms = parseFloat(smsUnitPrice) || 0;
    return Math.round(smsCount * pricePerSms);
  };

  const handleInitiatePurchase = (smsUnitPrice: string) => {
    setError(null);
    setSuccess(null);
    setPaymentDetails(null);
    setSmsCountInput('');
    setPaymentReference(null);

    const selectedPlan = plans.find((plan: Plan) => plan.sms_unit_price === smsUnitPrice);
    if (selectedPlan) {
      setSmsCountInput(selectedPlan.minimum_sms_purchase.toString());
      setPaymentDetails({ smsCount: 0, totalAmount: 0, planId: selectedPlan.plan_id });
    }

    setShowSmsInputModal(true);
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

    const selectedPlan = plans.find((plan: Plan) => plan.plan_id === paymentDetails.planId);
    if (!selectedPlan) {
      setError('Could not find the selected plan. Please try again.');
      return;
    }

    if (smsCount < selectedPlan.minimum_sms_purchase) {
      setError(`The number of SMS must be at least ${selectedPlan.minimum_sms_purchase.toLocaleString()} for this plan.`);
      return;
    }

    const totalAmount = calculateTotalAmount(selectedPlan.sms_unit_price, smsCount);
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
    setIsPaymentProcessing(true);
    setShowPaymentModal(false);

    try {
      const purchaseResponse = await purchaseSmsCredits(
        paymentDetails.planId,
        paymentDetails.smsCount,
        mobileMoneyNumber
      );
      setPaymentReference(purchaseResponse.payment_reference);

      let paymentCompleted = false;
      let attempts = 0;
      const maxAttempts = 15;

      while (!paymentCompleted && attempts < maxAttempts) {
        const paymentStatus = await checkPaymentStatus(purchaseResponse.payment_reference);

        if (paymentStatus.success && paymentStatus.status === 'true') {
          paymentCompleted = true;
        } else if (paymentStatus.status === 'failed') {
          throw new Error('Payment failed. Please try again.');
        } else {
          await new Promise(resolve => setTimeout(resolve, 120000));
          attempts++;
        }
      }

      if (!paymentCompleted) {
        throw new Error('Payment processing timed out. Please check your payment status.');
      }

      let creditsUpdated = false;
      attempts = 0;

      while (!creditsUpdated && attempts < maxAttempts) {
        const creditBalanceData = await getSubscriptionUsage(paymentDetails.planId);

        const expectedCredits = (subscriptionDetails?.sms_credits || 0) + paymentDetails.smsCount;
        if (creditBalanceData.sms_credits >= expectedCredits) {
          creditsUpdated = true;
          setSubscriptionDetails(creditBalanceData);
          setSuccess(
            `Payment Successful! ${paymentDetails.smsCount.toLocaleString()} credits added. New balance: ${creditBalanceData.sms_credits.toLocaleString()}`
          );
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;
        }
      }

      if (!creditsUpdated) {
        throw new Error('Credit update failed. Please contact support.');
      }
    } catch (err: any) {
      console.error('Error during purchase:', err);
      setError(err.message || 'Payment failed. Please try again or contact support.');
    } finally {
      setIsPaymentProcessing(false);
      setMobileMoneyNumber('');
      setPaymentDetails(null);
      setSmsCountInput('');
      setPaymentReference(null);
    }
  };

  const togglePlan = (planId: string) => {
    setExpandedPlans((prev) => {
      console.log('Toggling plan:', planId, 'Previous state:', prev);
      const newState = {
        ...prev,
        [planId]: !prev[planId],
      };
      console.log('New state:', newState);
      return newState;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 sm:p-6 lg:p-8"
    >
      <AnimatePresence>
        {isLoading && !plans.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-lg p-6 shadow-md max-w-sm w-full text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00333e]" />
              <p className="text-[#6f888c] text-sm">Loading plans...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPaymentProcessing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-lg p-6 shadow-md max-w-sm w-full text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00333e]" />
              <h2 className="text-lg font-semibold text-[#00333e]">Processing Payment</h2>
              <p className="text-sm mt-2 text-[#6f888c]">
                Please complete the USSD payment on your phone...
              </p>
              {paymentReference && (
                <p className="text-xs mt-2 text-[#6f888c]">Reference: {paymentReference}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <div className="bg-[#00333e] text-white rounded-lg p-6 shadow-md max-w-sm w-full text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
              >
                <Check className="w-12 h-12 mx-auto mb-4 text-[#fddf0d]" />
              </motion.div>
              <h2 className="text-lg font-semibold">Payment Successful!</h2>
              <p className="text-sm mt-2">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="mt-4 bg-[#fddf0d] text-[#00333e] hover:bg-[#e5c90c] text-sm transition-colors duration-200 py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <div className="bg-red-500 text-white rounded-lg p-6 shadow-md max-w-sm w-full text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
              >
                <X className="w-12 h-12 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-lg font-semibold">Error</h2>
              <p className="text-sm mt-2">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-4 bg-white text-red-500 hover:bg-gray-100 text-sm transition-colors duration-200 py-2 px-4 rounded-lg"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#00333e]">SMS Credit Packages</h1>
        <p className="mt-2 sm:mt-4 text-base sm:text-lg lg:text-xl text-[#6f888c]">
          Purchase SMS credits to reach your audience
        </p>
      </div>

      {subscriptionDetails && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white shadow-sm rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-md mx-auto w-full"
        >
          <div className="flex items-center justify-center space-x-3 sm:space-x-4">
            <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-[#00333e]" />
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-[#00333e]">Your SMS Credits</h3>
              <p className="mt-1 sm:mt-2 text-2xl sm:text-4xl font-bold text-[#00333e]">
                {subscriptionDetails.sms_credits.toLocaleString()}
              </p>
              <p className="mt-1 text-xs sm:text-sm text-[#6f888c]">Available Credits</p>
            </div>
          </div>
        </motion.div>
      )}

      {plans.length > 0 ? (
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-x-6 mt-8 sm:mt-12 lg:mt-16">
          {plans.map((plan: Plan, index: number) => {
            const isExpanded = expandedPlans[plan.plan_id] || false;
            return (
              <motion.div
                key={plan.plan_id} // Ensure the key is unique
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative rounded-2xl border ${
                  plan.name.toLowerCase().includes('paradiso') ? 'border-[#fddf0d]' : 'border-gray-200'
                } shadow-sm bg-white flex flex-col transition-all duration-200`}
              >
                {plan.name.toLowerCase().includes('paradiso') && (
                  <div className="absolute top-0 right-0 -mr-1 -mt-1 px-2 sm:px-3 py-1 bg-[#fddf0d] text-[#00333e] text-xs sm:text-sm font-medium rounded-full transform translate-x-1/2 -translate-y-1/2">
                    Popular
                  </div>
                )}

                <div className={`p-4 sm:p-6 ${isExpanded ? 'pb-0 sm:pb-0' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-semibold text-[#00333e]">{plan.name}</h3>
                      <div className="mt-2 sm:mt-3">
                        <span className="text-xl sm:text-2xl font-extrabold text-[#00333e]">{plan.sms_unit_price}</span>
                        <span className="ml-1 sm:ml-2 text-sm sm:text-base text-[#6f888c]">TZS per SMS</span>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePlan(plan.plan_id)}
                      className="p-1 rounded-full hover:bg-[#fddf0d] hover:text-[#00333e] transition-colors duration-200"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-[#00333e]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#00333e]" />
                      )}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 sm:p-6 pt-0">
                        <div className="mt-4 sm:mt-6">
                          <h4 className="text-xs sm:text-sm font-medium text-[#00333e] mb-3 sm:mb-4">Features</h4>
                          <ul className="space-y-2 sm:space-y-3">
                            {plan.description.split(', ').map((feature: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#00333e] shrink-0" />
                                <span className="ml-2 sm:ml-3 text-sm sm:text-base text-gray-700">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-4 sm:mt-6">
                          <p className="text-xs sm:text-sm text-[#6f888c]">
                            Minimum SMS Purchase: {plan.minimum_sms_purchase.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 sm:p-6 mt-auto">
                        <button
                          onClick={() => handleInitiatePurchase(plan.sms_unit_price)}
                          className="w-full flex items-center justify-center space-x-1 sm:space-x-2 bg-[#00333e] text-white text-sm sm:text-base py-2 rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
                          disabled={isLoading || isPaymentProcessing}
                        >
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>Purchase Credits</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      ) : !isLoading && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-base sm:text-lg text-[#6f888c]">No plans available at this time. Please check back later or contact support.</p>
        </div>
      )}

      <div className="mt-8 sm:mt-12 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#00333e]">Need a custom solution?</h2>
        <p className="mt-2 sm:mt-4 text-sm sm:text-base text-[#6f888c]">
          Contact our sales team for tailored options beyond Paradiso.
        </p>
        <button
          className="mt-4 sm:mt-6 bg-[#00333e] text-white text-sm sm:text-base py-2 px-4 rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
          onClick={() => setShowContactModal(true)}
          disabled={isLoading || isPaymentProcessing}
        >
          Contact Sales
        </button>
      </div>

      {showSmsInputModal && paymentDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4 sm:p-0">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[#00333e]">Enter Number of SMS Credits</h2>
            <p className="text-xs sm:text-sm text-[#6f888c] mb-3 sm:mb-4">
              You must purchase at least{' '}
              <strong>{plans.find((plan: Plan) => plan.plan_id === paymentDetails.planId)?.minimum_sms_purchase.toLocaleString()}</strong> SMS credits.
            </p>
            <input
              type="number"
              className="w-full text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent mb-3 sm:mb-4"
              value={smsCountInput}
              onChange={(e) => setSmsCountInput(e.target.value)}
              placeholder="Enter number of SMS credits"
              step="1"
              disabled={isPaymentProcessing}
            />
            <button
              className="w-full text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
              onClick={handleSmsCountSubmit}
              disabled={isPaymentProcessing}
            >
              Continue
            </button>
            <button
              className="w-full text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 mt-1 sm:mt-2"
              onClick={() => setShowSmsInputModal(false)}
              disabled={isPaymentProcessing}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showPaymentModal && paymentDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4 sm:p-0">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-sm sm:max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[#00333e]">Payment Details</h2>
            <p className="mb-1 sm:mb-2 text-sm sm:text-base text-[#6f888c]">
              <strong>Number of SMS Credits:</strong> {paymentDetails.smsCount.toLocaleString()}
            </p>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base text-[#6f888c]">
              <strong>Total Amount:</strong> {paymentDetails.totalAmount.toLocaleString()} TZS
            </p>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-[#00333e]">Enter Mobile Money Number</h3>
            <input
              type="text"
              className="w-full text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent mb-3 sm:mb-4"
              value={mobileMoneyNumber}
              onChange={(e) => setMobileMoneyNumber(e.target.value)}
              placeholder="+255XXXXXXXXX"
              disabled={isPaymentProcessing}
            />
            <button
              className="w-full text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
              onClick={handlePurchase}
              disabled={isPaymentProcessing}
            >
              Pay Now
            </button>
            <button
              className="w-full text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 mt-1 sm:mt-2"
              onClick={() => setShowPaymentModal(false)}
              disabled={isPaymentProcessing}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showContactModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4 sm:p-0">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-sm sm:max-w-md">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-[#00333e]">Contact Our Sales Team</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isPaymentProcessing}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#6f888c] mb-4 sm:mb-6">Reach out to our sales representatives for assistance.</p>
            <div className="space-y-3 sm:space-y-4">
              {salesContacts.map((contact: Contact, index: number) => (
                <div key={index} className="border-b border-gray-200 pb-3 sm:pb-4 last:border-b-0">
                  <h3 className="text-base sm:text-lg font-semibold text-[#00333e]">{contact.name}</h3>
                  <p className="text-xs sm:text-sm text-[#6f888c] mt-1">
                    <span className="font-medium">Phone:</span>{' '}
                    <a href={`tel:${contact.phone_number}`} className="hover:text-[#fddf0d] transition-colors">
                      {contact.phone_number}
                    </a>
                  </p>
                  <p className="text-xs sm:text-sm text-[#6f888c] mt-1">
                    <span className="font-medium">Email:</span>{' '}
                    <a href={`mailto:${contact.email}`} className="hover:text-[#fddf0d] transition-colors">
                      {contact.email}
                    </a>
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 sm:mt-6 flex justify-end">
              <button
                onClick={() => setShowContactModal(false)}
                className="bg-[#00333e] text-white hover:bg-[#005a6e] transition-colors px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base"
                disabled={isPaymentProcessing}
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