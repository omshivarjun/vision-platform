import { 
  PaymentMethod, 
  SubscriptionPlan, 
  Invoice, 
  Subscription, 
  PaymentIntent, 
  Customer, 
  BillingAddress,
  CreatePaymentIntentRequest,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  PaymentResponse
} from '@vision-platform/shared'

// Mock data for development
const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan_free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    features: [
      '100 translations per month',
      'Basic OCR processing',
      'Standard support',
      '1GB storage'
    ],
    maxUsers: 1,
    maxTranslations: 100,
    maxDocuments: 10,
    maxStorage: 1,
    isPopular: false,
    isActive: true
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    description: 'For growing teams and businesses',
    price: 29,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Unlimited translations',
      'Advanced OCR & AI features',
      'Priority support',
      '10GB storage',
      'Team collaboration',
      'Custom integrations'
    ],
    maxUsers: 5,
    maxTranslations: -1, // unlimited
    maxDocuments: 100,
    maxStorage: 10,
    isPopular: true,
    isActive: true
  },
  {
    id: 'plan_enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Everything in Pro',
      'Unlimited storage',
      'Advanced analytics',
      'Dedicated support',
      'Custom AI models',
      'SLA guarantees',
      'On-premise options'
    ],
    maxUsers: -1, // unlimited
    maxTranslations: -1, // unlimited
    maxDocuments: -1, // unlimited
    maxStorage: -1, // unlimited
    isPopular: false,
    isActive: true
  }
]

