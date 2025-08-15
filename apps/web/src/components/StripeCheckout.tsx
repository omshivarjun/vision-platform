import React, { useState, useEffect } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe, stripeElementsConfig, stripeService, formatStripeAmount } from '../services/stripeService'
import { CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface StripeCheckoutProps {
  amount: number
  currency: string
  description: string
  onSuccess: (paymentIntent: any) => void
  onCancel: () => void
  customerEmail?: string
  metadata?: Record<string, string>
}

// Checkout form component
function CheckoutForm({ 
  amount, 
  currency, 
  description, 
  onSuccess, 
  onCancel, 
  customerEmail, 
  metadata 
}: StripeCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<any>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create payment intent
      const paymentIntent = await stripeService.createPaymentIntent({
        amount: formatStripeAmount(amount, currency),
        currency: currency.toLowerCase(),
        customerId: customerEmail, // Using customerId instead of customerEmail
        metadata,
      })

      if (paymentIntent.error) {
        throw new Error(paymentIntent.error.message)
      }

      // Confirm card payment
      const { error: confirmError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              email: customerEmail,
            },
          },
        }
      )

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment failed')
      }

      if (confirmedIntent.status === 'succeeded') {
        toast.success('Payment successful!')
        onSuccess(confirmedIntent)
      } else {
        throw new Error('Payment was not completed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during payment')
      toast.error(err.message || 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    if (!isProcessing) {
      onCancel()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400">Amount:</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency.toUpperCase(),
            }).format(amount)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-600 dark:text-gray-400">Description:</span>
          <span className="text-sm text-gray-900 dark:text-white">{description}</span>
        </div>
      </div>

      {/* Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1f2937',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <CheckIcon className="w-4 h-4" />
              Pay Now
            </>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Your payment information is secure and encrypted by Stripe.
      </div>
    </form>
  )
}

// Main Stripe Checkout component
export function StripeCheckout(props: StripeCheckoutProps) {
  const [stripe, setStripe] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStripe = async () => {
      try {
        const stripeInstance = await getStripe()
        setStripe(stripeInstance)
      } catch (error) {
        console.error('Failed to load Stripe:', error)
        toast.error('Failed to load payment system')
      } finally {
        setIsLoading(false)
      }
    }

    loadStripe()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading payment system...</span>
      </div>
    )
  }

  if (!stripe) {
    return (
      <div className="text-center p-8">
        <XMarkIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Payment System Unavailable
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Unable to load the payment system. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <Elements stripe={stripe} options={stripeElementsConfig}>
      <CheckoutForm {...props} />
    </Elements>
  )
}

// Quick checkout button for subscription plans
export function QuickCheckoutButton({
  priceId,
  amount,
  currency,
  description,
  onSuccess,
  className = '',
}: {
  priceId: string
  amount: number
  currency: string
  description: string
  onSuccess: (session: any) => void
  className?: string
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickCheckout = async () => {
    setIsLoading(true)
    
    try {
      const session = await stripeService.createCheckoutSession({
        priceId,
        successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
        metadata: {
          description,
          amount: amount.toString(),
          currency,
        },
      })

      if (session.url) {
        window.location.href = session.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to start checkout')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleQuickCheckout}
      disabled={isLoading}
      className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Processing...
        </>
      ) : (
        <>
          <CheckIcon className="w-4 h-4" />
          Subscribe Now
        </>
      )}
    </button>
  )
}
