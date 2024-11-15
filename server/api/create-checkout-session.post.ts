import { defineEventHandler } from 'h3'
import Stripe from 'stripe'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecret, {
    apiVersion: '2024-10-28.acacia'
  })
  
  const body = await readBody(event)
  
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product: body.productId,
            unit_amount: 8000, // $80.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
    })

    return session
  } catch (error) {
    if (error instanceof Error) {
      throw createError({
        statusCode: 500,
        message: error.message
      })
    }
    throw createError({
      statusCode: 500,
      message: 'An unknown error occurred'
    })
  }
}) 