const mockCustomers: Customer[] = [
  {
    id: 'cust_001',
    email: 'user@example.com',
    name: 'John Doe',
    phone: '+1-555-0123',
    address: {
      line1: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US'
    },
    defaultPaymentMethodId: 'pm_001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_001',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expMonth: 12,
    expYear: 2025,
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub_001',
    customerId: 'cust_001',
    planId: 'plan_pro',
    status: 'active',
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
    quantity: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const mockInvoices: Invoice[] = [
  {
    id: 'inv_001',
    number: 'INV-001',
    customerId: 'cust_001',
    subscriptionId: 'sub_001',
    amount: 2900, // $29.00 in cents
    currency: 'USD',
    status: 'paid',
    dueDate: new Date().toISOString(),
    paidAt: new Date().toISOString(),
    items: [
      {
        description: 'Pro Plan - Monthly',
        quantity: 1,
        unitPrice: 2900,
        amount: 2900
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Simulate API delays
const simulateApiCall = async (delay: number = 1000) => {
  await new Promise(resolve => setTimeout(resolve, delay))
}

// Payment API Service
export const paymentApi = {
  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    await simulateApiCall(800)
    return mockSubscriptionPlans
  },

  async getSubscriptionPlan(id: string): Promise<SubscriptionPlan | null> {
    await simulateApiCall(500)
    return mockSubscriptionPlans.find(plan => plan.id === id) || null
  },

  // Customers
  async getCustomer(id: string): Promise<Customer | null> {
    await simulateApiCall(600)
    return mockCustomers.find(customer => customer.id === id) || null
  },

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    await simulateApiCall(1000)
    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      email: customerData.email || '',
      name: customerData.name || '',
      phone: customerData.phone,
      address: customerData.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockCustomers.push(newCustomer)
    return newCustomer
  },

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    await simulateApiCall(800)
    const customerIndex = mockCustomers.findIndex(c => c.id === id)
    if (customerIndex === -1) {
      throw new Error('Customer not found')
    }
    
    mockCustomers[customerIndex] = {
      ...mockCustomers[customerIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return mockCustomers[customerIndex]
  },

  // Payment Methods
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    await simulateApiCall(600)
    return mockPaymentMethods.filter(pm => pm.id === 'pm_001') // Mock: all customers share same payment method
  },

  async createPaymentMethod(paymentMethodData: Partial<PaymentMethod>): Promise<PaymentMethod> {
    await simulateApiCall(1000)
    const newPaymentMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: paymentMethodData.type || 'card',
      last4: paymentMethodData.last4,
      brand: paymentMethodData.brand,
      expMonth: paymentMethodData.expMonth,
      expYear: paymentMethodData.expYear,
      isDefault: paymentMethodData.isDefault || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    if (newPaymentMethod.isDefault) {
      mockPaymentMethods.forEach(pm => pm.isDefault = false)
    }
    
    mockPaymentMethods.push(newPaymentMethod)
    return newPaymentMethod
  },

  async updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod> {
    await simulateApiCall(800)
    const pmIndex = mockPaymentMethods.findIndex(pm => pm.id === id)
    if (pmIndex === -1) {
      throw new Error('Payment method not found')
    }
    
    mockPaymentMethods[pmIndex] = {
      ...mockPaymentMethods[pmIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return mockPaymentMethods[pmIndex]
  },

  async deletePaymentMethod(id: string): Promise<void> {
    await simulateApiCall(600)
    const pmIndex = mockPaymentMethods.findIndex(pm => pm.id === id)
    if (pmIndex === -1) {
      throw new Error('Payment method not found')
    }
    
    mockPaymentMethods.splice(pmIndex, 1)
  },

  // Subscriptions
  async getSubscriptions(customerId: string): Promise<Subscription[]> {
    await simulateApiCall(600)
    return mockSubscriptions.filter(sub => sub.customerId === customerId)
  },

  async getSubscription(id: string): Promise<Subscription | null> {
    await simulateApiCall(500)
    return mockSubscriptions.find(sub => sub.id === id) || null
  },

  async createSubscription(request: CreateSubscriptionRequest): Promise<Subscription> {
    await simulateApiCall(1500)
    const plan = mockSubscriptionPlans.find(p => p.id === request.planId)
    if (!plan) {
      throw new Error('Subscription plan not found')
    }
    
    const newSubscription: Subscription = {
      id: `sub_${Date.now()}`,
      customerId: request.customerId,
      planId: request.planId,
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
      quantity: request.quantity,
      trialStart: request.trialPeriodDays ? new Date().toISOString() : undefined,
      trialEnd: request.trialPeriodDays ? new Date(Date.now() + request.trialPeriodDays * 24 * 60 * 60 * 1000).toISOString() : undefined,
      metadata: request.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    mockSubscriptions.push(newSubscription)
    return newSubscription
  },

  async updateSubscription(id: string, updates: UpdateSubscriptionRequest): Promise<Subscription> {
    await simulateApiCall(1000)
    const subIndex = mockSubscriptions.findIndex(sub => sub.id === id)
    if (subIndex === -1) {
      throw new Error('Subscription not found')
    }
    
    mockSubscriptions[subIndex] = {
      ...mockSubscriptions[subIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return mockSubscriptions[subIndex]
  },

  async cancelSubscription(id: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
    await simulateApiCall(800)
    const subIndex = mockSubscriptions.findIndex(sub => sub.id === id)
    if (subIndex === -1) {
      throw new Error('Subscription not found')
    }
    
    mockSubscriptions[subIndex] = {
      ...mockSubscriptions[subIndex],
      cancelAtPeriodEnd,
      canceledAt: cancelAtPeriodEnd ? undefined : new Date().toISOString(),
      status: cancelAtPeriodEnd ? 'active' : 'canceled',
      updatedAt: new Date().toISOString()
    }
    
    return mockSubscriptions[subIndex]
  },

  // Payment Intents
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    await simulateApiCall(1200)
    const newPaymentIntent: PaymentIntent = {
      id: `pi_${Date.now()}`,
      amount: request.amount,
      currency: request.currency,
      status: 'requires_payment_method',
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      paymentMethodId: request.paymentMethodId,
      description: request.description,
      metadata: request.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return newPaymentIntent
  },

  async confirmPaymentIntent(id: string, paymentMethodId: string): Promise<PaymentIntent> {
    await simulateApiCall(1000)
    // Simulate payment processing
    const paymentIntent: PaymentIntent = {
      id,
      amount: 1000, // Mock amount
      currency: 'USD',
      status: 'succeeded',
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      paymentMethodId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return paymentIntent
  },

  // Invoices
  async getInvoices(customerId: string): Promise<Invoice[]> {
    await simulateApiCall(600)
    return mockInvoices.filter(inv => inv.customerId === customerId)
  },

  async getInvoice(id: string): Promise<Invoice | null> {
    await simulateApiCall(500)
    return mockInvoices.find(inv => inv.id === id) || null
  },

  // Billing
  async getBillingPortalUrl(customerId: string): Promise<string> {
    await simulateApiCall(500)
    return `https://billing.example.com/portal/${customerId}`
  },

  // Mock webhook simulation
  async simulateWebhook(eventType: string, data: any): Promise<void> {
    await simulateApiCall(300)
    console.log(`Webhook event: ${eventType}`, data)
  }
}

// Export types for convenience
export type {
  PaymentMethod,
  SubscriptionPlan,
  Invoice,
  Subscription,
  PaymentIntent,
  Customer,
  BillingAddress,
  CreatePaymentIntentRequest,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  PaymentResponse
}
