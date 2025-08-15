import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  CloudIcon,
  CogIcon,
  ArrowRightIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { useSubscriptionPlans, useCurrentSubscription, useCurrentPlan, useBillingPortal } from '../hooks/usePayment'
import { useAuth } from '../hooks/useAuth'
import { SubscriptionPlan, PaymentMethod } from '@vision-platform/shared'
import toast from 'react-hot-toast'

export default function PaymentPage() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  
  // Mock customer ID for development
  const customerId = user?.id || 'cust_001'
  
  const { data: plans, isLoading: plansLoading } = useSubscriptionPlans()
  const { currentSubscription, hasActiveSubscription } = useCurrentSubscription(customerId)
  const { currentPlan, isFreePlan, isProPlan, isEnterprisePlan } = useCurrentPlan(customerId)
  const { mutate: openBillingPortal, isPending: openingBilling } = useBillingPortal()

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
    setShowPaymentForm(true)
  }

  const handleSubscribe = async (planId: string) => {
    // In a real implementation, this would create a payment intent
    // and redirect to Stripe Checkout or similar
    toast.success(`Redirecting to checkout for ${plans?.find(p => p.id === planId)?.name} plan`)
    // Simulate redirect
    setTimeout(() => {
      toast.success('Payment completed successfully!')
      setShowPaymentForm(false)
      setSelectedPlan(null)
    }, 2000)
  }

  const formatPrice = (price: number, interval: string) => {
    if (price === 0) return 'Free'
    const monthlyPrice = interval === 'yearly' ? price / 12 : price
    return `$${monthlyPrice.toFixed(2)}/${interval === 'yearly' ? 'mo' : 'mo'}`
  }

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    const baseFeatures = [
      'Unlimited translations',
      'Advanced OCR processing',
      'AI-powered scene analysis',
      'Voice command support',
      'Mobile app access',
      'Email support'
    ]

    switch (plan.id) {
      case 'plan_free':
        return [
          '100 translations per month',
          'Basic OCR processing',
          'Standard support',
          '1GB storage'
        ]
      case 'plan_pro':
        return [
          'Unlimited translations',
          'Advanced OCR & AI features',
          'Priority support',
          '10GB storage',
          'Team collaboration',
          'Custom integrations',
          'Advanced analytics'
        ]
      case 'plan_enterprise':
        return [
          'Everything in Pro',
          'Unlimited storage',
          'Advanced analytics',
          'Dedicated support',
          'Custom AI models',
          'SLA guarantees',
          'On-premise options',
          'White-label solutions'
        ]
      default:
        return baseFeatures
    }
  }

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading subscription plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-4"
          >
            <CreditCardIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            💳 Subscription & Billing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Choose the perfect plan for your needs. Upgrade, downgrade, or manage your subscription anytime.
          </p>
        </div>

        {/* Current Subscription Status */}
        {hasActiveSubscription && currentPlan && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Current Plan: {currentPlan.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentPlan.description}
                </p>
                {currentSubscription && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Next billing date: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => openBillingPortal(customerId)}
                  disabled={openingBilling}
                  className="flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <CogIcon className="w-4 h-4 mr-2" />
                  Manage Billing
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Yearly
              <span className="ml-1 text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-300 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans?.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow ${
                plan.isPopular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {plan.description}
                </p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(plan.price, billingCycle)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      per {billingCycle === 'yearly' ? 'year' : 'month'}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {getPlanFeatures(plan).map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={plan.id === currentPlan?.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.id === currentPlan?.id
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : plan.isPopular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                }`}
              >
                {plan.id === currentPlan?.id ? 'Current Plan' : 'Choose Plan'}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPaymentForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Complete Subscription
                </h3>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {plans?.find(p => p.id === selectedPlan)?.name} Plan
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {plans?.find(p => p.id === selectedPlan)?.description}
                  </p>
                  <div className="mt-2 text-lg font-bold text-gray-900 dark:text-white">
                    {formatPrice(
                      plans?.find(p => p.id === selectedPlan)?.price || 0,
                      billingCycle
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="1234 1234 1234 1234"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <CreditCardIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubscribe(selectedPlan)}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Subscribe Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Security & Trust */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            🔒 Secure & Trusted
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <ShieldCheckIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Bank-Level Security</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your payment information is encrypted and secure
              </p>
            </div>
            
            <div className="text-center">
              <LockClosedIcon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">PCI Compliant</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We meet the highest security standards in the industry
              </p>
            </div>
            
            <div className="text-center">
              <StarIcon className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">30-Day Guarantee</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Not satisfied? Get a full refund within 30 days
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
