import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentApi } from '../services/paymentApi'
import { 
  SubscriptionPlan, 
  Customer, 
  PaymentMethod, 
  Subscription, 
  Invoice,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest
} from '@vision-platform/shared'
import toast from 'react-hot-toast'

// Query keys
export const paymentQueryKeys = {
  all: ['payment'] as const,
  plans: () => [...paymentQueryKeys.all, 'plans'] as const,
  plan: (id: string) => [...paymentQueryKeys.plans(), id] as const,
  customers: () => [...paymentQueryKeys.all, 'customers'] as const,
  customer: (id: string) => [...paymentQueryKeys.customers(), id] as const,
  paymentMethods: (customerId: string) => [...paymentQueryKeys.all, 'paymentMethods', customerId] as const,
  subscriptions: (customerId: string) => [...paymentQueryKeys.all, 'subscriptions', customerId] as const,
  subscription: (id: string) => [...paymentQueryKeys.all, 'subscriptions', id] as const,
  invoices: (customerId: string) => [...paymentQueryKeys.all, 'invoices', customerId] as const,
  invoice: (id: string) => [...paymentQueryKeys.all, 'invoices', id] as const,
}

// Subscription Plans
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: paymentQueryKeys.plans(),
    queryFn: paymentApi.getSubscriptionPlans,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSubscriptionPlan = (id: string) => {
  return useQuery({
    queryKey: paymentQueryKeys.plan(id),
    queryFn: () => paymentApi.getSubscriptionPlan(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Customers
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: paymentQueryKeys.customer(id),
    queryFn: () => paymentApi.getCustomer(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: paymentApi.createCustomer,
    onSuccess: (newCustomer) => {
      queryClient.setQueryData(paymentQueryKeys.customer(newCustomer.id), newCustomer)
      toast.success('Customer created successfully!')
    },
    onError: (error) => {
      console.error('Error creating customer:', error)
      toast.error('Failed to create customer')
    }
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Customer> }) =>
      paymentApi.updateCustomer(id, updates),
    onSuccess: (updatedCustomer) => {
      queryClient.setQueryData(paymentQueryKeys.customer(updatedCustomer.id), updatedCustomer)
      toast.success('Customer updated successfully!')
    },
    onError: (error) => {
      console.error('Error updating customer:', error)
      toast.error('Failed to update customer')
    }
  })
}

// Payment Methods
export const usePaymentMethods = (customerId: string) => {
  return useQuery({
    queryKey: paymentQueryKeys.paymentMethods(customerId),
    queryFn: () => paymentApi.getPaymentMethods(customerId),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000,
  })
}

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: paymentApi.createPaymentMethod,
    onSuccess: (newPaymentMethod) => {
      // Invalidate payment methods queries to refetch
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all })
      toast.success('Payment method added successfully!')
    },
    onError: (error) => {
      console.error('Error creating payment method:', error)
      toast.error('Failed to add payment method')
    }
  })
}

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PaymentMethod> }) =>
      paymentApi.updatePaymentMethod(id, updates),
    onSuccess: (updatedPaymentMethod) => {
      // Invalidate payment methods queries to refetch
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all })
      toast.success('Payment method updated successfully!')
    },
    onError: (error) => {
      console.error('Error updating payment method:', error)
      toast.error('Failed to update payment method')
    }
  })
}

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: paymentApi.deletePaymentMethod,
    onSuccess: () => {
      // Invalidate payment methods queries to refetch
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all })
      toast.success('Payment method removed successfully!')
    },
    onError: (error) => {
      console.error('Error deleting payment method:', error)
      toast.error('Failed to remove payment method')
    }
  })
}

// Subscriptions
export const useSubscriptions = (customerId: string) => {
  return useQuery({
    queryKey: paymentQueryKeys.subscriptions(customerId),
    queryFn: () => paymentApi.getSubscriptions(customerId),
    enabled: !!customerId,
    staleTime: 2 * 60 * 1000,
  })
}

