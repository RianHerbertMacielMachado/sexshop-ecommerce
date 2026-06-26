import Stripe from 'stripe'
import { env } from './env'
import { logger } from './logger'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY não configurada')
    }
    stripeInstance = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
      typescript: true,
      timeout: 10000,
      maxNetworkRetries: 2,
    })
  }
  return stripeInstance
}

export function constructStripeEvent(
  rawBody: Buffer,
  signature: string
): Stripe.Event {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET não configurada')
  }
  return getStripe().webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET)
}

export interface CreateCheckoutSessionParams {
  orderId: string
  orderNumber: string
  items: Array<{
    name: string
    description?: string
    imageUrl?: string
    price: number
    quantity: number
  }>
  customerEmail?: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = params.items.map((item) => ({
    price_data: {
      currency: 'brl',
      product_data: {
        name: item.name,
        description: item.description,
        images: item.imageUrl ? [item.imageUrl] : undefined,
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }))

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      ...params.metadata,
    },
    payment_intent_data: {
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
      },
    },
    locale: 'pt-BR',
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  })

  logger.info(`Stripe checkout session criada: ${session.id} para pedido ${params.orderNumber}`)
  return session
}

export async function retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe()
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent'],
  })
}

export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
  const stripe = getStripe()
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
    reason,
  })
}

export async function testStripeConnection(): Promise<boolean> {
  try {
    const stripe = getStripe()
    await stripe.balance.retrieve()
    return true
  } catch (error) {
    logger.error('Stripe connection test failed:', error)
    return false
  }
}
