import { z } from 'zod'

// Payment Method Types
export const PaymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(['card', 'bank_account', 'paypal', 'apple_pay', 'google_pay']),
  last4: z.string().optional(),
  brand: z.string().optional(),
  expMonth: z.number().optional(),
  expYear: z.number().optional(),
  isDefault: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>

// Subscription Plan Types
export const SubscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  currency: z.string().default('USD'),
  interval: z.enum(['monthly', 'yearly']),
  features: z.array(z.string()),
  maxUsers: z.number().optional(),
  maxTranslations: z.number().optional(),
  maxDocuments: z.number().optional(),
  maxStorage: z.number().optional(), // in GB
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true)
})

export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>

// Invoice Types
export const InvoiceSchema = z.object({
  id: z.string(),
  number: z.string(),
  customerId: z.string(),
  subscriptionId: z.string().optional(),
  amount: z.number(),
  currency: z.string().default('USD'),
  status: z.enum(['draft', 'open', 'paid', 'uncollectible', 'void']),
  dueDate: z.string(),
  paidAt: z.string().optional(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    amount: z.number()
  })),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Invoice = z.infer<typeof InvoiceSchema>

// Subscription Types
export const SubscriptionSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  planId: z.string(),
  status: z.enum(['active', 'canceled', 'past_due', 'unpaid', 'trialing']),
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
  cancelAtPeriodEnd: z.boolean().default(false),
  canceledAt: z.string().optional(),
  trialStart: z.string().optional(),
  trialEnd: z.string().optional(),
  quantity: z.number().default(1),
  metadata: z.record(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Subscription = z.infer<typeof SubscriptionSchema>

// Payment Intent Types
export const PaymentIntentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string().default('USD'),
  status: z.enum(['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'requires_capture', 'canceled', 'succeeded']),
  clientSecret: z.string(),
  paymentMethodId: z.string().optional(),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type PaymentIntent = z.infer<typeof PaymentIntentSchema>

// Billing Address Types
export const BillingAddressSchema = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string().optional()
})

export type BillingAddress = z.infer<typeof BillingAddressSchema>

// Customer Types
export const CustomerSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  phone: z.string().optional(),
  address: BillingAddressSchema.optional(),
  defaultPaymentMethodId: z.string().optional(),
  invoiceSettings: z.object({
    defaultPaymentMethod: z.string().optional(),
    customFields: z.record(z.string()).optional(),
    footer: z.string().optional()
  }).optional(),
  metadata: z.record(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Customer = z.infer<typeof CustomerSchema>

// Payment Request Types
export const CreatePaymentIntentRequestSchema = z.object({
  amount: z.number(),
  currency: z.string().default('USD'),
  customerId: z.string(),
  description: z.string().optional(),
  metadata: z.record(z.string()).optional(),
  paymentMethodId: z.string().optional()
})

export type CreatePaymentIntentRequest = z.infer<typeof CreatePaymentIntentRequestSchema>

export const CreateSubscriptionRequestSchema = z.object({
  customerId: z.string(),
  planId: z.string(),
  paymentMethodId: z.string(),
  quantity: z.number().default(1),
  trialPeriodDays: z.number().optional(),
  metadata: z.record(z.string()).optional()
})

export type CreateSubscriptionRequest = z.infer<typeof CreateSubscriptionRequestSchema>

export const UpdateSubscriptionRequestSchema = z.object({
  planId: z.string().optional(),
  quantity: z.number().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  metadata: z.record(z.string()).optional()
})

export type UpdateSubscriptionRequest = z.infer<typeof UpdateSubscriptionRequestSchema>

// Payment Response Types
export const PaymentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
  error: z.string().optional()
})

export type PaymentResponse = z.infer<typeof PaymentResponseSchema>

// Usage Types
export const UsageSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  subscriptionId: z.string(),
  metric: z.string(),
  quantity: z.number(),
  timestamp: z.string(),
  action: z.enum(['increment', 'set']),
  metadata: z.record(z.string()).optional()
})

export type Usage = z.infer<typeof UsageSchema>

// Webhook Types
export const WebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.any(),
  created: z.number(),
  livemode: z.boolean(),
  object: z.string(),
  pendingWebhooks: z.number(),
  request: z.object({
    id: z.string().optional(),
    idempotencyKey: z.string().optional()
  }).optional()
})

export type WebhookEvent = z.infer<typeof WebhookEventSchema>

// Export all schemas
export const PaymentSchemas = {
  PaymentMethod: PaymentMethodSchema,
  SubscriptionPlan: SubscriptionPlanSchema,
  Invoice: InvoiceSchema,
  Subscription: SubscriptionSchema,
  PaymentIntent: PaymentIntentSchema,
  BillingAddress: BillingAddressSchema,
  Customer: CustomerSchema,
  CreatePaymentIntentRequest: CreatePaymentIntentRequestSchema,
  CreateSubscriptionRequest: CreateSubscriptionRequestSchema,
  UpdateSubscriptionRequest: UpdateSubscriptionRequestSchema,
  PaymentResponse: PaymentResponseSchema,
  Usage: UsageSchema,
  WebhookEvent: WebhookEventSchema
}
