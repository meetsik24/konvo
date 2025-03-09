import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { CreditCard, Check, MessageSquare } from 'lucide-react';
import { getPlans, getSubscriptionUsage, subscribeToPlan, renewSubscription, upgradeSubscription } from '../services/api';
import type { RootState } from '../store';

interface Plan {
  plan_name: string;
  description: string;
  sms_count: number;
  email_count: number;
  call_minutes: number;
  price: string;
  duration: string;
  plan_id: string;
  isContactSales?: boolean; // Added for UI logic
}

interface SubscriptionUsage {
  user_id: string;
  plan_id: string;
  sms_count: number;
  email_count: number;
  call_minute_count: number;
  timestamp: string;
}

const Subscription: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionUsage | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch plans and subscription details on mount
  useEffect(() => {
    const fetchPlansAndSubscription = async () => {
      setIsLoading(true);
      try {
        // Fetch plans
        const plansData = await getPlans(token);
        // Add isContactSales flag for plans with "Contact Sales" pricing
        const updatedPlans = plansData.map(plan => ({
          ...plan,
          isContactSales: plan.price.toLowerCase().includes('contact sales'),
        }));
        setPlans(updatedPlans);

        // Fetch subscription usage
        const subscriptionData = await getSubscriptionUsage(token);
        setSubscriptionDetails(subscriptionData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load plans or subscription details.');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchPlansAndSubscription();
    }
  }, [token]);

  // Handle subscription actions
  const handleSubscribe = async (planId: string) => {
    setError(null);
    setSuccess(null);
    setSelectedPlanId(planId);

    const selectedPlan = plans.find(plan => plan.plan_id === planId);
    if (selectedPlan?.isContactSales) {
      console.log('Redirecting to contact sales for plan:', planId);
      // Could redirect to a contact form or sales page
      return;
    }

    // If already subscribed, treat as upgrade
    if (subscriptionDetails) {
      await handleUpgrade(planId);
    } else {
      setShowPaymentModal(true);
    }
  };

  const handleRenew = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      await renewSubscription(token);
      setSuccess('Subscription renewed successfully!');
      // Refetch subscription details
      const subscriptionData = await getSubscriptionUsage(token);
      setSubscriptionDetails(subscriptionData);
    } catch (err: any) {
      console.error('Error renewing subscription:', err);
      setError('Failed to renew subscription.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      await upgradeSubscription(token, planId);
      setSuccess('Subscription upgraded successfully!');
      // Refetch subscription details
      const subscriptionData = await getSubscriptionUsage(token);
      setSubscriptionDetails(subscriptionData);
    } catch (err: any) {
      console.error('Error upgrading subscription:', err);
      setError('Failed to upgrade subscription.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlanId) return;

    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      await subscribeToPlan(token, selectedPlanId);
      setSuccess('Successfully subscribed to the plan!');
      setShowPaymentModal(false);
      setMobileMoneyNumber('');
      setSelectedPlanId(null);
      // Refetch subscription details
      const subscriptionData = await getSubscriptionUsage(token);
      setSubscriptionDetails(subscriptionData);
    } catch (err: any) {
      console.error('Error subscribing to plan:', err);
      setError('Failed to subscribe to the plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan = plans.find(plan => plan.plan_id === subscriptionDetails?.plan_id);

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

      {/* Error and Success Messages */}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {success && <div className="text-green-500 text-center mb-4">{success}</div>}

      {/* Current Subscription */}
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
                <dt className="text-sm font-medium text-gray-500">Email Used</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {subscriptionDetails.email_count.toLocaleString()} / {currentPlan.email_count.toLocaleString()}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Call Minutes Used</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {subscriptionDetails.call_minute_count.toLocaleString()} / {currentPlan.call_minutes.toLocaleString()}
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
                    Renew
                  </button>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Plans List */}
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
                className={`w-full btn flex items-center justify-center space-x-2 ${
                  plan.isContactSales ? 'btn-outline' : 'bg-[#00333e] text-white'
                }`}
                disabled={isLoading}
              >
                <CreditCard className="w-5 h-5" />
                <span>{plan.isContactSales ? 'Contact Sales' : subscriptionDetails ? 'Upgrade Plan' : 'Subscribe Now'}</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Need a custom solution?</h2>
        <p className="mt-4 text-gray-600">
          Contact our sales team for tailored options beyond Paradiso.
        </p>
        <button className="mt-6 btn btn-outline">Contact Sales</button>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Enter Mobile Money Number</h2>
            <input
              type="text"
              className="input mb-4"
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
    </motion.div>
  );
};

export default Subscription;