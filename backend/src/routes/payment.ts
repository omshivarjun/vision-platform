import express from 'express'
import Stripe from 'stripe'

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2023-10-16',
})

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl, customerEmail } = req.body

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
    })

    res.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ error: 'Payment session creation failed' })
  }
})

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, customerId, metadata } = req.body

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      metadata,
    })

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ error: 'Payment intent creation failed' })
  }
})

// Confirm payment intent
router.post('/confirm-payment-intent/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    res.json({ status: paymentIntent.status })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ error: 'Payment confirmation failed' })
  }
})

// Get payment intent
router.get('/payment-intent/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    })
  } catch (error) {
    console.error('Stripe error:', error)
    res.status(500).json({ error: 'Payment intent retrieval failed' })
  }
})

export default router

// Webhook endpoint (stub)
// TODO: Verify Stripe signature and update subscription records accordingly
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'] as string
    // In test/dev, skip verification if secret not present
    let event: Stripe.Event | undefined
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    }
    // TODO: Update subscription records by event type
    // switch (event?.type) { case 'customer.subscription.updated': ... }
    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return res.status(400).send(`Webhook Error`)
  }
})
