import { Request, Response } from 'express'
import { paymentsService } from './payments.service'
import { asyncHandler, AppError } from '../../middleware/error.middleware'
import { checkoutRateLimiter } from '../../middleware/rateLimiter.middleware'

export const createStripeCheckout = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body as { orderId: string }
  if (!orderId) throw new AppError('orderId é obrigatório', 400)
  const result = await paymentsService.createStripeCheckout(orderId, req.user?.id)
  res.json({ success: true, message: 'Sessão Stripe criada', data: result })
})

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string
  if (!signature) {
    res.status(400).json({ success: false, message: 'stripe-signature header ausente' })
    return
  }
  await paymentsService.handleStripeWebhook(req.body as Buffer, signature)
  res.status(200).json({ received: true })
})

export const createPixCheckout = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body as { orderId: string }
  if (!orderId) throw new AppError('orderId é obrigatório', 400)
  const result = await paymentsService.createPixCheckout(orderId, req.user?.id)
  res.json({ success: true, message: 'PIX gerado com sucesso', data: result })
})

export const checkPixStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentsService.checkPixStatus(req.params.orderId)
  res.json({ success: true, message: 'Status do PIX consultado', data: result })
})

export const mercadoPagoWebhook = asyncHandler(async (req: Request, res: Response) => {
  await paymentsService.handleMercadoPagoWebhook(req.body as Record<string, unknown>)
  res.status(200).json({ received: true })
})

export const getPaymentMethods = asyncHandler(async (_req: Request, res: Response) => {
  const methods = await paymentsService.getActiveMethods()
  res.json({ success: true, message: 'Métodos de pagamento listados', data: { methods } })
})
