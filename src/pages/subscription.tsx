import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, MessageSquare, Mail, Phone } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    sms: number;
    email: number;
    voice: number;
  };
  isPopular?: boolean;
}

interface SubscriptionDetails {
  planId: string;
  smsUsed: number;
  emailUsed: number;
  voiceUsed: number;
}

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    features: [
      'Basic SMS API access',
      'Email support',
      'Basic analytics',
      'Single user account'
    ],
    limits: {
      sms: 1000,
      email: 5000,
      voice: 100
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    interval: 'month',
    features: [
      'Advanced SMS & Email API',
      'Priority support',
      'Advanced analytics',
      'Up to 5 team members',
      'Custom integrations'
    ],
    limits: {
      sms: 5000,
      email: 20000,
      voice: 500
    },
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    interval: 'month',
    features: [
      'Full API access',
      '24/7 phone support',
      'Enterprise analytics',
      'Unlimited team members',
      'Custom integrations',
      'Dedicated account manager'
    ],
    limits: {
      sms: 20000,
      email: 100000,
      voice: 2000
    }
  }
];

const Subscription = () => {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');

  useEffect(() => {
    // Fetch subscription details from the backend
    const fetchSubscriptionDetails = async () => {
      // Replace with actual API call
      const details: SubscriptionDetails = {
        planId: 'professional',
        smsUsed: 1200,
        emailUsed: 8000,
        voiceUsed: 200
      };
      setSubscriptionDetails(details);
    };

    fetchSubscriptionDetails();
  }, []);

  const handleSubscribe = async (planId: string) => {
    setShowPaymentModal(true);
    console.log(`Subscribing to plan: ${planId}`);
  };

  const handlePayment = async () => {
    // Implement payment logic with Mia MeetPay
    console.log(`Paying with mobile money number: ${mobileMoneyNumber}`);
    setShowPaymentModal(false);
  };

  const currentPlan = plans.find(plan => plan.id === subscriptionDetails?.planId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Subscription Plans</h1>
        <p className="mt-4 text-xl text-gray-600">
          Choose the perfect plan for your business
        </p>
      </div>

      {subscriptionDetails && currentPlan && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Current Subscription</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about your current subscription plan.</p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Plan</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{currentPlan.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">SMS Used</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{subscriptionDetails.smsUsed} / {currentPlan.limits.sms}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Emails Used</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{subscriptionDetails.emailUsed} / {currentPlan.limits.email}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Voice Minutes Used</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{subscriptionDetails.voiceUsed} / {currentPlan.limits.voice}</dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-8">
        <div className="relative self-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingInterval('month')}
            className={`${
              billingInterval === 'month'
                ? 'bg-white border-gray-200 shadow-sm'
                : 'border border-transparent'
            } relative w-32 rounded-md py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10`}
          >
            Monthly billing
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={`${
              billingInterval === 'year'
                ? 'bg-white border-gray-200 shadow-sm'
                : 'border border-transparent'
            } relative w-32 rounded-md py-2 text-sm font-medium whitespace-nowrap focus:outline-none focus:z-10`}
          >
            Annual billing
          </button>
        </div>
      </div>

    <div className="grid gap-8 lg:grid-cols-3 lg:gap-x-8 mt-16">
        {plans.map((plan) => (
            <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative rounded-2xl border ${
                    plan.isPopular ? 'border-primary-500' : 'border-gray-200'
                } shadow-sm flex flex-col`}
            >
                {plan.isPopular && (
                    <div className="absolute top-0 right-0 -mr-1 -mt-1 px-3 py-1 bg-primary-500 text-white text-sm font-medium rounded-full transform translate-x-1/2 -translate-y-1/2">
                        Popular
                    </div>
                )}

                <div className="p-8">
                    <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                    
                    <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-extrabold text-gray-900">
                            ${billingInterval === 'year' ? plan.price * 10 : plan.price}
                        </span>
                        <span className="ml-2 text-gray-500">/{billingInterval}</span>
                    </div>

                    <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Limits</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary-500" />
                                <span>{plan.limits.sms.toLocaleString()} SMS/month</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-5 h-5 text-primary-500" />
                                <span>{plan.limits.email.toLocaleString()} Emails/month</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-5 h-5 text-primary-500" />
                                <span>{plan.limits.voice.toLocaleString()} Voice minutes/month</span>
                            </li>
                        </ul>
                    </div>

                    <ul className="mt-6 space-y-4">
                        {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                                <Check className="w-5 h-5 text-green-500 shrink-0" />
                                <span className="ml-3 text-gray-700">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-8 mt-auto">
                    <button
                        onClick={() => handleSubscribe(plan.id)}
                        className={`w-full btn flex items-center justify-center space-x-2 ${
                            plan.isPopular ? 'btn-primary' : 'btn-secondary'
                        }`}
                    >
                        <CreditCard className="w-5 h-5" />
                        <span>Subscribe now</span>
                    </button>
                </div>
            </motion.div>
        ))}
    </div>

      <div className="mt-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">Need a custom plan?</h2>
        <p className="mt-4 text-gray-600">
          Contact our sales team for a customized solution that fits your needs.
        </p>
        <button className="mt-6 btn btn-outline">Contact Sales</button>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Enter Mobile Money Number</h2>
            <input
              type="text"
              className="input mb-4"
              value={mobileMoneyNumber}
              onChange={(e) => setMobileMoneyNumber(e.target.value)}
              placeholder="Mobile Money Number"
            />
            <button className="btn btn-primary w-full" onClick={handlePayment}>
              Pay Now
            </button>
            <button className="btn btn-secondary w-full mt-2" onClick={() => setShowPaymentModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Subscription;