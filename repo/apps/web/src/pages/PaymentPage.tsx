import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { StripeCheckout } from '../components/payment/StripeCheckout';
import toast from 'react-hot-toast';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  popular?: boolean;
}

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const pricingPlans: PricingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'usd',
      interval: 'month',
      features: [
        '100 translations per month',
        'Basic OCR functionality',
        'Standard voice synthesis',
        'Community support',
        'Basic accessibility features'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 1999, // $19.99
      currency: 'usd',
      interval: 'month',
      popular: true,
      features: [
        'Unlimited translations',
        'Advanced OCR with 99% accuracy',
        'Premium voice synthesis',
        'Real-time conversation mode',
        'Advanced accessibility features',
        'Priority support',
        'API access',
        'Custom glossaries'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 9999, // $99.99
      currency: 'usd',
      interval: 'month',
      features: [
        'Everything in Pro',
        'White-label solution',
        'Custom AI model training',
        'Dedicated support team',
        'SLA guarantees',
        'Advanced analytics',
        'Custom integrations',
        'On-premise deployment'
      ]
    }
  ];

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setPaymentStatus('idle');
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    setPaymentStatus('success');
    toast.success('Payment successful! Welcome to Vision Platform Pro!');
    
    // TODO: Update user subscription status
    console.log('Payment successful:', paymentIntent);
  };

  const handlePaymentError = (error: any) => {
    setPaymentStatus('error');
    console.error('Payment failed:', error);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price / 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
          >
            <CreditCardIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            💳 Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Unlock the full power of Vision Platform with advanced AI features and unlimited access.
          </p>
        </div>

        {!selectedPlan ? (
          /* Pricing Plans */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price === 0 ? 'Free' : formatPrice(plan.price, plan.currency)}
                    {plan.price > 0 && (
                      <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
                        /{plan.interval}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.price === 0 ? 'Get Started Free' : 'Choose Plan'}
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Checkout Form */
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Complete Your Purchase
                </h2>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ← Back to Plans
                </button>
              </div>

              {paymentStatus === 'success' ? (
                <div className="text-center py-12">
                  <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Welcome to Vision Platform {selectedPlan.name}! Your subscription is now active.
                  </p>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) : paymentStatus === 'error' ? (
                <div className="text-center py-12">
                  <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Payment Failed
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    There was an issue processing your payment. Please try again.
                  </p>
                  <button
                    onClick={() => setPaymentStatus('idle')}
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <StripeCheckout
                  amount={selectedPlan.price}
                  currency={selectedPlan.currency}
                  description={`Vision Platform ${selectedPlan.name} - ${selectedPlan.interval}ly subscription`}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
            </motion.div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Secure Payment Processing
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Your payment information is processed securely by Stripe. We never store your credit card details on our servers.
                  All transactions are encrypted and PCI DSS compliant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}