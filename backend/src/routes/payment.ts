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
