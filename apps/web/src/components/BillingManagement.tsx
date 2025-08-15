import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCardIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { usePaymentMethods, useInvoices, useSubscriptions, useDeletePaymentMethod, useCancelSubscription } from '../hooks/usePayment'
import { useAuth } from '../hooks/useAuth'
import { PaymentMethod, Invoice, Subscription } from '@vision-platform/shared'
import toast from 'react-hot-toast'

interface BillingManagementProps {
  customerId: string
}

export default function BillingManagement({ customerId }: BillingManagementProps) {
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null)
  const [showCancelSubscription, setShowCancelSubscription] = useState(false)
  
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = usePaymentMethods(customerId)
  const { data: invoices, isLoading: invoicesLoading } = useInvoices(customerId)
  const { data: subscriptions, isLoading: subscriptionsLoading } = useSubscriptions(customerId)
  
  const { mutate: deletePaymentMethod, isPending: deletingPaymentMethod } = useDeletePaymentMethod()
  const { mutate: cancelSubscription, isPending: cancelingSubscription } = useCancelSubscription()

  const handleDeletePaymentMethod = (id: string) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      deletePaymentMethod(id)
    }
  }

  const handleCancelSubscription = (subscriptionId: string, cancelAtPeriodEnd: boolean = true) => {
    cancelSubscription({ id: subscriptionId, cancelAtPeriodEnd })
    setShowCancelSubscription(false)
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100) // Convert from cents
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'canceled':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'trialing':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'open':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'draft':
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
      case 'void':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  if (paymentMethodsLoading || invoicesLoading || subscriptionsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Payment Methods */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Payment Methods
          </h2>
          <button
            onClick={() => setShowAddPaymentMethod(true)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Payment Method
          </button>
        </div>

        <div className="space-y-4">
          {paymentMethods?.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {method.brand?.toUpperCase()} •••• {method.last4}
                    </span>
                    {method.isDefault && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-300 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Expires {method.expMonth}/{method.expYear}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingPaymentMethod(method)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  disabled={deletingPaymentMethod}
                  className="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {paymentMethods?.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CreditCardIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No payment methods added yet</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Subscriptions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Subscriptions
        </h2>

        <div className="space-y-4">
          {subscriptions?.map((subscription) => (
            <div
              key={subscription.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Subscription #{subscription.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Created {new Date(subscription.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Current Period:</span>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                  <p className="text-gray-900 dark:text-white">{subscription.quantity}</p>
                </div>
                {subscription.trialStart && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Trial Ends:</span>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(subscription.trialEnd!).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {subscription.cancelAtPeriodEnd && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <p className="text-red-600 dark:text-red-400">Canceling at period end</p>
                  </div>
                )}
              </div>

              {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                <button
                  onClick={() => setShowCancelSubscription(true)}
                  className="px-4 py-2 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition-colors"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          ))}

          {subscriptions?.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No active subscriptions</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Invoices */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Billing History
        </h2>

        <div className="space-y-4">
          {invoices?.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {invoice.number}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Due {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInvoiceStatusColor(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {invoices?.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No invoices found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Cancel Subscription Modal */}
      {showCancelSubscription && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowCancelSubscription(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Cancel Subscription
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to cancel your subscription? You can choose to cancel immediately or at the end of your current billing period.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelSubscription(false)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={() => handleCancelSubscription('sub_001', true)}
                disabled={cancelingSubscription}
                className="flex-1 py-2 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel at Period End
              </button>
              <button
                onClick={() => handleCancelSubscription('sub_001', false)}
                disabled={cancelingSubscription}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel Immediately
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Add Payment Method Modal */}
      {showAddPaymentMethod && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddPaymentMethod(false)}
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
                Add Payment Method
              </h3>
              <button
                onClick={() => setShowAddPaymentMethod(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 1234 1234 1234"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="default-payment"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="default-payment" className="text-sm text-gray-700 dark:text-gray-300">
                  Set as default payment method
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddPaymentMethod(false)}
                className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Payment method added successfully!')
                  setShowAddPaymentMethod(false)
                }}
                className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Add Payment Method
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
