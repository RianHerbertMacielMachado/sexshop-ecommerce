import { prisma } from '../../lib/prisma'
import { AppError, NotFoundError } from '../../middleware/error.middleware'
import { createCheckoutSession, constructStripeEvent, createRefund } from '../../lib/stripe'
import { createPixPayment, getPixPaymentStatus } from '../../lib/mercadopago'
import { ordersService } from '../orders/orders.service'
import { env } from '../../lib/env'
import { logger } from '../../lib/logger'
import Stripe from 'stripe'

export class PaymentsService {
  async createStripeCheckout(orderId: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: { select: { email: true } } },
    })

    if (!order) throw new NotFoundError('Pedido')

    if (userId && order.userId && order.userId !== userId) {
      throw new AppError('Acesso negado a este pedido', 403)
    }

    if (order.paymentStatus === 'PAID') {
      throw new AppError('Este pedido já foi pago', 400)
    }

    const session = await createCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      items: order.items.map((item) => ({
        name: item.productName,
        variantName: item.variantName ?? undefined,
        imageUrl: undefined,
        price: Number(item.price),
        quantity: item.quantity,
      })),
      customerEmail: order.guestEmail ?? order.user?.email,
      successUrl: `${env.FRONTEND_URL}/checkout/sucesso?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${env.FRONTEND_URL}/checkout?orderId=${order.id}&cancelled=true`,
    })

    await prisma.order.update({
      where: { id: orderId },
      data: { stripeSessionId: session.id },
    })

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
    }
  }

  async handleStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    let event: Stripe.Event

    try {
      event = constructStripeEvent(rawBody, signature)
    } catch (err) {
      logger.error('Stripe webhook signature verification failed:', err)
      throw new AppError('Assinatura do webhook inválida', 400)
    }

    logger.info(`Stripe webhook recebido: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId
        if (!orderId) break

        await ordersService.confirmPayment(orderId, {
          stripeSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id,
        })
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const order = await prisma.order.findFirst({
          where: { stripeSessionId: paymentIntent.id },
        })
        if (order) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'FAILED',
              statusHistory: { create: { status: 'CANCELLED', comment: 'Pagamento falhou' } },
            },
          })
          logger.info(`Pagamento falhou para pedido ${order.orderNumber}`)
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id

        if (paymentIntentId) {
          const order = await prisma.order.findFirst({
            where: { stripeSessionId: paymentIntentId },
          })
          if (order) {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                status: 'REFUNDED',
                paymentStatus: 'REFUNDED',
                statusHistory: { create: { status: 'REFUNDED', comment: 'Reembolso processado via Stripe' } },
              },
            })
          }
        }
        break
      }

      default:
        logger.info(`Evento Stripe não tratado: ${event.type}`)
    }
  }

  async createPixCheckout(orderId: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { email: true, name: true, cpf: true } } },
    })

    if (!order) throw new NotFoundError('Pedido')

    if (userId && order.userId && order.userId !== userId) {
      throw new AppError('Acesso negado a este pedido', 403)
    }

    if (order.paymentStatus === 'PAID') {
      throw new AppError('Este pedido já foi pago', 400)
    }

    if (order.mpPaymentId) {
      const status = await getPixPaymentStatus(order.mpPaymentId)
      if (!status.isPaid) {
        const existing = await prisma.order.findUnique({ where: { id: orderId } })
        return existing
      }
    }

    const customerEmail = order.guestEmail ?? order.user?.email ?? 'cliente@email.com'
    const customerName = order.guestName ?? order.user?.name ?? 'Cliente'

    const pixData = await createPixPayment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: Number(order.total),
      customerEmail,
      customerName,
      customerCpf: order.user?.cpf ?? undefined,
      description: `Pedido ${order.orderNumber} — Minha Sexy Shop`,
    })

    await prisma.order.update({
      where: { id: orderId },
      data: { mpPaymentId: pixData.mpPaymentId },
    })

    return pixData
  }

  async checkPixStatus(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundError('Pedido')

    if (order.paymentStatus === 'PAID') {
      return { isPaid: true, status: 'PAID', orderId }
    }

    if (!order.mpPaymentId) {
      return { isPaid: false, status: 'PENDING', orderId }
    }

    const status = await getPixPaymentStatus(order.mpPaymentId)

    if (status.isPaid && order.paymentStatus !== 'REFUNDED') {
      await ordersService.confirmPayment(orderId, { mpPaymentId: order.mpPaymentId })
      return { isPaid: true, status: 'PAID', orderId }
    }

    return { isPaid: false, status: status.status, orderId }
  }

  async handleMercadoPagoWebhook(body: Record<string, unknown>): Promise<void> {
    const type = body.type as string
    const dataId = (body.data as { id?: string })?.id

    if (type !== 'payment' || !dataId) return

    try {
      const status = await getPixPaymentStatus(dataId)

      if (status.isPaid) {
        const order = await prisma.order.findFirst({
          where: { mpPaymentId: dataId },
        })
        if (order && order.paymentStatus !== 'PAID') {
          await ordersService.confirmPayment(order.id, { mpPaymentId: dataId })
        }
      }
    } catch (error) {
      logger.error('Erro ao processar webhook Mercado Pago:', error)
    }
  }

  async getActiveMethods() {
    return prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        instructions: true,
        icon: true,
        order: true,
      },
    })
  }
}

export const paymentsService = new PaymentsService()
