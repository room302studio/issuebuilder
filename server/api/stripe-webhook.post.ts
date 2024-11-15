import Stripe from 'stripe'
import { H3Event } from 'h3'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export default defineEventHandler(async (event: H3Event) => {
  try {
    const signature = getHeader(event, 'stripe-signature')
    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    const rawBody = await readRawBody(event)
    if (!rawBody) {
      throw new Error('No body found')
    }

    // Verify the webhook signature
    const stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      STRIPE_WEBHOOK_SECRET!
    )

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        // Handle successful payment
        // You might want to update user status, send confirmation emails, etc.
        console.log('Payment successful for session:', session.id)
        break

      case 'payment_intent.succeeded':
        const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent
        console.log('Payment succeeded:', paymentIntent.id)
        break

      // Add other webhook events as needed
    }

    return { received: true }
  } catch (err) {
    console.error('Stripe webhook error:', err)
    throw createError({
      statusCode: 400,
      statusMessage: 'Webhook Error',
      message: err instanceof Error ? err.message : 'Unknown error'
    })
  }
}) 