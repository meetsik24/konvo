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

interface Plan {
  plan_id: string;
  name: string;
  sms_unit_price: string;
  description: string;
  minimum_sms_purchase: number;
  max_sms_purchase?: number;
}

interface SubscriptionUsage {
  sms_credits: number;
}

interface PaymentDetails {
  smsCount: number;
  totalAmount: number;
  planId: string;
  planName: string;
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
        const plansData = await getPlans();
        console.log('Raw API Plans Response:', plansData);
        if (!Array.isArray(plansData) || plansData.length === 0) {
          throw new Error('No plans returned from API or invalid response format.');
        }

        // Assign max_sms_purchase based on the next plan's minimum_sms_purchase
        const sortedPlans = plansData
          .map((plan: Plan, index: number) => {
            const nextPlan = plansData[index + 1];
            return {
              ...plan,
              max_sms_purchase: nextPlan ? nextPlan.minimum_sms_purchase - 1 : Infinity,
              sms_unit_price: String(plan.sms_unit_price), // Ensure sms_unit_price is a string
            };
          })
          .sort((a: Plan, b: Plan) => a.minimum_sms_purchase - b.minimum_sms_purchase);
        console.log('Processed Plans:', sortedPlans);
        setPlans(sortedPlans);

        let planId: string | null = null;
        try {
          const userPlanData = await getUserPlan();
          console.log('User Plan:', userPlanData);
          setUserPlan(userPlanData);
          planId = userPlanData.plan_id;
        } catch (planErr: any) {
          console.error('Error fetching user plan:', planErr);
          try {
            const userProfile = await getProfile();
            console.log('User Profile:', userProfile);
            if (userProfile.plan_id) {
              planId = userProfile.plan_id;
              const matchingPlan = sortedPlans.find((plan: Plan) => plan.plan_id === planId);
              if (matchingPlan) {
                setUserPlan(matchingPlan);
              } else {
                console.warn('User plan_id not found in plans:', userProfile.plan_id);
                setError('Your plan is not recognized. Please contact support.');
              }
            } else {
              console.warn('No plan_id in user profile.');
              setError('No plan assigned to your account. Please contact support.');
            }
          } catch (profileErr: any) {
            console.error('Error fetching user profile:', profileErr);
            setError('Failed to load user profile. Please contact support.');
          }
        }

        if (planId) {
          try {
            const creditBalanceData = await getSubscriptionUsage(planId);
            console.log('Credit Balance:', creditBalanceData);
            setSubscriptionDetails(creditBalanceData);
          } catch (subErr: any) {
            console.error('Error fetching credit balance:', subErr);
            setError('Failed to fetch credit balance. Please try again later.');
          }
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
    if (smsCount <= 0 || !smsUnitPrice) {
      console.warn('Invalid inputs for calculation:', { smsUnitPrice, smsCount });
      return 0;
    }
    const pricePerSms = parseFloat(smsUnitPrice);
    if (isNaN(pricePerSms)) {
      console.warn('Invalid sms_unit_price:', smsUnitPrice);
      return 0;
    }
    const total = smsCount * pricePerSms;
    const roundedTotal = Math.round(total); // Round to whole TZS
    console.log('Calculated Total:', { smsCount, pricePerSms, total, roundedTotal });
    return roundedTotal;
  };

  const getPlanForSmsCount = (smsCount: number): Plan | null => {
    console.log('Selecting plan for SMS count:', smsCount);
    if (!plans.length) {
      console.warn('No plans available for selection.');
      return null;
    }
    const selectedPlan = plans.find((plan) => {
      const maxPurchase = plan.max_sms_purchase || Infinity;
      const isInRange = smsCount >= plan.minimum_sms_purchase && smsCount <= maxPurchase;
      console.log(`Checking plan ${plan.name}: ${plan.minimum_sms_purchase.toLocaleString()}–${maxPurchase === Infinity ? '∞' : maxPurchase.toLocaleString()} | Price: ${plan.sms_unit_price} TZS/SMS | In range: ${isInRange}`);
      return isInRange;
    });
    if (!selectedPlan) {
      console.warn('No plan found for SMS count:', smsCount);
    } else {
      console.log('Selected plan:', selectedPlan);
    }
    return selectedPlan || null;
  };

  const handleInitiatePurchase = () => {
    setError(null);
    setSuccess(null);
    setPaymentDetails(null);
    setSmsCountInput('');
    setPaymentReference(null);
    setShowSmsInputModal(true);
  };