export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: paymentQueryKeys.subscription(id),
    queryFn: () => paymentApi.getSubscription(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export const useCreateSubscription = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: paymentApi.createSubscription,
    onSuccess: (newSubscription) => {
      // Invalidate subscriptions queries to refetch
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all })
      toast.success('Subscription created successfully!')
    },
    onError: (error) => {
      console.error('Error creating subscription:', error)
      toast.error('Failed to create subscription')
    }
  })
}

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateSubscriptionRequest }) =>
      paymentApi.updateSubscription(id, updates),
    onSuccess: (updatedSubscription) => {
      queryClient.setQueryData(paymentQueryKeys.subscription(updatedSubscription.id), updatedSubscription)
      // Invalidate subscriptions queries to refetch
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all })
      toast.success('Subscription updated successfully!')
    },
    onError: (error) => {
      console.error('Error updating subscription:', error)
      toast.error('Failed to update subscription')
    }
  })
}

export const useCancelSubscription = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, cancelAtPeriodEnd }: { id: string; cancelAtPeriodEnd?: boolean }) =>
      paymentApi.cancelSubscription(id, cancelAtPeriodEnd),
    onSuccess: (canceledSubscription) => {
      queryClient.setQueryData(paymentQueryKeys.subscription(canceledSubscription.id), canceledSubscription)
      // Invalidate subscriptions queries to refetch
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.all })
      
      if (canceledSubscription.cancelAtPeriodEnd) {
        toast.success('Subscription will be canceled at the end of the current period')
      } else {
        toast.success('Subscription canceled successfully')
      }
    },
    onError: (error) => {
      console.error('Error canceling subscription:', error)
      toast.error('Failed to cancel subscription')
    }
  })
}

// Invoices
export const useInvoices = (customerId: string) => {
  return useQuery({
    queryKey: paymentQueryKeys.invoices(customerId),
    queryFn: () => paymentApi.getInvoices(customerId),
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000,
  })
}

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: paymentQueryKeys.invoice(id),
    queryFn: () => paymentApi.getInvoice(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Payment Intents
export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: paymentApi.createPaymentIntent,
    onError: (error) => {
      console.error('Error creating payment intent:', error)
      toast.error('Failed to create payment intent')
    }
  })
}

export const useConfirmPaymentIntent = () => {
  return useMutation({
    mutationFn: ({ id, paymentMethodId }: { id: string; paymentMethodId: string }) =>
      paymentApi.confirmPaymentIntent(id, paymentMethodId),
    onSuccess: () => {
      toast.success('Payment processed successfully!')
    },
    onError: (error) => {
      console.error('Error confirming payment intent:', error)
      toast.error('Payment failed. Please try again.')
    }
  })
}

// Billing Portal
export const useBillingPortal = () => {
  return useMutation({
    mutationFn: paymentApi.getBillingPortalUrl,
    onSuccess: (url) => {
      window.open(url, '_blank')
    },
    onError: (error) => {
      console.error('Error getting billing portal URL:', error)
      toast.error('Failed to open billing portal')
    }
  })
}

// Utility hook for getting current user's subscription
export const useCurrentSubscription = (customerId: string) => {
  const { data: subscriptions } = useSubscriptions(customerId)
  
  return {
    currentSubscription: subscriptions?.find(sub => 
      ['active', 'trialing'].includes(sub.status)
    ),
    isLoading: !subscriptions,
    hasActiveSubscription: subscriptions?.some(sub => 
      ['active', 'trialing'].includes(sub.status)
    ) || false
  }
}

// Utility hook for getting current user's plan
export const useCurrentPlan = (customerId: string) => {
  const { currentSubscription } = useCurrentSubscription(customerId)
  const { data: plan } = useSubscriptionPlan(currentSubscription?.planId || '')
  
  return {
    currentPlan: plan,
    isLoading: !plan,
    isFreePlan: plan?.price === 0,
    isProPlan: plan?.id === 'plan_pro',
    isEnterprisePlan: plan?.id === 'plan_enterprise'
  }
}
