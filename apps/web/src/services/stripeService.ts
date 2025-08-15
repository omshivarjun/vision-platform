import { loadStripe, Stripe } from '@stripe/stripe-js'

// Stripe configuration
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_example'

// Load Stripe instance
let stripePromise: Promise<Stripe | null> | null = null

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

// Stripe API service
export const stripeService = {
  // Create checkout session
  async createCheckoutSession(params: {
    priceId: string
    successUrl: string
    cancelUrl: string
    customerEmail?: string
    metadata?: Record<string, string>
  }) {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const session = await response.json()
      return session
    } catch (error) {
      console.error('Error creating checkout session:', error)
      throw error
    }
  },

  // Create payment intent
  async createPaymentIntent(params: {
    amount: number
    currency: string
    customerId?: string
    metadata?: Record<string, string>
  }) {
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const paymentIntent = await response.json()
      return paymentIntent
    } catch (error) {
      console.error('Error creating payment intent:', error)
      throw error
    }
  },

  // Retrieve payment intent
  async retrievePaymentIntent(paymentIntentId: string) {
    try {
      const response = await fetch(`/api/payment-intents/${paymentIntentId}`)
      
      if (!response.ok) {
        throw new Error('Failed to retrieve payment intent')
      }

      const paymentIntent = await response.json()
      return paymentIntent
    } catch (error) {
      console.error('Error retrieving payment intent:', error)
      throw error
    }
  },

  // Confirm payment intent
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string) {
    try {
      const response = await fetch(`/api/payment-intents/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethodId }),
      })

      if (!response.ok) {
        throw new Error('Failed to confirm payment intent')
      }

      const paymentIntent = await response.json()
      return paymentIntent
    } catch (error) {
      console.error('Error confirming payment intent:', error)
      throw error
    }
  },

  // Create customer portal session
  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, returnUrl }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const session = await response.json()
      return session
    } catch (error) {
      console.error('Error creating portal session:', error)
      throw error
    }
  },

  // Handle webhook events
  async handleWebhook(event: any, signature: string) {
    try {
      const response = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Stripe-Signature': signature,
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        throw new Error('Webhook handling failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Error handling webhook:', error)
      throw error
    }
  }
}

// Stripe Elements configuration
export const stripeElementsConfig = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#3b82f6',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  },
  loader: 'always' as const,
}

// Payment method types
export const PAYMENT_METHOD_TYPES = {
  CARD: 'card',
  BANK_ACCOUNT: 'bank_account',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
} as const

// Payment status types
export const PAYMENT_STATUS = {
  REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
  REQUIRES_CONFIRMATION: 'requires_confirmation',
  REQUIRES_ACTION: 'requires_action',
  PROCESSING: 'processing',
  REQUIRES_CAPTURE: 'requires_capture',
  CANCELED: 'canceled',
  SUCCEEDED: 'succeeded',
} as const

// Error handling
export class StripeError extends Error {
  constructor(
    message: string,
    public code: string,
    public declineCode?: string,
    public param?: string
  ) {
    super(message)
    this.name = 'StripeError'
  }
}

// Utility functions
export const formatStripeAmount = (amount: number, currency: string = 'usd') => {
  const currencies = {
    usd: 100,
    eur: 100,
    gbp: 100,
    jpy: 1,
  }
  
  const divisor = currencies[currency.toLowerCase() as keyof typeof currencies] || 100
  return Math.round(amount * divisor)
}

export const unformatStripeAmount = (amount: number, currency: string = 'usd') => {
  const currencies = {
    usd: 100,
    eur: 100,
    gbp: 100,
    jpy: 1,
  }
  
  const divisor = currencies[currency.toLowerCase() as keyof typeof currencies] || 100
  return amount / divisor
}