  const handleSmsCountSubmit = () => {
    const smsCount = parseInt(smsCountInput, 10);
    if (isNaN(smsCount) || smsCount <= 0) {
      setError('Please enter a valid number of SMS (greater than 0).');
      return;
    }

    const selectedPlan = getPlanForSmsCount(smsCount);
    if (!selectedPlan) {
      setError(
        `The entered SMS count (${smsCount.toLocaleString()}) does not meet the requirements for any available plan. ` +
        `Please enter a value between 1–5,999 for Kitonga (20 TZS/SMS), 6,000–54,999 for Bumbuli (18 TZS/SMS), ` +
        `55,000–409,999 for Kibaigwa (16 TZS/SMS), 410,000–500,000 for Kilimahewa (14 TZS/SMS), or 500,001+ for Paradiso (13 TZS/SMS).`
      );
      return;
    }

    const totalAmount = calculateTotalAmount(selectedPlan.sms_unit_price, smsCount);
    if (totalAmount === 0) {
      setError('Failed to calculate total amount. Please check the SMS count and try again.');
      return;
    }

    setPaymentDetails({
      smsCount,
      totalAmount,
      planId: selectedPlan.plan_id,
      planName: selectedPlan.name,
    });
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

    console.log('Initiating purchase:', paymentDetails);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-4 sm:p-6 lg:p-8"
    >
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00333e]" />
              <p className="text-[#6f888c] text-sm">Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPaymentProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <div className="bg-[#00333e] text-white rounded-lg p-6 max-w-sm w-full text-center">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          >
            <div className="bg-red-500 text-white rounded-lg p-6 max-w-sm w-full text-center">
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

      {subscriptionDetails !== null ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-md mx-auto w-full"
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
      ) : (
        <div className="text-center py-8 sm:py-12">
          <p className="text-base sm:text-lg text-[#6f888c]">
            Unable to load SMS credits. Please refresh or contact support.
          </p>
        </div>
      )}

      <div className="text-center mt-8 sm:mt-12">
        <button
          onClick={handleInitiatePurchase}
          className="bg-[#00333e] text-white text-sm sm:text-base py-2 px-4 rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
          disabled={isLoading || isPaymentProcessing || plans.length === 0}
        >
          Purchase SMS Credits
        </button>
      </div>

      <div className="mt-8 sm:mt-12 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#00333e]">Need a custom solution?</h2>
        <p className="mt-2 sm:mt-4 text-sm sm:text-base text-[#6f888c]">
          Contact our sales team for tailored options.
        </p>
        <button
          className="mt-4 sm:mt-6 bg-[#00333e] text-white text-sm sm:text-base py-2 px-4 rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
          onClick={() => setShowContactModal(true)}
          disabled={isLoading || isPaymentProcessing}
        >
          Contact Sales
        </button>
      </div>

      {showSmsInputModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4 sm:p-0"
        >
          <div className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-sm sm:max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[#00333e]">
              Enter Number of SMS Credits
            </h2>
            <p className="text-xs sm:text-sm text-[#6f888c] mb-3 sm:mb-4">
              Enter the number of SMS credits you wish to purchase. The appropriate plan will be selected based on your input (e.g., 1–5,999 for Kitonga, 6,000–54,999 for Bumbuli).
            </p>
            <input
              type="number"
              className="w-full text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent mb-3 sm:mb-4"
              value={smsCountInput}
              onChange={(e) => setSmsCountInput(e.target.value)}
              placeholder="Enter number of SMS credits"
              step="1"
              min="1"
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
        </motion.div>
      )}

      {showPaymentModal && paymentDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4 sm:p-0"
        >
          <div className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-sm sm:max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[#00333e]">Confirm Purchase</h2>
            <div className="space-y-4">
              <p className="text-sm sm:text-base text-[#6f888c]">
                <strong>Plan:</strong> {paymentDetails.planName}
              </p>
              <p className="text-sm sm:text-base text-[#6f888c]">
                <strong>Credits:</strong> {paymentDetails.smsCount.toLocaleString()} SMS
              </p>
              <p className="text-sm sm:text-base text-[#6f888c]">
                <strong>Unit Price:</strong> {plans.find(p => p.plan_id === paymentDetails.planId)?.sms_unit_price} TZS/SMS
              </p>
              <p className="text-sm sm:text-base text-[#6f888c]">
                <strong>Total Cost:</strong> {paymentDetails.totalAmount.toLocaleString()} TZS
              </p>
              <input
                type="text"
                className="w-full text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent mb-3 sm:mb-4"
                value={mobileMoneyNumber}
                onChange={(e) => setMobileMoneyNumber(e.target.value)}
                placeholder="Mobile Money Number"
                disabled={isPaymentProcessing}
              />
              <p className="text-sm sm:text-base text-[#6f888c]">
                CREDIT DESCRIPTION: {paymentDetails.smsCount.toLocaleString()} SMS credits for {paymentDetails.planName}
              </p>
              <button
                className="w-full text-sm sm:text-base py-2 sm:py-3 px-3 sm:px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
                onClick={handlePurchase}
                disabled={isPaymentProcessing || !mobileMoneyNumber.trim()}
              >
                PURCHASE
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
        </motion.div>
      )}

      {showContactModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4 sm:p-0"
        >
          <div className="bg-white p-6 sm:p-8 rounded-lg w-full max-w-sm sm:max-w-md">
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
            <p className="text-xs sm:text-sm text-[#6f888c] mb-4 sm:mb-6">
              Reach out to our sales representatives for assistance.
            </p>
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
        </motion.div>
      )}
    </motion.div>
  );
};

export default Subscription;