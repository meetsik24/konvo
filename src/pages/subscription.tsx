import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Check, X, MessageSquare, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    const fetchPlansAndCreditBalance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch plans
        const plansData = await getPlans();
        setPlans(plansData);

        // Try to fetch the user's plan to get the plan_id
        let planId: string | null = null;
        try {
          const userPlanData = await getUserPlan();
          setUserPlan(userPlanData);
          planId = userPlanData.plan_id;
        } catch (planErr: any) {
          console.error('Error fetching user plan:', planErr);
          // Fallback: If /users/me/plan fails, try to get plan_id from user profile
          try {
            const userProfile = await getProfile();
            if (userProfile.plan_id) {
              planId = userProfile.plan_id;
              const matchingPlan = plansData.find(plan => plan.plan_id === planId);
              if (matchingPlan) {
                setUserPlan(matchingPlan);
              } else {
                console.warn('User plan_id found in profile but not in available plans:', userProfile.plan_id);
                // Fallback to the first plan if the plan_id doesn't match any available plans
                if (plansData.length > 0) {
                  planId = plansData[0].plan_id;
                  setUserPlan(plansData[0]);
                  console.warn('Using default plan:', plansData[0].name);
                } else {
                  throw new Error('No plans available to use as a default.');
                }
              }
            } else {
              // If no plan_id is found in the profile, use the first plan as a default
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
            // If profile fetch fails, fall back to the first plan
            if (plansData.length > 0) {
              planId = plansData[0].plan_id;
              setUserPlan(plansData[0]);
              console.warn('User profile fetch failed. Using default plan:', plansData[0].name);
            } else {
              throw new Error('No plans available and user profile fetch failed.');
            }
          }
        }

        // Fetch credit balance with plan_id
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

    const selectedPlan = plans.find(plan => plan.sms_unit_price === smsUnitPrice);
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

    const selectedPlan = plans.find(plan => plan.plan_id === paymentDetails.planId);
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
      // Step 1: Initiate the payment
      const purchaseResponse = await purchaseSmsCredits(
        paymentDetails.planId,
        paymentDetails.smsCount,
        mobileMoneyNumber
      );
      setPaymentReference(purchaseResponse.payment_reference);

      // Step 2: Poll payment status
      let paymentCompleted = false;
      let attempts = 0;
      const maxAttempts = 15; // Poll for up to 30 seconds (15 attempts x 2 seconds)

      while (!paymentCompleted && attempts < maxAttempts) {
        const paymentStatus = await checkPaymentStatus(purchaseResponse.payment_reference);

        if (paymentStatus.success && paymentStatus.status === 'true') {
          paymentCompleted = true;
        } else if (paymentStatus.status === 'failed') {
          throw new Error('Payment failed. Please try again.');
        } else {
          // Wait 2 Minutes before the next poll
          await new Promise(resolve => setTimeout(resolve, 120000));
          attempts++;
        }
      }

      if (!paymentCompleted) {
        throw new Error('Payment processing timed out. Please check your payment status.');
      }

      // Step 3: Poll credit balance to confirm update
      let creditsUpdated = false;
      attempts = 0;

      while (!creditsUpdated && attempts < maxAttempts) {
        const creditBalanceData = await getSubscriptionUsage(paymentDetails.planId);

        // Check if the SMS credits have increased by the purchased amount
        const expectedCredits = (subscriptionDetails?.sms_credits || 0) + paymentDetails.smsCount;
        if (creditBalanceData.sms_credits >= expectedCredits) {
          creditsUpdated = true;
          setSubscriptionDetails(creditBalanceData);
          setSuccess(
            `Payment Successful! ${paymentDetails.smsCount.toLocaleString()} credits added. New balance: ${creditBalanceData.sms_credits.toLocaleString()}`
          );
        } else {
          // Wait 2 seconds before the next poll
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8"
    >
      <AnimatePresence>
        {isLoading && !plans.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00333e]" />
              <p className="text-[#6f888c]">Loading plans...</p>
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
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
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
            <div className="bg-green-500 text-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
              >
                <Check className="w-12 h-12 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-lg font-semibold">Payment Successful!</h2>
              <p className="text-sm mt-2">{success}</p>
              <button
                onClick={() => setSuccess(null)}
                className="mt-4 btn bg-white text-green-500 hover:bg-gray-100 text-sm"
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
            <div className="bg-red-500 text-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
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
                className="mt-4 btn bg-white text-red-500 hover:bg-gray-100 text-sm"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#00333e]">SMS Credit Packages</h1>
        <p className="mt-2 sm:mt-4 text-base sm:text-lg lg:text-xl text-[#6f888c]">Purchase SMS credits to reach your audience</p>
      </div>

      {subscriptionDetails && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-md mx-auto w-full"
        >
          <div className="flex items-center justify-center space-x-3 sm:space-x-4">
            <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
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
                <div className="absolute top-0 right-0 -mr-1 -mt-1 px-2 sm:px-3 py-1 bg-[#fddf0d] text-white text-xs sm:text-sm font-medium rounded-full transform translate-x-1/2 -translate-y-1/2">
                  Popular
                </div>
              )}

              <div className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-3 sm:mt-4">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#00333e]">{plan.sms_unit_price}</span>
                  <span className="ml-1 sm:ml-2 text-sm sm:text-base text-[#6f888c]">TZS per SMS</span>
                </div>
                <div className="mt-4 sm:mt-6">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-3 sm:mb-4">Features</h4>
                  <ul className="space-y-3 sm:space-y-4">
                    {plan.description.split(', ').map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
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

              <div className="p-6 sm:p-8 mt-auto">
                <button
                  onClick={() => handleInitiatePurchase(plan.sms_unit_price)}
                  className="w-full btn flex items-center justify-center space-x-1 sm:space-x-2 bg-[#00333e] text-white text-sm sm:text-base"
                  disabled={isLoading || isPaymentProcessing}
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Purchase Credits</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : !isLoading && (
        <div className="text-center py-8 sm:py-12">
          <p className="text-base sm:text-lg text-[#6f888c]">No plans available at this time. Please check back later or contact support.</p>
        </div>
      )}

      <div className="mt-8 sm:mt-12 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Need a custom solution?</h2>
        <p className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-600">
          Contact our sales team for tailored options beyond Paradiso.
        </p>
        <button
          className="mt-4 sm:mt-6 btn bg-[#00333e] text-white text-sm sm:text-base"
          onClick={() => setShowContactModal(true)}
          disabled={isLoading || isPaymentProcessing}
        >
          Contact Sales
        </button>
      </div>

      {showSmsInputModal && paymentDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4 sm:p-0">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Enter Number of SMS Credits</h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              You must purchase at least{' '}
              <strong>{plans.find(plan => plan.plan_id === paymentDetails.planId)?.minimum_sms_purchase.toLocaleString()}</strong> SMS credits.
            </p>
            <input
              type="number"
              className="input mb-3 sm:mb-4 w-full text-sm sm:text-base"
              value={smsCountInput}
              onChange={(e) => setSmsCountInput(e.target.value)}
              placeholder="Enter number of SMS credits"
              step="1"
              disabled={isPaymentProcessing}
            />
            <button
              className="btn bg-[#00333e] text-white w-full text-sm sm:text-base"
              onClick={handleSmsCountSubmit}
              disabled={isPaymentProcessing}
            >
              Continue
            </button>
            <button
              className="btn bg-[#6f888c] text-white w-full mt-1 sm:mt-2 text-sm sm:text-base"
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
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Payment Details</h2>
            <p className="mb-1 sm:mb-2 text-sm sm:text-base">
              <strong>Number of SMS Credits:</strong> {paymentDetails.smsCount.toLocaleString()}
            </p>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base">
              <strong>Total Amount:</strong> {paymentDetails.totalAmount.toLocaleString()} TZS
            </p>
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Enter Mobile Money Number</h3>
            <input
              type="text"
              className="input mb-3 sm:mb-4 w-full text-sm sm:text-base"
              value={mobileMoneyNumber}
              onChange={(e) => setMobileMoneyNumber(e.target.value)}
              placeholder="+255XXXXXXXXX"
              disabled={isPaymentProcessing}
            />
            <button
              className="btn bg-[#00333e] text-white w-full text-sm sm:text-base"
              onClick={handlePurchase}
              disabled={isPaymentProcessing}
            >
              Pay Now
            </button>
            <button
              className="btn bg-[#6f888c] text-white w-full mt-1 sm:mt-2 text-sm sm:text-base"
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
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md">
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
              {salesContacts.map((contact, index) => (
                <div key={index} className="border-b border-gray-200 pb-3 sm:pb-4 last:border-b-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">{contact.name}</h3>
                  <p className="text-xs sm:text-sm text-[#6f888c] mt-1">
                    <span className="font-medium">Phone:</span>{' '}
                    <a href={`tel:${contact.phone_number}`} className="hover:text-[#00333e] transition-colors">
                      {contact.phone_number}
                    </a>
                  </p>
                  <p className="text-xs sm:text-sm text-[#6f888c] mt-1">
                    <span className="font-medium">Email:</span>{' '}
                    <a href={`mailto:${contact.email}`} className="hover:text-[#00333e] transition-colors">
                      {contact.email}
                    </a>
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 sm:mt-6 flex justify-end">
              <button
                onClick={() => setShowContactModal(false)}
                className="btn bg-[#00333e] text-white hover:bg-[#5a6f73] transition-colors px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base"
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