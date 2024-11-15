import Stripe from 'stripe'
import { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia'
})

const PRODUCT_ID = '1e3099b8-c3f2-47aa-818c-0cef8767b25f'

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

    // Get Supabase client
    const supabase = await serverSupabaseClient(event)

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        
        // Get customer details from session
        const customerEmail = session.customer_details?.email
        if (!customerEmail) {
          throw new Error('No customer email found in session')
        }

        console.log('Processing payment for:', customerEmail)

        // 1. Find or create user
        let { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, auth_user_id')
          .eq('email', customerEmail)
          .single()

        if (userError) {
          console.log('User not found, creating new user record')
          // Create new user record if not found
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              email: customerEmail,
              auth_user_id: session.client_reference_id // If available from auth
            })
            .select()
            .single()

          if (createError) throw createError
          userData = newUser
        }

        // 2. Create purchase record
        const { error: purchaseError } = await supabase
          .from('purchases')
          .insert({
            user_id: userData.id,
            product_id: PRODUCT_ID,
            status: 'completed'
          })

        if (purchaseError) {
          console.error('Error creating purchase:', purchaseError)
          throw purchaseError
        }

        // 3. Create or update subscription (lifetime)
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userData.id,
            product_id: PRODUCT_ID,
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: null // Null for lifetime access
          }, {
            onConflict: 'user_id,product_id'
          })

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError)
          throw subscriptionError
        }

        console.log('Successfully processed payment and created records for:', customerEmail)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        // Could update purchase status if we created a pending purchase
        break
      }
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