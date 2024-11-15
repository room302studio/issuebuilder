import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia'
})

export default defineEventHandler(async (event) => {
  try {
    console.log('Creating checkout session with secret key:', process.env.STRIPE_SECRET_KEY?.slice(0, 10) + '...')
    
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Issue Builder - Lifetime Access',
              description: 'Full access to all features, forever'
            },
            unit_amount: 8000, // $80.00
          },
          quantity: 1
        },
      ],
      mode: 'payment',
      success_url: `${process.env.SITE_URL}/checkout/success`,
      cancel_url: `${process.env.SITE_URL}/checkout/cancel`,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      metadata: {
        source: 'issuebuilder'
      }
    })

    console.log('Created session:', session.id)
    console.log('Checkout URL:', session.url)

    if (!session.url) {
      throw new Error('Stripe session created but no URL returned')
    }

    return { url: session.url }
  } catch (err) {
    console.error('Detailed checkout error:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error creating checkout session',
      data: err instanceof Error ? err.message : 'Unknown error'
    })
  }
}) 